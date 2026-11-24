import { useRef, useState, type DragEvent, type FormEvent } from "react";
import type { Category, CategoryDrop, DragState, GearItem, ItemDrop, Unit } from "../types";
import { formatWeight, parseWeight, unitSuffix } from "../lib/weight";
import { ChevronDownIcon, GripIcon, PlusIcon, TrashIcon } from "./icons";
import { WeightInput } from "./WeightInput";

interface CategoryCardProps {
  category: Category;
  categories: Category[];
  unit: Unit;
  drag: DragState | null;
  itemDrop: ItemDrop | null;
  categoryDrop: CategoryDrop | null;
  onRename: (name: string) => void;
  onDelete: () => void;
  onAddItem: (name: string, grams: number) => void;
  onUpdateItem: (itemId: string, patch: Partial<GearItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onItemDragStart: (itemId: string) => void;
  onItemHover: (beforeId: string | null) => void;
  onItemDrop: (beforeId: string | null) => void;
  onMoveTo: (itemId: string, categoryId: string) => void;
  onCategoryDragStart: () => void;
  onCategoryHover: (after: boolean) => void;
  onCategoryDrop: () => void;
  onDragEnd: () => void;
}

export function CategoryCard({
  category,
  categories,
  unit,
  drag,
  itemDrop,
  categoryDrop,
  onRename,
  onDelete,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onItemDragStart,
  onItemHover,
  onItemDrop,
  onMoveTo,
  onCategoryDragStart,
  onCategoryHover,
  onCategoryDrop,
  onDragEnd,
}: CategoryCardProps) {
  const count = category.items.reduce((sum, item) => sum + item.qty, 0);
  const weight = category.items.reduce((sum, item) => sum + item.grams * item.qty, 0);
  const otherCategories = categories.filter((entry) => entry.id !== category.id);

  const isItemTarget = drag?.kind === "item" && itemDrop?.categoryId === category.id;
  const isCategoryTarget =
    drag?.kind === "category" && drag.categoryId !== category.id && categoryDrop?.categoryId === category.id;

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (!drag) return;
    event.preventDefault();
    if (drag.kind === "item") {
      event.dataTransfer.dropEffect = "move";
      if (itemDrop?.categoryId !== category.id || itemDrop.beforeId !== null) {
        onItemHover(null);
      }
      return;
    }
    if (drag.categoryId === category.id) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    onCategoryHover(event.clientY > bounds.top + bounds.height / 2);
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    if (!drag) return;
    event.preventDefault();
    if (drag.kind === "item") onItemDrop(null);
    else if (drag.categoryId !== category.id) onCategoryDrop();
  };

  const classes = ["category"];
  if (isItemTarget) classes.push("is-drop-target");
  if (isCategoryTarget) classes.push(categoryDrop?.after ? "drop-after" : "drop-before");

