import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { NewEncounterButton } from "@/components/new-encounter";
import { NOTE_TEMPLATES } from "@/lib/types";

export const Route = createFileRoute("/templates")({ component: TemplatesPage });

const GUIDANCE: Record<string, string[]> = {
  soap: ["Chief complaint in one line", "Subjective vs objective kept distinct", "Plan is actionable and safety-netted"],
  hp: ["HPI, PMH, meds, allergies, ROS", "Exam by system only from the transcript", "Impression before recommendations"],
  progress: ["Interval history only", "Response to last plan", "Today's focused exam and next step"],
  referral: ["Clinical question in the first paragraph", "Work-up already done", "Urgency and preferred contact"],
  discharge: ["Course in hospital or clinic", "Diagnoses and changes to meds", "Aftercare and red flags"],
  consult: ["Question asked of you", "Opinion and differentials", "What you will or will not take over"],
};

function TemplatesPage() {
  return (
    <AppShell>
      <main className="px-4 py-6 md:px-8 md:py-8">
        <p className="text-[11px] tracking-[0.22em] text-primary uppercase">MediTalk</p>
        <h1 className="font-display mt-2 text-4xl tracking-tight">Templates</h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Each encounter picks a shape. The model fills only what the consult supports — empty fields stay empty.
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {NOTE_TEMPLATES.map((t) => (
            <li key={t.id} className="flex flex-col rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
              <h2 className="font-display text-2xl tracking-tight">{t.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.summary}</p>
              <ul className="mt-4 flex-1 space-y-1.5 text-sm">
                {(GUIDANCE[t.id] ?? []).map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                    {line}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <NewEncounterButton variant="outline" templateId={t.id}>
                  Use {t.label}
                </NewEncounterButton>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </AppShell>
  );
}
