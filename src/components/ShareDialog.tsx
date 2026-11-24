import { useEffect, useRef } from "react";

interface ShareDialogProps {
  packName: string;
  url: string;
  onClose: () => void;
  onCopy: () => void;
}

export function ShareDialog({ packName, url, onClose, onCopy }: ShareDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    input.select();
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal share-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        aria-describedby="share-desc"
      >
        <h2 id="share-title">Share “{packName}”</h2>
        <p id="share-desc">
          The whole packing list is inside this link. Opening it loads a copy into Feather — no account needed.
        </p>
        <input
          ref={inputRef}
          className="share-link"
          value={url}
          readOnly
          aria-label="Share link"
          onFocus={(event) => event.currentTarget.select()}
        />
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn primary" onClick={onCopy}>
            Copy link
          </button>
        </div>
      </div>
    </div>
  );
}
