import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Clock, Home, MessageSquareText, Stethoscope } from "lucide-react";
import type { ReactNode } from "react";
import { MediMark } from "./mark";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/talk", label: "Talk", icon: MessageSquareText },
  { to: "/phrases", label: "Phrases", icon: BookOpen },
  { to: "/learn", label: "Learn", icon: Stethoscope },
  { to: "/history", label: "Visits", icon: Clock },
] as const;

export function AppShell({
  children,
  title,
  action,
  wide = false,
}: {
  children: ReactNode;
  title?: string;
  action?: ReactNode;
  wide?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-ink">
      <header className="sticky top-0 z-20 border-b border-line/80 bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2 text-accent">
            <MediMark className="size-8" />
            <span className="font-heading text-lg font-medium tracking-tight text-ink">
              MediTalk
            </span>
          </Link>
          {title ? <p className="hidden truncate text-sm text-muted sm:block">{title}</p> : null}
          <div className="flex items-center gap-2">{action}</div>
        </div>
      </header>
      <main
        className={cn("mx-auto w-full flex-1 px-4 pb-28 pt-5", wide ? "max-w-5xl" : "max-w-3xl")}
      >
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-elevated/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <ul className="mx-auto grid max-w-lg grid-cols-5 px-2 py-1">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-md text-[11px] font-medium",
                    active ? "text-accent" : "text-muted",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
