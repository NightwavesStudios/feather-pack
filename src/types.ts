export type Unit = "metric" | "imperial" | "pounds";

export interface GearItem {
  id: string;
  name: string;
  /** Weight per unit, stored in grams. */
  grams: number;
  qty: number;
  worn: boolean;
  consumable: boolean;
}

export interface Category {
  id: string;
  name: string;
  items: GearItem[];
}

export interface Pack {
  id: string;
  name: string;
  createdAt: number;
  categories: Category[];
}

export interface Library {
  version: 1;
  unit: Unit;
  activePackId: string | null;
  packs: Pack[];
}

export interface Totals {
  base: number;
  worn: number;
  consumable: number;
  total: number;
  count: number;
}

export type DragState =
  | { kind: "item"; categoryId: string; itemId: string }
  | { kind: "category"; categoryId: string };

export interface ItemDrop {
  categoryId: string;
  beforeId: string | null;
}

export interface CategoryDrop {
  categoryId: string;
  after: boolean;
}
