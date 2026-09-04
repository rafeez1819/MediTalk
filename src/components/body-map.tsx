import { BODY_REGIONS, type BodyRegion } from "@/lib/body";
import type { Lang } from "@/lib/languages";
import { cn } from "@/lib/utils";

export function BodyMap({
  lang,
  selected,
  onSelect,
}: {
  lang: Lang;
  selected?: string;
  onSelect: (region: BodyRegion) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-[160px_1fr] sm:items-start">
      <div className="mx-auto w-[140px]">
        <svg viewBox="0 0 120 260" className="w-full text-accent" aria-hidden="true">
          <ellipse cx="60" cy="28" rx="22" ry="24" fill="currentColor" opacity="0.18" />
          <rect x="48" y="50" width="24" height="16" rx="6" fill="currentColor" opacity="0.18" />
          <rect x="34" y="66" width="52" height="70" rx="16" fill="currentColor" opacity="0.18" />
          <rect x="8" y="70" width="22" height="72" rx="11" fill="currentColor" opacity="0.18" />
          <rect x="90" y="70" width="22" height="72" rx="11" fill="currentColor" opacity="0.18" />
          <rect x="38" y="134" width="18" height="90" rx="9" fill="currentColor" opacity="0.18" />
          <rect x="64" y="134" width="18" height="90" rx="9" fill="currentColor" opacity="0.18" />
        </svg>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {BODY_REGIONS.map((r) => {
          const active = selected === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelect(r)}
              className={cn(
                "min-h-12 rounded-lg px-3 py-3 text-left text-sm font-medium shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out active:scale-[0.96]",
                active ? "bg-accent text-accent-fg" : "bg-elevated hover:bg-mist",
              )}
            >
              {r.label[lang]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
