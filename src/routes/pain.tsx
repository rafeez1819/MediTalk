import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PainScale } from "@/components/pain-scale";
import { AppShell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { langName } from "@/lib/languages";
import { painPhrase } from "@/lib/pain";
import { speak } from "@/lib/speech";
import { useMediStore } from "@/lib/store";

export const Route = createFileRoute("/pain")({ component: PainPage });

function PainPage() {
  const navigate = useNavigate();
  const myLang = useMediStore((s) => s.myLang);
  const theirLang = useMediStore((s) => s.theirLang);
  const addMessage = useMediStore((s) => s.addMessage);
  const [value, setValue] = useState(4);
  const mine = painPhrase(value, myLang);
  const theirs = painPhrase(value, theirLang);

  return (
    <AppShell title="Pain scale">
      <div className="space-y-6">
        <header>
          <h1 className="font-heading text-3xl tracking-tight">How bad is the pain?</h1>
          <p className="mt-1 text-muted">
            0 is none. 10 is the worst pain imaginable. Point, then send it into the visit.
          </p>
        </header>
        <PainScale value={value} onChange={setValue} lang={myLang} />
        <div className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-lg bg-elevated p-4 shadow-[var(--shadow-border)]">
            <p className="text-xs text-muted">{langName(myLang, true)}</p>
            <p className="mt-1 font-heading text-xl">{mine}</p>
            <Button className="mt-3" variant="ghost" onClick={() => speak(mine, myLang)}>
              Hear
            </Button>
          </article>
          <article className="rounded-lg bg-mist p-4 shadow-[var(--shadow-border)]">
            <p className="text-xs text-accent">{langName(theirLang, true)}</p>
            <p className="mt-1 font-heading text-xl">{theirs}</p>
            <Button className="mt-3" variant="ghost" onClick={() => speak(theirs, theirLang)}>
              Hear
            </Button>
          </article>
        </div>
        <Button
          size="lg"
          onClick={() => {
            addMessage({
              from: "me",
              sourceLang: myLang,
              targetLang: theirLang,
              source: mine,
              translation: theirs,
            });
            void navigate({ to: "/talk" });
          }}
        >
          Send to conversation
        </Button>
      </div>
    </AppShell>
  );
}
