import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeftRight, BookOpen, CircleHelp, HeartPulse } from "lucide-react";
import { Disclaimer } from "@/components/disclaimer";
import { LangGrid } from "@/components/lang-grid";
import { MediMark } from "@/components/mark";
import { AppShell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { useMediStore } from "@/lib/store";
import { langName } from "@/lib/languages";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const navigate = useNavigate();
  const role = useMediStore((s) => s.role);
  const myLang = useMediStore((s) => s.myLang);
  const theirLang = useMediStore((s) => s.theirLang);
  const setRole = useMediStore((s) => s.setRole);
  const setLangs = useMediStore((s) => s.setLangs);
  const swapLangs = useMediStore((s) => s.swapLangs);
  const startVisit = useMediStore((s) => s.startVisit);

  return (
    <AppShell title="Start a visit">
      <div className="stagger-in space-y-8">
        <section className="rounded-xl bg-elevated px-5 py-7 shadow-[var(--shadow-border)] sm:px-8">
          <div className="flex items-start gap-4">
            <span className="text-accent">
              <MediMark className="size-12" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
                Bedside interpreter
              </p>
              <h1 className="mt-1 font-heading text-4xl leading-[1.1] tracking-tight">
                Clear talk at the bedside.
              </h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
                Hand the phone across the room. MediTalk translates care conversations, keeps a
                clinical phrasebook ready, and turns jargon into everyday words.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted">I am a</h2>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "clinician" as const, label: "Clinician", hint: "Nurse, doctor, staff" },
                { id: "patient" as const, label: "Patient", hint: "Or family member" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRole(opt.id)}
                className={`min-h-16 rounded-lg px-4 py-3 text-left shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] ${
                  role === opt.id ? "bg-accent text-accent-fg" : "bg-elevated hover:bg-mist"
                }`}
              >
                <span className="block text-base font-medium">{opt.label}</span>
                <span className={`text-xs ${role === opt.id ? "text-accent-fg/80" : "text-muted"}`}>
                  {opt.hint}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-medium text-muted">I speak</h2>
            <button
              type="button"
              onClick={swapLangs}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm text-accent"
            >
              <ArrowLeftRight className="size-4" />
              Swap
            </button>
          </div>
          <LangGrid
            value={myLang}
            onChange={(id) => setLangs(id, id === theirLang ? myLang : theirLang)}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted">They speak</h2>
          <LangGrid
            value={theirLang}
            exclude={myLang}
            onChange={(id) => setLangs(id === myLang ? theirLang : myLang, id)}
          />
        </section>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="flex-1"
            onClick={() => {
              startVisit();
              void navigate({ to: "/talk" });
            }}
          >
            Start conversation
          </Button>
          <Button size="lg" variant="secondary" onClick={() => void navigate({ to: "/phrases" })}>
            Phrasebook
          </Button>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {[
            {
              to: "/pain" as const,
              icon: HeartPulse,
              label: "Pain scale",
              hint: "0–10 with faces",
            },
            {
              to: "/terms" as const,
              icon: CircleHelp,
              label: "Terms",
              hint: "Plain-language glossary",
            },
            { to: "/learn" as const, icon: BookOpen, label: "Learn", hint: "Staff language drill" },
          ].map((card) => (
            <button
              key={card.to}
              type="button"
              onClick={() => void navigate({ to: card.to })}
              className="flex min-h-20 items-start gap-3 rounded-lg bg-elevated px-4 py-4 text-left shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out hover:bg-mist active:scale-[0.96]"
            >
              <card.icon className="mt-0.5 size-5 text-accent" />
              <span>
                <span className="block font-medium">{card.label}</span>
                <span className="text-xs text-muted">{card.hint}</span>
              </span>
            </button>
          ))}
        </div>

        <p className="text-sm text-muted">
          Session: {langName(myLang, true)} with {langName(theirLang, true)}.
        </p>
        <Disclaimer />
      </div>
    </AppShell>
  );
}
