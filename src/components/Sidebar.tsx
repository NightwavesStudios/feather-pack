import type { Pack, Unit } from "../types";
import { formatWeight, packTotals } from "../lib/weight";
import { DownloadIcon, FeatherMark, PlusIcon, UploadIcon } from "./icons";

interface SidebarProps {
  packs: Pack[];
  activePackId: string | null;
  unit: Unit;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onUnitChange: (unit: Unit) => void;
  onDownload: () => void;
  onUpload: () => void;
}

export function Sidebar({
  packs,
  activePackId,
  unit,
  onSelect,
  onCreate,
  onUnitChange,
  onDownload,
  onUpload,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand-row">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <FeatherMark size={30} />
          </span>
          <span className="brand-text">
            feather<span className="brand-dot">.</span>
          </span>
        </div>
        <div className="unit-toggle" role="group" aria-label="Weight unit">
          <button type="button" aria-pressed={unit === "metric"} onClick={() => onUnitChange("metric")}>
            g
          </button>
          <button type="button" aria-pressed={unit === "imperial"} onClick={() => onUnitChange("imperial")}>
            oz
          </button>
        </div>
      </div>

      <div className="packs-section">
        <div className="side-heading">
          <span>Your packs</span>
          <span>{packs.length}</span>
        </div>
        <nav className="pack-list" aria-label="Packs">
          {packs.map((pack) => {
            const active = pack.id === activePackId;
            return (
              <button
                key={pack.id}
                type="button"
                className={`pack-btn${active ? " active" : ""}`}
                onClick={() => onSelect(pack.id)}
                aria-current={active ? "page" : undefined}
                title={pack.name}
              >
                <span className="pack-btn-name">{pack.name || "Untitled pack"}</span>
                <span className="pack-btn-weight">{formatWeight(packTotals(pack).base, unit)}</span>
              </button>
            );
          })}
          {packs.length === 0 && <p className="pack-list-empty">No packs yet</p>}
          <button type="button" className="new-pack" onClick={onCreate}>
            <PlusIcon size={14} />
            New pack
          </button>
        </nav>
      </div>

      <div className="sidebar-foot">
        <div className="side-heading">
          <span>Backup</span>
        </div>
        <div className="backup-actions">
          <button type="button" className="btn" onClick={onDownload}>
            <DownloadIcon size={14} />
            Download
          </button>
          <button type="button" className="btn" onClick={onUpload}>
            <UploadIcon size={14} />
            Upload
          </button>
        </div>
        <p className="local-note">Autosaved in this browser</p>
      </div>
    </aside>
  );
}
