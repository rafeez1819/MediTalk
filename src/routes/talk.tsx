import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  BookOpen,
  HeartPulse,
  Loader2,
  Maximize2,
  Mic,
  Send,
  Volume2,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { BodyMap } from "@/components/body-map";
import { PainScale } from "@/components/pain-scale";
import { AppShell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { getLang, langName, type Lang } from "@/lib/languages";
import { painPhrase } from "@/lib/pain";
import { PHRASES, SCENARIOS, type ScenarioId } from "@/lib/phrases";
import { canListen, listenOnce, speak } from "@/lib/speech";
import { useMediStore } from "@/lib/store";
import { translateClient } from "@/lib/translate";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/talk")({ component: TalkPage });

function TalkPage() {
  const role = useMediStore((s) => s.role);
  const myLang = useMediStore((s) => s.myLang);
  const theirLang = useMediStore((s) => s.theirLang);
  const swapLangs = useMediStore((s) => s.swapLangs);
  const autoSpeak = useMediStore((s) => s.autoSpeak);
  const setAutoSpeak = useMediStore((s) => s.setAutoSpeak);
  const addMessage = useMediStore((s) => s.addMessage);
  const endVisit = useMediStore((s) => s.endVisit);
  const visit = useMediStore((s) => s.visits.find((v) => v.id === s.activeVisitId) ?? null);

  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<string | null>(null);
  const [tool, setTool] = useState<"phrases" | "pain" | "body" | null>(null);
  const [scenario, setScenario] = useState<ScenarioId>("symptoms");
  const [pain, setPain] = useState(4);
  const [region, setRegion] = useState<string>();
  const listRef = useRef<HTMLDivElement>(null);

  const myMeta = getLang(myLang);
  const theirMeta = getLang(theirLang);
  const messages = visit?.messages ?? [];
  const last = messages[messages.length - 1];

  const shortcuts = useMemo(
    () => PHRASES.filter((p) => p.scenario === scenario).slice(0, 6),
    [scenario],
  );

  async function runTranslate(text: string, from: "me" | "them" = "me") {
    const source = text.trim();
    if (!source || busy) return;
    setBusy(true);
    setError(null);
    setDraft("");
    const sourceLang: Lang = from === "me" ? myLang : theirLang;
    const targetLang: Lang = from === "me" ? theirLang : myLang;
    try {
      const result = await translateClient({ text: source, sourceLang, targetLang });
      if (!result.ok) {
        setError(result.error);
        setDraft(source);
        return;
      }
      addMessage({
        from,
        sourceLang,
        targetLang,
        source,
        translation: result.translation,
        plain: result.plain || undefined,
      });
      if (autoSpeak) speak(result.translation, targetLang);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      });
    } finally {
      setBusy(false);
    }
  }

  async function onMic() {
    if (!canListen()) {
      setError("Voice input is not available in this browser. Type instead.");
      return;
    }
    setListening(true);
    setError(null);
    try {
      const heard = await listenOnce(myLang);
      if (heard) await runTranslate(heard, "me");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Microphone failed.");
    } finally {
      setListening(false);
    }
  }

  return (
    <AppShell
      wide
      title={`${langName(myLang, true)} · ${langName(theirLang, true)}`}
      action={
        <Button size="sm" variant="ghost" onClick={endVisit}>
          End visit
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-mist px-3 py-1 text-xs font-medium text-accent">
            {role === "clinician" ? "Clinician view" : "Patient view"}
          </span>
          <button
            type="button"
            onClick={swapLangs}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm text-accent"
          >
            <ArrowLeftRight className="size-4" />
            Swap languages
          </button>
          <label className="ml-auto inline-flex min-h-11 items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={autoSpeak}
              onChange={(e) => setAutoSpeak(e.target.checked)}
              className="size-4 accent-accent"
            />
            Speak translations
          </label>
        </div>

        <section
          className="rounded-xl bg-mist px-4 py-4 shadow-[var(--shadow-border)]"
          dir={theirMeta.dir}
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
              Show them · {theirMeta.native}
            </p>
            {last ? (
              <button
                type="button"
                className="inline-flex min-h-11 items-center gap-1 text-sm text-accent"
                onClick={() => setHandoff(last.translation)}
              >
                <Maximize2 className="size-4" />
                Full screen
              </button>
            ) : null}
          </div>
          <p className="font-heading text-2xl leading-snug sm:text-3xl">
            {last?.translation ?? "A translation will appear here in their language."}
          </p>
          {last?.plain ? (
            <p className="mt-2 text-sm text-muted">{last.plain}</p>
          ) : null}
        </section>

        <div ref={listRef} className="max-h-56 space-y-2 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-sm text-muted">
              Type, speak, or tap a phrase. Each line is saved to this visit on this device.
            </p>
          ) : (
            messages.map((m) => (
              <article
                key={m.id}
                className={cn(
                  "rounded-lg px-3 py-2 shadow-[var(--shadow-border)]",
                  m.from === "me" ? "bg-elevated" : "bg-sand",
                )}
              >
                <p className="text-[11px] uppercase tracking-wide text-muted">
                  {m.from === "me" ? langName(m.sourceLang) : langName(m.sourceLang)} →{" "}
                  {langName(m.targetLang)}
                </p>
                <p className="text-sm">{m.source}</p>
                <p className="font-medium">{m.translation}</p>
              </article>
            ))
          )}
        </div>

        <form
          className="rounded-xl bg-elevated p-3 shadow-[var(--shadow-border)]"
          dir={myMeta.dir}
          onSubmit={(e) => {
            e.preventDefault();
            void runTranslate(draft);
          }}
        >
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.14em] text-muted">
            You · {myMeta.native}
          </label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Speak or type in your language…"
            className="w-full resize-none rounded-md bg-bg px-3 py-3 text-base outline-none ring-0 placeholder:text-subtle focus:shadow-[0_0_0_2px_var(--color-accent)]"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="submit" disabled={busy || !draft.trim()} className="min-w-28">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Translate
            </Button>
            <Button
              type="button"
              variant={listening ? "primary" : "secondary"}
              onClick={() => void onMic()}
              disabled={busy}
            >
              <Mic className="size-4" />
              {listening ? "Listening" : "Speak"}
            </Button>
            {last ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => speak(last.translation, last.targetLang)}
              >
                <Volume2 className="size-4" />
                Repeat
              </Button>
            ) : null}
          </div>
          {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
        </form>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={tool === "phrases" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setTool(tool === "phrases" ? null : "phrases")}
          >
            <BookOpen className="size-4" />
            Phrases
          </Button>
          <Button
            variant={tool === "pain" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setTool(tool === "pain" ? null : "pain")}
          >
            <HeartPulse className="size-4" />
            Pain
          </Button>
          <Button
            variant={tool === "body" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setTool(tool === "body" ? null : "body")}
          >
            Point
          </Button>
        </div>

        {tool === "phrases" ? (
          <div className="space-y-3 rounded-xl bg-elevated p-4 shadow-[var(--shadow-border)]">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScenario(s.id)}
                  className={cn(
                    "h-10 shrink-0 rounded-full px-3 text-sm",
                    scenario === s.id ? "bg-accent text-accent-fg" : "bg-bg text-muted",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="grid gap-2">
              {shortcuts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => void runTranslate(p.text[myLang])}
                  className="rounded-md bg-bg px-3 py-3 text-left text-sm hover:bg-mist"
                >
                  <span className="block font-medium">{p.text[myLang]}</span>
                  <span className="text-muted">{p.text[theirLang]}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {tool === "pain" ? (
          <div className="space-y-3 rounded-xl bg-elevated p-4 shadow-[var(--shadow-border)]">
            <PainScale value={pain} onChange={setPain} lang={myLang} />
            <Button onClick={() => void runTranslate(painPhrase(pain, myLang))}>
              Send pain score
            </Button>
          </div>
        ) : null}

        {tool === "body" ? (
          <div className="space-y-3 rounded-xl bg-elevated p-4 shadow-[var(--shadow-border)]">
            <BodyMap
              lang={myLang}
              selected={region}
              onSelect={(r) => {
                setRegion(r.id);
                void runTranslate(r.phrase[myLang]);
              }}
            />
            <p className="text-xs text-muted">
              Tap a region to send “it hurts here” in both languages.
            </p>
          </div>
        ) : null}
      </div>

      {handoff ? (
        <div className="fixed inset-0 z-40 flex flex-col bg-bg">
          <div className="flex justify-end p-3">
            <Button variant="ghost" size="icon" onClick={() => setHandoff(null)} aria-label="Close">
              <X className="size-5" />
            </Button>
          </div>
          <div
            className="flex flex-1 items-center justify-center px-6 pb-16"
            dir={theirMeta.dir}
          >
            <p className="max-w-2xl text-center font-heading text-4xl leading-tight sm:text-5xl">
              {handoff}
            </p>
          </div>
          <div className="flex justify-center gap-3 pb-8">
            <Button onClick={() => speak(handoff, theirLang)}>
              <Volume2 className="size-4" />
              Speak
            </Button>
            <Button variant="secondary" onClick={() => setHandoff(null)}>
              Done
            </Button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
