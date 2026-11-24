import type { Pack, Totals, Unit } from "../types";

export const GRAMS_PER_OUNCE = 28.349523125;
const GRAMS_PER_POUND = GRAMS_PER_OUNCE * 16;

const UNIT_ALIASES: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilo: 1000,
  kilos: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: GRAMS_PER_OUNCE,
  ounce: GRAMS_PER_OUNCE,
  ounces: GRAMS_PER_OUNCE,
  lb: GRAMS_PER_POUND,
  lbs: GRAMS_PER_POUND,
  pound: GRAMS_PER_POUND,
  pounds: GRAMS_PER_POUND,
};

/**
 * Accepts "450", "450 g", "1.2 kg", "12 oz", "1 lb 2 oz", "2,4kg".
 * Bare numbers use the current display unit. Returns grams, or null if invalid.
 */
export function parseWeight(raw: string, defaultUnit: Unit): number | null {
  const text = raw.trim().toLowerCase().replace(/,/g, ".");
  if (!text) return 0;
  if (text.startsWith("-")) return null;

  const matches = [...text.matchAll(/(\d+(?:\.\d+)?)\s*([a-z]+)?/g)];
  if (matches.length === 0) return null;

  let grams = 0;
  let bare = 0;
  let sawUnit = false;

  for (const match of matches) {
    const value = Number(match[1]);
    if (!Number.isFinite(value)) return null;
    const token = match[2];
    if (token) {
      const factor = UNIT_ALIASES[token];
      if (!factor) return null;
      grams += value * factor;
      sawUnit = true;
    } else {
      bare += value;
    }
  }

  if (!sawUnit) return Math.round(bare);
  grams += bare * (defaultUnit === "metric" ? 1 : GRAMS_PER_OUNCE);
  return Math.round(grams);
}

export function formatWeight(grams: number, unit: Unit): string {
  if (unit === "metric") {
    const value = Math.round(grams);
    return value >= 1000
      ? `${(value / 1000).toFixed(2)} kg`
      : `${value} g`;
  }
  const ounces = grams / GRAMS_PER_OUNCE;
  const roundedOunces = Math.round(ounces * 10) / 10;
  return roundedOunces >= 16
    ? `${(ounces / 16).toFixed(2)} lb`
    : `${roundedOunces.toFixed(1)} oz`;
}

/** The editable number shown inside a weight field, in the current unit. */
export function formatWeightInput(grams: number, unit: Unit): string {
  if (!grams) return "";
  if (unit === "metric") return String(Math.round(grams));
  return String(Math.round((grams / GRAMS_PER_OUNCE) * 10) / 10);
}

export function unitSuffix(unit: Unit): string {
  return unit === "metric" ? "g" : "oz";
}

export function packTotals(pack: Pack): Totals {
  let base = 0;
  let worn = 0;
  let consumable = 0;
  let count = 0;

  for (const category of pack.categories) {
    for (const item of category.items) {
      const total = item.grams * item.qty;
      count += item.qty;
      if (item.worn) worn += total;
      else if (item.consumable) consumable += total;
      else base += total;
    }
  }

  return { base, worn, consumable, total: base + worn + consumable, count };
}
