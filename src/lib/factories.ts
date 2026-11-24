import type { Category, GearItem, Pack } from "../types";
import { createId } from "./ids";

export function makePack(name = "Untitled pack"): Pack {
  return {
    id: createId("pack"),
    name,
    createdAt: Date.now(),
    categories: [makeCategory("Gear")],
  };
}

export function makeCategory(name = "New category"): Category {
  return { id: createId("cat"), name, items: [] };
}

export function makeItem(name: string, grams = 0, qty = 1): GearItem {
  return { id: createId("item"), name, grams, qty, worn: false, consumable: false };
}

export function clonePack(pack: Pack, name?: string): Pack {
  return {
    id: createId("pack"),
    name: name ?? `${pack.name} copy`,
    createdAt: Date.now(),
    categories: pack.categories.map((category) => ({
      id: createId("cat"),
      name: category.name,
      items: category.items.map((item) => ({ ...item, id: createId("item") })),
    })),
  };
}
