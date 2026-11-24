interface IconProps {
  size?: number;
}

export function GripIcon({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="5.5" cy="4" r="1.15" />
      <circle cx="10.5" cy="4" r="1.15" />
      <circle cx="5.5" cy="8" r="1.15" />
      <circle cx="10.5" cy="8" r="1.15" />
      <circle cx="5.5" cy="12" r="1.15" />
      <circle cx="10.5" cy="12" r="1.15" />
    </svg>
  );
}

export function TrashIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.6 4.2h10.8M6 4.2V2.9c0-.5.4-.9.9-.9h2.2c.5 0 .9.4.9.9v1.3M4.1 4.2l.6 8.3c0 .5.4.9.9.9h4.8c.5 0 .9-.4.9-.9l.6-8.3M6.6 7v3.6M9.4 7v3.6"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PlusIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function CopyIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5.6" y="5.6" width="7.9" height="7.9" rx="1.6" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M10.4 5.6V4.1A1.6 1.6 0 0 0 8.8 2.5H4.1a1.6 1.6 0 0 0-1.6 1.6v4.7a1.6 1.6 0 0 0 1.6 1.6h1.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ShareIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="12" cy="3.5" r="1.7" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="4" cy="8" r="1.7" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="12" cy="12.5" r="1.7" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="m5.5 7.2 5-2.9M5.5 8.8l5 2.9"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DownloadIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 2.6v7.2M5.2 7l2.8 2.8L10.8 7M3 11.6v1.2c0 .4.3.7.7.7h8.6c.4 0 .7-.3.7-.7v-1.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UploadIcon({ size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 10.6V3.4M5.2 6.2 8 3.4l2.8 2.8M3 11.6v1.2c0 .4.3.7.7.7h8.6c.4 0 .7-.3.7-.7v-1.2"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ size = 10 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FeatherMark({ size = 30 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" aria-hidden="true" style={{ display: "block" }}>
      <path
        d="M7.6 23.8c.4-6.6 3.6-11.8 10.5-13.8 2.3-.7 4.3-.9 6-.7-.2 1.7-.9 3.5-2.2 5.5-3 4.6-7.8 7-14.3 9Z"
        fill="var(--accent-ink)"
      />
      <path
        d="M8.4 22.9c4.5-4.2 9.2-7.7 13.5-10.1"
        stroke="var(--accent)"
        strokeWidth="1.15"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
