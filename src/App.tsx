import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type { Category, CategoryDrop, DragState, GearItem, ItemDrop, Library, Pack, Unit } from "./types";
import { packTotals } from "./lib/weight";
import { clonePack, makeCategory, makeItem, makePack } from "./lib/factories";
import { downloadBackup, loadLibrary, mergePacks, readBackupFile, saveLibrary } from "./lib/library";
import { Sidebar } from "./components/Sidebar";
import { Summary } from "./components/Summary";
import { CategoryCard } from "./components/CategoryCard";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { CopyIcon, FeatherMark, PlusIcon, TrashIcon } from "./components/icons";

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel: string;
  action: () => void;
}

export default function App() {
  const [library, setLibrary] = useState<Library>(() => loadLibrary());
  const [drag, setDrag] = useState<DragState | null>(null);
  const [itemDrop, setItemDrop] = useState<ItemDrop | null>(null);
  const [categoryDrop, setCategoryDrop] = useState<CategoryDrop | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef(0);

  const activePack = library.packs.find((pack) => pack.id === library.activePackId) ?? library.packs[0] ?? null;
  const totals = activePack ? packTotals(activePack) : { base: 0, worn: 0, consumable: 0, total: 0, count: 0 };

  useEffect(() => {
    saveLibrary(library);
  }, [library]);

  useEffect(() => {
    document.title = activePack ? `${activePack.name || "Untitled pack"} · Feather` : "Feather — pack lighter";
  }, [activePack]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const notify = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3400);
  };

  const mutatePack = (packId: string, mutate: (pack: Pack) => Pack) => {
    setLibrary((current) => ({
      ...current,
      packs: current.packs.map((pack) => (pack.id === packId ? mutate(pack) : pack)),
    }));
  };

  const mutateCategory = (packId: string, categoryId: string, mutate: (category: Category) => Category) => {
    mutatePack(packId, (pack) => ({
      ...pack,
      categories: pack.categories.map((category) => (category.id === categoryId ? mutate(category) : category)),
    }));
  };

  const setUnit = (unit: Unit) => setLibrary((current) => ({ ...current, unit }));

  const selectPack = (id: string) => setLibrary((current) => ({ ...current, activePackId: id }));

  const createPack = () => {
    const pack = makePack("Untitled pack");
    setLibrary((current) => ({ ...current, packs: [pack, ...current.packs], activePackId: pack.id }));
    window.setTimeout(() => {
      titleRef.current?.focus();
      titleRef.current?.select();
    }, 60);
  };

  const renamePack = (name: string) => {
    if (!activePack) return;
    mutatePack(activePack.id, (pack) => ({ ...pack, name }));
  };

  const duplicatePack = () => {
    if (!activePack) return;
    const copy = clonePack(activePack, `${activePack.name || "Pack"} copy`);
    setLibrary((current) => {
      const packs = [...current.packs];
      const index = packs.findIndex((pack) => pack.id === activePack.id);
      packs.splice(index + 1, 0, copy);
      return { ...current, packs, activePackId: copy.id };
    });
    notify("Pack duplicated");
  };

  const requestDeletePack = () => {
    if (!activePack) return;
    const packId = activePack.id;
    setConfirm({
      title: "Delete this pack?",
      message: `“${activePack.name || "Untitled pack"}” and all of its gear will be removed from this browser. This can't be undone.`,
      confirmLabel: "Delete pack",
      action: () => {
        setLibrary((current) => {
          const packs = current.packs.filter((pack) => pack.id !== packId);
          return {
            ...current,
            packs,
            activePackId: packs.some((pack) => pack.id === current.activePackId)
              ? current.activePackId
              : packs[0]?.id ?? null,
          };
        });
        notify("Pack deleted");
      },
    });
  };

  const addCategory = () => {
    if (!activePack) return;
    mutatePack(activePack.id, (pack) => ({
      ...pack,
      categories: [...pack.categories, makeCategory("New category")],
    }));
  };

  const renameCategory = (categoryId: string, name: string) => {
    if (!activePack) return;
    mutateCategory(activePack.id, categoryId, (category) => ({ ...category, name }));
  };

  const requestDeleteCategory = (category: Category) => {
    if (!activePack) return;
    const count = category.items.reduce((sum, item) => sum + item.qty, 0);
    setConfirm({
      title: "Delete category?",
      message:
        count > 0
          ? `“${category.name || "Untitled category"}” and its ${count} ${count === 1 ? "item" : "items"} will be removed from this pack.`
          : `“${category.name || "Untitled category"}” will be removed from this pack.`,
      confirmLabel: "Delete category",
      action: () => {
        mutatePack(activePack.id, (pack) => ({
          ...pack,
          categories: pack.categories.filter((entry) => entry.id !== category.id),
        }));
        notify("Category deleted");
      },
    });
  };

  const addItem = (categoryId: string, name: string, grams: number) => {
    if (!activePack) return;
    mutateCategory(activePack.id, categoryId, (category) => ({
      ...category,
      items: [...category.items, makeItem(name, grams)],
    }));
  };

  const updateItem = (categoryId: string, itemId: string, patch: Partial<GearItem>) => {
    if (!activePack) return;
    mutateCategory(activePack.id, categoryId, (category) => ({
      ...category,
      items: category.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
    }));
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    if (!activePack) return;
    mutateCategory(activePack.id, categoryId, (category) => ({
      ...category,
      items: category.items.filter((item) => item.id !== itemId),
    }));
  };

  const beginItemDrag = (categoryId: string, itemId: string) => {
    setDrag({ kind: "item", categoryId, itemId });
    setItemDrop(null);
    setCategoryDrop(null);
  };

  const beginCategoryDrag = (categoryId: string) => {
    setDrag({ kind: "category", categoryId });
    setItemDrop(null);
    setCategoryDrop(null);
  };

  const hoverItem = (categoryId: string, beforeId: string | null) => {
    setItemDrop((current) =>
      current && current.categoryId === categoryId && current.beforeId === beforeId
        ? current
        : { categoryId, beforeId },
    );
  };

  const hoverCategory = (categoryId: string, after: boolean) => {
    setCategoryDrop((current) =>
      current && current.categoryId === categoryId && current.after === after
        ? current
        : { categoryId, after },
    );
  };

  const endDrag = () => {
    setDrag(null);
    setItemDrop(null);
    setCategoryDrop(null);
  };

  const moveItem = (packId: string, fromId: string, toId: string, itemId: string, beforeId: string | null) => {
    setLibrary((current) => ({
      ...current,
      packs: current.packs.map((pack) => {
        if (pack.id !== packId) return pack;
        const moving = pack.categories.find((category) => category.id === fromId)?.items.find((item) => item.id === itemId);
        if (!moving) return pack;

        const categories = pack.categories.map((category) => {
          if (category.id === fromId) {
            return { ...category, items: category.items.filter((item) => item.id !== itemId) };
          }
          return { ...category, items: [...category.items] };
        });
        const target = categories.find((category) => category.id === toId);
        if (!target) return pack;

        const index = beforeId ? target.items.findIndex((item) => item.id === beforeId) : -1;
        target.items.splice(index >= 0 ? index : target.items.length, 0, moving);
        return { ...pack, categories };
      }),
    }));
  };

  const dropItem = (packId: string, categoryId: string, beforeId: string | null) => {
    if (!drag || drag.kind !== "item") return;
    if (beforeId !== drag.itemId) {
      moveItem(packId, drag.categoryId, categoryId, drag.itemId, beforeId);
    }
    endDrag();
  };

  const dropCategory = (packId: string, targetId: string) => {
    if (!drag || drag.kind !== "category" || !categoryDrop) {
      endDrag();
      return;
    }
    const movingId = drag.categoryId;
    if (movingId === targetId) {
      endDrag();
      return;
    }
    const after = categoryDrop.categoryId === targetId && categoryDrop.after;

    setLibrary((current) => ({
      ...current,
      packs: current.packs.map((pack) => {
        if (pack.id !== packId) return pack;
        const moving = pack.categories.find((category) => category.id === movingId);
        if (!moving) return pack;
        const without = pack.categories.filter((category) => category.id !== movingId);
        const targetIndex = without.findIndex((category) => category.id === targetId);
        if (targetIndex < 0) return pack;
        without.splice(after ? targetIndex + 1 : targetIndex, 0, moving);
        return { ...pack, categories: without };
      }),
    }));
    endDrag();
  };

  const handleDownload = () => {
    downloadBackup(library);
    notify("Backup downloaded");
  };

  const handleUpload = async (file: File) => {
    try {
      const imported = readBackupFile(await file.text());
      const { added, updated } = mergePacks(library.packs, imported);
      const first = imported[0];

      setLibrary((current) => {
        const merged = mergePacks(current.packs, imported);
        return {
          ...current,
          packs: merged.packs,
          activePackId: first ? first.id : current.activePackId,
        };
      });

      const detail =
        added > 0 && updated > 0
          ? `${added} new, ${updated} updated`
          : updated > 0
            ? `${updated} updated`
            : `${added} new`;
      notify(`Restored ${imported.length} ${imported.length === 1 ? "pack" : "packs"} · ${detail}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Couldn't read that backup.");
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void handleUpload(file);
  };

  return (
    <>
      <div className="app">
        <Sidebar
          packs={library.packs}
          activePackId={activePack?.id ?? null}
          unit={library.unit}
          onSelect={selectPack}
          onCreate={createPack}
          onUnitChange={setUnit}
          onDownload={handleDownload}
          onUpload={() => fileInputRef.current?.click()}
        />

        <main className="main">
          <div className="main-inner">
            {activePack ? (
              <>
                <header className="topbar">
                  <div className="topbar-title">
                    <span className="eyebrow">Packing list</span>
                    <input
                      ref={titleRef}
                      className="pack-title"
                      value={activePack.name}
                      onChange={(event) => renamePack(event.target.value)}
                      onBlur={() => {
                        if (!activePack.name.trim()) renamePack("Untitled pack");
                      }}
                      aria-label="Pack name"
                      spellCheck={false}
                    />
                  </div>
                  <div className="topbar-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={duplicatePack}
                      title="Duplicate pack"
                      aria-label="Duplicate pack"
                    >
                      <CopyIcon />
                    </button>
                    <button
                      type="button"
                      className="icon-btn danger"
                      onClick={requestDeletePack}
                      title="Delete pack"
                      aria-label="Delete pack"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </header>

                <Summary totals={totals} unit={library.unit} />

                <div className="categories">
                  {activePack.categories.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      categories={activePack.categories}
                      unit={library.unit}
                      drag={drag}
                      itemDrop={itemDrop}
                      categoryDrop={categoryDrop}
                      onRename={(name) => renameCategory(category.id, name)}
                      onDelete={() => requestDeleteCategory(category)}
                      onAddItem={(name, grams) => addItem(category.id, name, grams)}
                      onUpdateItem={(itemId, patch) => updateItem(category.id, itemId, patch)}
                      onDeleteItem={(itemId) => deleteItem(category.id, itemId)}
                      onItemDragStart={(itemId) => beginItemDrag(category.id, itemId)}
                      onItemHover={(beforeId) => hoverItem(category.id, beforeId)}
                      onItemDrop={(beforeId) => dropItem(activePack.id, category.id, beforeId)}
                      onMoveTo={(itemId, toCategoryId) =>
                        moveItem(activePack.id, category.id, toCategoryId, itemId, null)
                      }
                      onCategoryDragStart={() => beginCategoryDrag(category.id)}
                      onCategoryHover={(after) => hoverCategory(category.id, after)}
                      onCategoryDrop={() => dropCategory(activePack.id, category.id)}
                      onDragEnd={endDrag}
                    />
                  ))}
                </div>

                <button type="button" className="add-category" onClick={addCategory}>
                  <PlusIcon size={15} />
                  Add category
                </button>

                <p className="app-foot">
                  Feather saves every change in this browser. Download a backup before switching devices.
                </p>
              </>
            ) : (
              <div className="empty-state">
                <span className="empty-mark" aria-hidden="true">
                  <FeatherMark size={34} />
                </span>
                <h1>No packs yet</h1>
                <p>Start a packing list, weigh your gear, and watch the base weight fall.</p>
                <button type="button" className="btn primary" onClick={createPack}>
                  <PlusIcon size={15} />
                  Create a pack
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            const action = confirm.action;
            setConfirm(null);
            action();
          }}
        />
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={handleFileChange}
      />
    </>
  );
}
