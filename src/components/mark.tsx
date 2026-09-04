export function MediMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
      fill="none"
    >
      <rect width="48" height="48" rx="12" fill="currentColor" />
      <path
        d="M24 12v24M16 20h16"
        stroke="var(--color-accent-fg)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M11 34c4.2-3.4 8.4-3.4 12.6 0 4.2 3.4 8.4 3.4 12.8 0"
        stroke="var(--color-accent-fg)"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
}
