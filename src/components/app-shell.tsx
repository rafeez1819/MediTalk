import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, LayoutTemplate, Settings2 } from "lucide-react";
import { useMediTalk } from "@/lib/store";
import { cn } from "@/lib/utils";
import { MediTalkWordmark } from "./logo";
import { TooltipProvider } from "./ui/tooltip";

const NAV = [
  { to: "/", label: "Board", icon: ClipboardList },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/settings", label: "Practice", icon: Settings2 },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const settings = useMediTalk((s) => s.settings);

  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-h-dvh bg-background text-foreground">
        <aside className="fixed top-0 left-0 z-30 hidden h-dvh w-60 flex-col border-r border-border bg-sidebar px-4 py-5 md:flex">
          <MediTalkWordmark />
          <nav className="mt-8 flex flex-col gap-1">
            {NAV.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex h-11 items-center gap-2.5 rounded-md px-3 text-sm font-medium no-underline transition-colors",
                    active
                      ? "bg-card text-foreground shadow-[var(--shadow-border)]"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto rounded-lg bg-card p-3 shadow-[var(--shadow-border)]">
            <p className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">Practice</p>
            <p className="mt-1 text-sm font-medium">{settings.clinicName}</p>
            <p className="text-xs text-muted-foreground">
              {settings.clinicianName}
              {settings.credentials ? `, ${settings.credentials}` : ""}
            </p>
          </div>
        </aside>

        <div className="md:pl-60">
          <header className="sticky top-0 z-20 flex h-14 items-center border-b border-border bg-background/90 px-4 backdrop-blur-sm md:hidden">
            <MediTalkWordmark compact />
          </header>
          <div className="pb-20 md:pb-0">{children}</div>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-3 border-t border-border bg-card/95 backdrop-blur-sm md:hidden">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 text-[11px] font-medium no-underline",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </TooltipProvider>
  );
}
