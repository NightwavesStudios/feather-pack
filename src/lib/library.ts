import type { Category, GearItem, Library, Pack, Unit } from "../types";
import { createId } from "./ids";
import { seedPacks } from "./seed";

const STORAGE_KEY = "feather.library.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function starterLibrary(): Library {
  const packs = seedPacks();
  return {
    version: 1,
    unit: "metric",
    activePackId: packs[0]?.id ?? null,
    packs,
  };
}

function normalizeItem(raw: unknown): GearItem | null {
  if (!isRecord(raw)) return null;
  const name = typeof raw.name === "string" ? raw.name : "";
  if (!name.trim()) return null;

  const grams = typeof raw.grams === "number" && Number.isFinite(raw.grams)
    ? Math.max(0, Math.round(raw.grams))
    : 0;
  const qty = typeof raw.qty === "number" && Number.isFinite(raw.qty)
    ? Math.min(999, Math.max(1, Math.round(raw.qty)))
    : 1;

  return {
    id: typeof raw.id === "string" ? raw.id : createId("item"),
    name: name.trim(),
    grams,
    qty,
    worn: raw.worn === true,
    consumable: raw.consumable === true,
  };
}

function normalizeCategory(raw: unknown): Category | null {
  if (!isRecord(raw)) return null;
  const name = typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : "Untitled category";
  const items = Array.isArray(raw.items)
    ? raw.items.map(normalizeItem).filter((item): item is GearItem => item !== null)
    : [];
  return {
    id: typeof raw.id === "string" ? raw.id : createId("cat"),
    name,
    items,
  };
}

function normalizePack(raw: unknown): Pack | null {
  if (!isRecord(raw)) return null;
  const categories = Array.isArray(raw.categories)
    ? raw.categories.map(normalizeCategory).filter((category): category is Category => category !== null)
    : [];
  return {
    id: typeof raw.id === "string" ? raw.id : createId("pack"),
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : "Imported pack",
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : Date.now(),
    categories,
  };
}

export function loadLibrary(): Library {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return starterLibrary();
  }
  if (!raw) return starterLibrary();

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !Array.isArray(parsed.packs)) return starterLibrary();

    const packs = parsed.packs
      .map(normalizePack)
      .filter((pack): pack is Pack => pack !== null);
    const activePackId =
      typeof parsed.activePackId === "string" && packs.some((pack) => pack.id === parsed.activePackId)
        ? parsed.activePackId
        : packs[0]?.id ?? null;
    const unit: Unit = parsed.unit === "imperial" ? "imperial" : "metric";

    return { version: 1, unit, activePackId, packs };
  } catch {
    return starterLibrary();
  }
}

export function saveLibrary(library: Library): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
  } catch {
    // Storage can be full or blocked; the app keeps working in memory.
  }
}

export function downloadBackup(library: Library): void {
  const payload = {
    app: "feather",
    version: 1,
    exportedAt: new Date().toISOString(),
    unit: library.unit,
    packs: library.packs,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `feather-backup-${date}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Reads a Feather backup (or a bare pack / array of packs), preserving pack ids. */
export function readBackupFile(text: string): Pack[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  let candidates: unknown[] = [];
  if (Array.isArray(data)) {
    candidates = data;
  } else if (isRecord(data)) {
    if (Array.isArray(data.packs)) candidates = data.packs;
    else if (Array.isArray(data.lists)) candidates = data.lists;
    else if (Array.isArray(data.categories)) candidates = [data];
  }

  if (candidates.length === 0) {
    throw new Error("That file doesn't look like a Feather backup.");
  }

  const packs = candidates
    .map(normalizePack)
    .filter((pack): pack is Pack => pack !== null);

  if (packs.length === 0) {
    throw new Error("No packs could be read from that file.");
  }

  return packs;
}

/**
 * Restores packs by id (or name for backups from before ids existed), updating
 * matching packs instead of appending duplicates on every restore.
 */
export function mergePacks(
  current: Pack[],
  incoming: Pack[],
): { packs: Pack[]; added: number; updated: number } {
  const merged = [...current];
  const addedPacks: Pack[] = [];
  let updated = 0;

  const matches = (pack: Pack, candidate: Pack) =>
    pack.id === candidate.id || pack.name.trim().toLowerCase() === candidate.name.trim().toLowerCase();

  for (const pack of incoming) {
    const existingIndex = merged.findIndex((entry) => matches(entry, pack));
    if (existingIndex >= 0) {
      merged[existingIndex] = pack;
      updated += 1;
      continue;
    }
    if (!addedPacks.some((entry) => matches(entry, pack))) {
      addedPacks.push(pack);
    }
  }

  return { packs: [...addedPacks, ...merged], added: addedPacks.length, updated };
}
