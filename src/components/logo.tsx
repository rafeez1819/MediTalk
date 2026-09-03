import { Link } from "@tanstack/react-router";
import { APP_NAME } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function MediTalkMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-primary" />
      <path
        d="M9 16.2c2.1-4.2 4.7-6.3 7.4-6.3 2.8 0 5.3 2.1 7.2 6.3"
        fill="none"
        stroke="var(--color-primary-foreground)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle
        cx="22.2"
        cy="19.6"
        r="2.15"
        fill="none"
        stroke="var(--color-primary-foreground)"
        strokeWidth="1.8"
      />
      <path
        d="M22.2 21.75v1.7c0 1.5-1.2 2.7-2.7 2.7h-1.3"
        fill="none"
        stroke="var(--color-primary-foreground)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MediTalkWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 text-foreground no-underline">
      <MediTalkMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.15rem] font-medium tracking-tight">{APP_NAME}</span>
        {!compact ? (
          <span className="mt-0.5 text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
            Clinical scribe
          </span>
        ) : null}
      </span>
    </Link>
  );
}
