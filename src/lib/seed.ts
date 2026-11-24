import type { Category, Pack } from "../types";
import { makeCategory, makeItem, makePack } from "./factories";

interface SeedItem {
  name: string;
  grams: number;
  qty?: number;
  worn?: boolean;
  consumable?: boolean;
}

function category(name: string, items: SeedItem[]): Category {
  const result = makeCategory(name);
  result.items = items.map((entry) => ({
    ...makeItem(entry.name, entry.grams, entry.qty ?? 1),
    worn: entry.worn ?? false,
    consumable: entry.consumable ?? false,
  }));
  return result;
}

export function seedPacks(): Pack[] {
  const weekend = makePack("Weekend Ultralight");
  weekend.categories = [
    category("Pack & Shelter", [
      { name: "Hyperlite Junction 2400", grams: 900 },
      { name: "Durston X-Mid 1P", grams: 790 },
      { name: "Polycro ground sheet", grams: 55 },
    ]),
    category("Sleep", [
      { name: "EE Enigma quilt", grams: 450 },
      { name: "Nemo Tensor pad", grams: 355 },
      { name: "Pump sack", grams: 60 },
      { name: "S2S Aeros pillow", grams: 60 },
    ]),
    category("Worn Clothing", [
      { name: "Sun hoodie", grams: 150, worn: true },
      { name: "Trail runners", grams: 620, worn: true },
      { name: "Running shorts", grams: 120, worn: true },
      { name: "Trucker cap", grams: 55, worn: true },
    ]),
    category("Kitchen & Water", [
      { name: "Toaks 550 pot", grams: 72 },
      { name: "BRS-3000T stove", grams: 25 },
      { name: "Sawyer Squeeze", grams: 65 },
      { name: "Mini lighter", grams: 11 },
      { name: "Fuel canister (110 g)", grams: 210, consumable: true },
      { name: "Water (1 L)", grams: 1000, consumable: true },
    ]),
    category("Food", [
      { name: "Freeze-dried dinner", grams: 140, qty: 2, consumable: true },
      { name: "Oatmeal + coffee", grams: 180, qty: 2, consumable: true },
      { name: "Snack bars", grams: 90, qty: 6, consumable: true },
    ]),
    category("Electronics & Misc", [
      { name: "iPhone", grams: 190 },
      { name: "Nitecore NB10000", grams: 150 },
      { name: "NU25 headlamp", grams: 52 },
      { name: "First aid kit", grams: 120 },
      { name: "Toiletry kit", grams: 90 },
    ]),
  ];

  const dayHike = makePack("Day Hike");
  dayHike.categories = [
    category("Carry", [{ name: "18 L running vest", grams: 240 }]),
    category("Worn", [
      { name: "Trail runners", grams: 620, worn: true },
      { name: "Shorts", grams: 110, worn: true },
      { name: "Tee", grams: 90, worn: true },
    ]),
    category("Food & Water", [
      { name: "Water (1 L)", grams: 1000, consumable: true },
      { name: "Snack bars", grams: 55, qty: 3, consumable: true },
    ]),
    category("Essentials", [
      { name: "Wind shell", grams: 120 },
      { name: "iPhone", grams: 190 },
      { name: "Keys", grams: 40 },
      { name: "Headlamp", grams: 30 },
    ]),
  ];

  return [weekend, dayHike];
}
