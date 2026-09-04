import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { langName } from "@/lib/languages";
import { useMediStore, type Visit } from "@/lib/store";
import { formatTime } from "@/lib/utils";

export const Route = createFileRoute("/history")({ component: HistoryPage });

function visitText(v: Visit) {
  const lines = [
    `MediTalk visit · ${formatTime(v.startedAt)}`,
    `${langName(v.myLang)} ↔ ${langName(v.theirLang)} · ${v.role}`,
    "",
    ...v.messages.map(
      (m) => `${m.source}\n${m.translation}${m.plain ? `\n(${m.plain})` : ""}`,
    ),
  ];
  return lines.join("\n\n");
}

function HistoryPage() {
  const visits = useMediStore((s) => s.visits);
  const clearHistory = useMediStore((s) => s.clearHistory);
  const [openId, setOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function copy(v: Visit) {
    try {
      await navigator.clipboard.writeText(visitText(v));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <AppShell title="Visit notes">
      <div className="space-y-5">
        <header className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl tracking-tight">Visits</h1>
            <p className="mt-1 text-muted">
              Saved only on this device. Copy a note to the chart if your workflow allows it.
            </p>
          </div>
          {visits.length ? (
            <Button variant="ghost" size="sm" onClick={clearHistory}>
              Clear
            </Button>
          ) : null}
        </header>
        {visits.length === 0 ? (
          <p className="rounded-lg bg-elevated px-4 py-8 text-center text-muted shadow-[var(--shadow-border)]">
            No visits yet. Start a conversation to keep a local transcript.
          </p>
        ) : (
          <ul className="space-y-2">
            {visits.map((v) => {
              const open = openId === v.id;
              return (
                <li key={v.id} className="rounded-lg bg-elevated shadow-[var(--shadow-border)]">
                  <button
                    type="button"
                    className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    onClick={() => setOpenId(open ? null : v.id)}
                  >
                    <span>
                      <span className="block font-medium">{formatTime(v.startedAt)}</span>
                      <span className="text-xs text-muted">
                        {langName(v.myLang, true)} · {langName(v.theirLang, true)} ·{" "}
                        {v.messages.length} lines
                      </span>
                    </span>
                    <span className="text-sm text-accent">{open ? "Hide" : "Open"}</span>
                  </button>
                  {open ? (
                    <div className="space-y-3 border-t border-line px-4 py-3">
                      {v.messages.length === 0 ? (
                        <p className="text-sm text-muted">Empty visit.</p>
                      ) : (
                        v.messages.map((m) => (
                          <div key={m.id} className="text-sm">
                            <p>{m.source}</p>
                            <p className="font-medium">{m.translation}</p>
                          </div>
                        ))
                      )}
                      <Button size="sm" variant="secondary" onClick={() => void copy(v)}>
                        {copied ? "Copied" : "Copy note"}
                      </Button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
