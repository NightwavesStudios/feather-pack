import { useEffect, useState } from "react";
import type { Unit } from "../types";
import { formatWeightInput, parseWeight, unitSuffix } from "../lib/weight";

interface WeightInputProps {
  grams: number;
  unit: Unit;
  onChange: (grams: number) => void;
  ariaLabel: string;
}

export function WeightInput({ grams, unit, onChange, ariaLabel }: WeightInputProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? formatWeightInput(grams, unit);

  useEffect(() => {
    setDraft(null);
  }, [unit]);

  const commit = () => {
    if (draft === null) return;
    const parsed = parseWeight(draft, unit);
    setDraft(null);
    if (parsed !== null) onChange(parsed);
  };

  return (
    <span className="weight-field">
      <input
        className="weight-input"
        type="text"
        inputMode="decimal"
        value={value}
        placeholder="0"
        aria-label={ariaLabel}
        onFocus={(event) => {
          setDraft(formatWeightInput(grams, unit));
          event.currentTarget.select();
        }}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
      />
      <span className="weight-suffix">{unitSuffix(unit)}</span>
    </span>
  );
}
