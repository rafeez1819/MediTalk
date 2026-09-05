import { LANGS, type Lang } from "@/lib/languages";
import { cn } from "@/lib/utils";

export function LangGrid({
  value,
  onChange,
  exclude,
}: {
  value: Lang;
  onChange: (id: Lang) => void;
  exclude?: Lang;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {LANGS.map((l) => {
        const selected = l.id === value;
        const disabled = l.id === exclude;
        return (
          <button
            key={l.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(l.id)}
            className={cn(
              "flex min-h-12 flex-col items-start rounded-lg px-3 py-2 text-left shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out active:not-disabled:scale-[0.96]",
              selected ? "bg-accent text-accent-fg" : "bg-elevated text-ink hover:bg-mist",
              disabled && "opacity-35",
            )}
          >
            <span className="text-sm font-medium leading-tight">{l.native}</span>
            <span className={cn("text-[11px]", selected ? "text-accent-fg/80" : "text-muted")}>
              {l.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
