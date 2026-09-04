import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { langName } from "@/lib/languages";
import { speak } from "@/lib/speech";
import { useMediStore } from "@/lib/store";
import { searchTerms } from "@/lib/terms";
import { translateClient } from "@/lib/translate";

export const Route = createFileRoute("/terms")({ component: TermsPage });

function TermsPage() {
  const myLang = useMediStore((s) => s.myLang);
  const theirLang = useMediStore((s) => s.theirLang);
  const [q, setQ] = useState("");
  const [extra, setExtra] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const list = useMemo(() => searchTerms(q, myLang), [q, myLang]);

  async function explain() {
    const text = q.trim();
    if (!text) return;
    setBusy(true);
    setError(null);
    try {
      const result = await translateClient({
        text,
        sourceLang: myLang,
        targetLang: theirLang,
        mode: "term",
      });
      if (!result.ok) setError(result.error);
      else setExtra([result.translation, result.plain].filter(Boolean).join("\n\n"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="Plain-language terms">
      <div className="space-y-5">
        <header>
          <h1 className="font-heading text-3xl tracking-tight">Medical terms</h1>
          <p className="mt-1 text-muted">
            Everyday wording in {langName(myLang, true)} and {langName(theirLang, true)}.
          </p>
        </header>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search or type a term to explain"
            className="h-12 flex-1 rounded-lg bg-elevated px-4 shadow-[var(--shadow-border)] outline-none placeholder:text-subtle focus:shadow-[0_0_0_2px_var(--color-accent)]"
          />
          <Button onClick={() => void explain()} disabled={busy || !q.trim()}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Explain
          </Button>
        </div>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {extra ? (
          <article className="rounded-lg bg-mist p-4 whitespace-pre-wrap shadow-[var(--shadow-border)]">
            {extra}
          </article>
        ) : null}
        <ul className="space-y-2">
          {list.map((t) => (
            <li key={t.id} className="rounded-lg bg-elevated p-4 shadow-[var(--shadow-border)]">
              <p className="font-heading text-xl">{t.term[myLang]}</p>
              <p className="text-sm text-muted">{t.term[theirLang]}</p>
              <p className="mt-2 leading-relaxed">{t.plain[myLang]}</p>
              <p className="mt-1 text-sm text-muted">{t.plain[theirLang]}</p>
              <button
                type="button"
                className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm text-accent"
                onClick={() => speak(t.plain[theirLang], theirLang)}
              >
                <Volume2 className="size-4" />
                Hear explanation
              </button>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
