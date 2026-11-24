import type { Pack } from "../types";
import { normalizePack } from "./library";

const SHARE_PARAM = "pack";

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Builds a self-contained link: the whole pack lives in the query string. */
export function buildShareUrl(pack: Pack): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set(SHARE_PARAM, encodeBase64Url(JSON.stringify(pack)));
  return url.toString();
}

export function readSharedPack(): Pack | null {
  let encoded: string | null = null;
  try {
    encoded = new URL(window.location.href).searchParams.get(SHARE_PARAM);
  } catch {
    return null;
  }
  if (!encoded) return null;

  try {
    return normalizePack(JSON.parse(decodeBase64Url(encoded)));
  } catch {
    return null;
  }
}

export function clearSharedParam(): void {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(SHARE_PARAM)) return;
  url.searchParams.delete(SHARE_PARAM);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}
