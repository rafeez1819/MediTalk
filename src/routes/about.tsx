import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/shell";

export const Route = createFileRoute("/about")({ component: AboutPage });

function AboutPage() {
  return (
    <AppShell title="About & safety">
      <article className="space-y-5">
        <header>
          <h1 className="font-heading text-3xl tracking-tight">MediTalk</h1>
          <p className="mt-2 text-lg text-muted">Clear talk at the bedside.</p>
        </header>
        <p className="leading-relaxed">
          MediTalk is a face-to-face medical interpreter for clinics, emergency rooms, pharmacies,
          and home care. Choose two languages, then speak, type, or tap a phrase. The other person
          can read a full-screen line in their language.
        </p>
        <section className="rounded-lg bg-elevated p-4 shadow-[var(--shadow-border)]">
          <h2 className="font-heading text-xl">What it is</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
            <li>Two-way translation for care conversations</li>
            <li>
              A clinical phrasebook for greetings, emergency, symptoms, pain, allergies, medicines,
              history, consent, discharge, and pharmacy
            </li>
            <li>A 0–10 pain scale and a body map for pointing</li>
            <li>A plain-language glossary of common medical terms</li>
            <li>A short staff drill for Spanish phrases and term literacy</li>
            <li>Visit notes stored only in this browser</li>
          </ul>
        </section>
        <section className="rounded-lg bg-sand p-4 shadow-[var(--shadow-border)]">
          <h2 className="font-heading text-xl">What it is not</h2>
          <p className="mt-2 text-sm leading-relaxed">
            MediTalk is not a certified medical interpreter, a diagnostic tool, or a substitute for
            professional medical advice. For high-stakes consent, surgery, mental health crises, or
            legal decisions, call a qualified interpreter. Always confirm critical instructions with
            a licensed clinician.
          </p>
        </section>
        <p className="text-sm leading-relaxed text-muted">
          Live translation uses the xAI language model when a phrase is not in the onboard
          phrasebook. Voice uses the microphone and speaker on this device. Nothing is uploaded to a
          patient chart unless you copy it.
        </p>
        <p>
          <Link to="/" className="text-accent underline underline-offset-2">
            Back to start
          </Link>
        </p>
      </article>
    </AppShell>
  );
}
