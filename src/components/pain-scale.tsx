import { PAIN_LEVELS } from "@/lib/pain";
import type { Lang } from "@/lib/languages";
import { cn } from "@/lib/utils";

function Face({ value, active }: { value: number; active: boolean }) {
  const mouth =
    value <= 0
      ? "M16 28c3 4 9 4 12 0"
      : value <= 2
        ? "M17 29h10"
        : value <= 4
          ? "M18 30h8"
          : value <= 6
            ? "M16 32c3-3 9-3 12 0"
            : value <= 8
              ? "M15 33c4-5 10-5 14 0"
              : "M14 34c5-7 11-7 16 0";
  const brow = value >= 8 ? "M14 16l6 2M34 16l-6 2" : value >= 6 ? "M15 16l5 1M33 16l-5 1" : "";
  return (
    <svg viewBox="0 0 48 48" className="size-11" aria-hidden="true">
      <circle
        cx="24"
        cy="24"
        r="20"
        fill={active ? "var(--color-accent)" : "var(--color-elevated)"}
        stroke="var(--color-line)"
        strokeWidth="1.5"
      />
      <circle cx="17" cy="21" r="2.2" fill={active ? "var(--color-accent-fg)" : "var(--color-ink)"} />
      <circle cx="31" cy="21" r="2.2" fill={active ? "var(--color-accent-fg)" : "var(--color-ink)"} />
      <path
        d={mouth}
        fill="none"
        stroke={active ? "var(--color-accent-fg)" : "var(--color-ink)"}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {brow ? (
        <path
          d={brow}
          fill="none"
          stroke={active ? "var(--color-accent-fg)" : "var(--color-ink)"}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}

export function PainScale({
  value,
  onChange,
  lang,
}: {
  value: number;
  onChange: (n: number) => void;
  lang: Lang;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {PAIN_LEVELS.map((level) => {
        const active = value === level.value;
        return (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
            className={cn(
              "flex min-h-[5.5rem] flex-col items-center justify-center gap-1 rounded-lg px-2 py-3 shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out active:scale-[0.96]",
              active ? "bg-mist" : "bg-elevated hover:bg-sand",
            )}
          >
            <Face value={level.value} active={active} />
            <span className="font-heading text-lg tabular-nums">{level.value}</span>
            <span className="text-center text-[11px] leading-tight text-muted">
              {level.label[lang]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