  return (
    <section className={classes.join(" ")} onDragOver={handleDragOver} onDrop={handleDrop}>
      <header className="category-head">
        <span
          className="grip"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            event.dataTransfer.setData("text/plain", category.id);
            onCategoryDragStart();
          }}
          onDragEnd={onDragEnd}
          title="Drag to reorder categories"
          aria-hidden="true"
        >
          <GripIcon size={15} />
        </span>
        <input
          className="category-name"
          value={category.name}
          onChange={(event) => onRename(event.target.value)}
          onBlur={(event) => {
            if (!event.currentTarget.value.trim()) onRename("Untitled category");
          }}
          aria-label="Category name"
          spellCheck={false}
        />
        <span className="category-meta">
          {count} {count === 1 ? "item" : "items"} · {formatWeight(weight, unit)}
        </span>
        <button
          type="button"
          className="icon-btn ghost"
          onClick={onDelete}
          aria-label={`Delete ${category.name || "category"}`}
          title="Delete category"
        >
          <TrashIcon size={14} />
        </button>
      </header>

      <ul className="item-list">
        {category.items.map((item) => (
          <li
            key={item.id}
            className={`item-row${
              drag?.kind === "item" && itemDrop?.categoryId === category.id && itemDrop.beforeId === item.id
                ? " is-drop-before"
                : ""
            }`}
            onDragOver={(event) => {
              if (drag?.kind !== "item") return;
              event.preventDefault();
              event.stopPropagation();
              onItemHover(item.id);
            }}
            onDrop={(event) => {
              if (drag?.kind !== "item") return;
              event.preventDefault();
              event.stopPropagation();
              onItemDrop(item.id);
            }}
          >
            <span
              className="grip item-grip"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", item.id);
                const row = event.currentTarget.closest(".item-row");
                if (row instanceof HTMLElement) event.dataTransfer.setDragImage(row, 20, 18);
                onItemDragStart(item.id);
              }}
              onDragEnd={onDragEnd}
              title="Drag to reorder or move"
              aria-hidden="true"
            >
              <GripIcon size={13} />
            </span>

            <input
              className="item-name"
              value={item.name}
              onChange={(event) => onUpdateItem(item.id, { name: event.target.value })}
              onBlur={(event) => {
                if (!event.currentTarget.value.trim()) onUpdateItem(item.id, { name: "Untitled item" });
              }}
              aria-label="Item name"
              spellCheck={false}
            />

            <WeightInput
              grams={item.grams}
              unit={unit}
              onChange={(grams) => onUpdateItem(item.id, { grams })}
              ariaLabel={`Weight for ${item.name || "item"}`}
            />

            <QtyInput item={item} onUpdate={(patch) => onUpdateItem(item.id, patch)} />

            <div className="flags">
              <button
                type="button"
                className="flag worn"
                aria-pressed={item.worn}
                title="Worn — excluded from base weight"
                onClick={() => onUpdateItem(item.id, { worn: !item.worn, consumable: false })}
              >
                Worn
              </button>
              <button
                type="button"
                className="flag cons"
                aria-pressed={item.consumable}
                title="Consumable — food, water or fuel"
                onClick={() => onUpdateItem(item.id, { consumable: !item.consumable, worn: false })}
              >
                Consumable
              </button>
            </div>

            {otherCategories.length > 0 && (
              <label className="move-field" title="Move to another category">
                <span>Move</span>
                <ChevronDownIcon size={9} />
                <select
                  value=""
                  aria-label={`Move ${item.name || "item"} to another category`}
                  onChange={(event) => {
                    if (event.currentTarget.value) onMoveTo(item.id, event.currentTarget.value);
                  }}
                >
                  <option value="" disabled>
                    Move to…
                  </option>
                  {otherCategories.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name || "Untitled category"}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <span className="item-total">{formatWeight(item.grams * item.qty, unit)}</span>

            <button
              type="button"
              className="row-delete"
              onClick={() => onDeleteItem(item.id)}
              aria-label={`Remove ${item.name || "item"}`}
              title="Remove item"
            >
              <TrashIcon size={14} />
            </button>
          </li>
        ))}
      </ul>

      <AddItemForm
        unit={unit}
        first={category.items.length === 0}
        onAdd={(name, grams) => onAddItem(name, grams)}
      />
    </section>
  );
}

function QtyInput({ item, onUpdate }: { item: GearItem; onUpdate: (patch: Partial<GearItem>) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? String(item.qty);

  const commit = () => {
    if (draft === null) return;
    const parsed = Number(draft);
    setDraft(null);
    onUpdate({ qty: Number.isFinite(parsed) && parsed >= 1 ? Math.min(999, Math.round(parsed)) : 1 });
  };

  return (
    <span className="qty-field" title="Quantity">
      <span aria-hidden="true">×</span>
      <input
        className="qty-input"
        type="text"
        inputMode="numeric"
        value={value}
        aria-label={`Quantity for ${item.name || "item"}`}
        onFocus={(event) => {
          setDraft(String(item.qty));
          event.currentTarget.select();
        }}
        onChange={(event) => setDraft(event.target.value.replace(/[^\d]/g, ""))}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
      />
    </span>
  );
}

interface AddItemFormProps {
  unit: Unit;
  first: boolean;
  onAdd: (name: string, grams: number) => void;
}

function AddItemForm({ unit, first, onAdd }: AddItemFormProps) {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      nameRef.current?.focus();
      return;
    }
    onAdd(trimmed, parseWeight(weight, unit) ?? 0);
    setName("");
    setWeight("");
    nameRef.current?.focus();
  };

  return (
    <form className="add-row" onSubmit={submit}>
      <span className="add-icon" aria-hidden="true">
        <PlusIcon size={13} />
      </span>
      <input
        ref={nameRef}
        className="add-name"
        value={name}
        placeholder={first ? "Add your first item…" : "Add an item…"}
        onChange={(event) => setName(event.target.value)}
        aria-label="New item name"
        spellCheck={false}
      />
      <span className="add-weight">
        <input
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
          placeholder="0"
          inputMode="decimal"
          aria-label="New item weight"
        />
        <span>{unitSuffix(unit)}</span>
      </span>
      <button type="submit" className="add-submit" disabled={!name.trim()}>
        Add
      </button>
    </form>
  );
}
