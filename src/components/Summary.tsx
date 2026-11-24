import type { Totals, Unit } from "../types";
import { formatWeight } from "../lib/weight";

interface SummaryProps {
  totals: Totals;
  unit: Unit;
}

export function Summary({ totals, unit }: SummaryProps) {
  const otherUnit: Unit = unit === "metric" ? "imperial" : "metric";
  const [amount, suffix] = formatWeight(totals.base, unit).split(" ");
  const share = (value: number) => `${totals.total > 0 ? (value / totals.total) * 100 : 0}%`;

  return (
    <section className="summary" aria-label="Pack weight summary">
      <div className="summary-base">
        <span className="eyebrow">Base weight</span>
        <div className="summary-number">
          <strong>{amount}</strong>
          <span>{suffix}</span>
        </div>
        <p className="summary-sub">
          {formatWeight(totals.base, otherUnit)} · {totals.count} {totals.count === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="summary-mix">
        <div className="mix-labels">
          <span>Weight split</span>
          <span>{formatWeight(totals.total, unit)} total</span>
        </div>
        <div
          className="mix-bar"
          role="img"
          aria-label={`Base ${formatWeight(totals.base, unit)}, worn ${formatWeight(totals.worn, unit)}, consumables ${formatWeight(totals.consumable, unit)}`}
        >
          <span className="mix-base" style={{ width: share(totals.base) }} />
          <span className="mix-worn" style={{ width: share(totals.worn) }} />
          <span className="mix-cons" style={{ width: share(totals.consumable) }} />
        </div>
        <ul className="legend">
          <li>
            <i className="legend-dot base" />
            Base <b>{formatWeight(totals.base, unit)}</b>
          </li>
          <li>
            <i className="legend-dot worn" />
            Worn <b>{formatWeight(totals.worn, unit)}</b>
          </li>
          <li>
            <i className="legend-dot cons" />
            Consumables <b>{formatWeight(totals.consumable, unit)}</b>
          </li>
        </ul>
      </div>

      <div className="summary-stats">
        <div title="Clothing and footwear you wear">
          <span>Worn</span>
          <b>{formatWeight(totals.worn, unit)}</b>
        </div>
        <div title="Food, water and fuel">
          <span>Consumables</span>
          <b>{formatWeight(totals.consumable, unit)}</b>
        </div>
        <div title="Base + worn + consumables">
          <span>Total</span>
          <b>{formatWeight(totals.total, unit)}</b>
        </div>
      </div>
    </section>
  );
}
