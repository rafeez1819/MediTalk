import { createFileRoute } from "@tanstack/react-router";
import { Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shell";
import { getLang, langName } from "@/lib/languages";
import { PHRASES, SCENARIOS, type ScenarioId } from "@/lib/phrases";
import { speak } from "@/lib/speech";
import { useMediStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/phrases")({ component: PhrasesPage });

function PhrasesPage() {
  const myLang = useMediStore((s) => s.myLang);
  const theirLang = useMediStore((s) => s.theirLang);
  const [scenario, setScenario] = useState<ScenarioId | "all">("all");
  const [q, setQ] = useState("");
  const myDir = getLang(myLang).dir;
  const theirDir = getLang(theirLang).dir;

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return PHRASES.filter((p) => {
      if (scenario !== "all" && p.scenario !== scenario) return false;
      if (!query) return true;
      return (
        p.text[myLang].toLowerCase().includes(query) ||
        p.text[theirLang].toLowerCase().includes(query) ||
        p.text.en.toLowerCase().includes(query)
      );
    });
  }, [q, scenario, myLang, theirLang]);

  return (
    <AppShell title="Clinical phrasebook">
      <div className="space-y-5">
        <header>
          <h1 className="font-heading text-3xl tracking-tight">Phrasebook</h1>
          <p className="mt-1 text-muted">
            {langName(myLang, true)} and {langName(theirLang, true)}. Tap a line to hear it.
          </p>
        </header>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search phrases"
          className="h-12 w-full rounded-lg bg-elevated px-4 shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus:shadow-[0_0_0_2px_var(--color-accent)]"
        />

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setScenario("all")}
            className={cn(
              "h-10 shrink-0 rounded-full px-3 text-sm",
              scenario === "all" ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
            )}
          >
            All
          </button>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setScenario(s.id)}
              className={cn(
                "h-10 shrink-0 rounded-full px-3 text-sm",
                scenario === s.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <ul className="space-y-2">
          {list.map((p) => (
            <li key={p.id} className="rounded-lg bg-elevated p-4 shadow-[var(--shadow-border)]">
              <p className="text-[11px] uppercase tracking-wide text-subtle">{p.speaker}</p>
              <div className="mt-1 grid gap-3 sm:grid-cols-2">
                <div dir={myDir}>
                  <p className="text-xs text-muted">{langName(myLang)}</p>
                  <p className="text-base font-medium leading-snug">{p.text[myLang]}</p>
                  <button
                    type="button"
                    className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm text-accent"
                    onClick={() => speak(p.text[myLang], myLang)}
                  >
                    <Volume2 className="size-4" />
                    Hear
                  </button>
                </div>
                <div dir={theirDir}>
                  <p className="text-xs text-muted">{langName(theirLang)}</p>
                  <p className="text-base leading-snug">{p.text[theirLang]}</p>
                  <button
                    type="button"
                    className="mt-1 inline-flex min-h-11 items-center gap-1 text-sm text-accent"
                    onClick={() => speak(p.text[theirLang], theirLang)}
                  >
                    <Volume2 className="size-4" />
                    Hear
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        {list.length === 0 ? <p className="text-muted">No phrases match that search.</p> : null}
      </div>
    </AppShell>
  );
}
