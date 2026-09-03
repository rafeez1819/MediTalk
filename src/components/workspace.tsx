import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  Copy,
  FileUp,
  LoaderCircle,
  Mic,
  Square,
  MessageSquare,
  PenLine,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { askCopilot, generateClinicalNote, refineSection, transcribeAudio } from "@/lib/ai";
import { formatNoteText } from "@/lib/export-note";
import { SAMPLE_HYPERTENSION_TRANSCRIPT, SAMPLE_PEDIATRIC_TRANSCRIPT } from "@/lib/samples";
import { blobToBase64, pickRecorderMime, speechSupported, startLiveDictation } from "@/lib/speech";
import { useMediTalk } from "@/lib/store";
import { templateLabel, visitTypeLabel, emptyNote, type ClinicalNote, type Encounter } from "@/lib/types";
import { cn, formatClock, initialsOf } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";

const SECTIONS: { key: keyof ClinicalNote; label: string }[] = [
  { key: "chiefComplaint", label: "Chief complaint" },
  { key: "history", label: "History" },
  { key: "subjective", label: "Subjective" },
  { key: "objective", label: "Objective" },
  { key: "assessment", label: "Assessment" },
  { key: "plan", label: "Plan" },
  { key: "followUp", label: "Follow-up" },
  { key: "patientInstructions", label: "Patient instructions" },
];

export function EncounterWorkspace({ encounter }: { encounter: Encounter }) {
  const settings = useMediTalk((s) => s.settings);
  const updateEncounter = useMediTalk((s) => s.updateEncounter);
  const setNote = useMediTalk((s) => s.setNote);
  const appendCopilot = useMediTalk((s) => s.appendCopilot);

  const [tab, setTab] = useState("note");
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(encounter.durationSec);
  const [interim, setInterim] = useState("");
  const [busyAudio, setBusyAudio] = useState(false);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [refining, setRefining] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);

  const dictationRef = useRef<{ stop: () => void } | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const locked = encounter.status === "signed";

  useEffect(() => {
    return () => {
      dictationRef.current?.stop();
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
    };
  }, []);

  function patchTranscript(next: string) {
    updateEncounter(encounter.id, { transcript: next, status: encounter.note ? "ready" : "draft" });
  }

  async function startRecording() {
    if (locked) return;
    setInterim("");
    sessionPrefix.current = encounter.transcript ? `${encounter.transcript.trim()}\n\n` : "";
    startedAtRef.current = Date.now() - encounter.durationSec * 1000;
    setRecording(true);
    updateEncounter(encounter.id, { status: "recording" });
    timerRef.current = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 250);

    if (speechSupported()) {
      dictationRef.current = startLiveDictation({
        onPartial: (finalText, live) => {
          setInterim(live);
          if (finalText) {
            const prefix = sessionPrefix.current;
            patchTranscript(`${prefix}${finalText}`.trim());
          }
        },
        onError: (msg) => toast.error(msg),
      });
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickRecorderMime();
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.start(1000);
      mediaRef.current = rec;
    } catch {
      toast.message("Microphone unavailable. You can still type or paste the consult.");
    }
  }

  const sessionPrefix = useRef(encounter.transcript ? `${encounter.transcript.trim()}\n\n` : "");

  async function stopRecording() {
    dictationRef.current?.stop();
    dictationRef.current = null;
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    setRecording(false);
    setInterim("");
    const durationSec = Math.floor((Date.now() - startedAtRef.current) / 1000);
    updateEncounter(encounter.id, { durationSec, status: encounter.note ? "ready" : "draft" });
    setElapsed(durationSec);

    const rec = mediaRef.current;
    mediaRef.current = null;
    if (!rec) return;

    const blob = await new Promise<Blob | null>((resolve) => {
      rec.onstop = () => {
        rec.stream.getTracks().forEach((t) => t.stop());
        const type = rec.mimeType || "audio/webm";
        resolve(new Blob(chunksRef.current, { type }));
      };
      if (rec.state !== "inactive") rec.stop();
      else resolve(null);
    });
    if (!blob || blob.size < 2000) return;

    setBusyAudio(true);
    try {
      const audioBase64 = await blobToBase64(blob);
      const result = await transcribeAudio({
        data: {
          audioBase64,
          mimeType: blob.type,
          fileName: `meditalk-${encounter.id}.webm`,
          keyterms: [encounter.specialty, encounter.patientLabel],
        },
      });
      if (result.ok && result.text) {
        const prefix = sessionPrefix.current;
        patchTranscript(`${prefix}${result.text}`.trim());
        if (result.duration) updateEncounter(encounter.id, { durationSec: Math.round(result.duration) });
        toast.success("Transcript enhanced from the recording.");
      }
    } catch {
      toast.message("Kept the live dictation. You can edit it below.");
    } finally {
      setBusyAudio(false);
    }
  }

  async function onUpload(file: File) {
    if (locked) return;
    setBusyAudio(true);
    try {
      const audioBase64 = await blobToBase64(file);
      const result = await transcribeAudio({
        data: {
          audioBase64,
          mimeType: file.type || "application/octet-stream",
          fileName: file.name || "consult.audio",
          keyterms: [encounter.specialty],
        },
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      const joined = encounter.transcript ? `${encounter.transcript.trim()}\n\n${result.text}` : result.text;
      updateEncounter(encounter.id, {
        transcript: joined,
        durationSec: Math.round(result.duration) || encounter.durationSec,
        status: encounter.note ? "ready" : "draft",
      });
      toast.success("Audio transcribed.");
    } catch {
      toast.error("Could not read that audio file.");
    } finally {
      setBusyAudio(false);
    }
  }

  async function draftNote() {
    if (locked) return;
    setDrafting(true);
    setDraftError(null);
    try {
      const result = await generateClinicalNote({
        data: {
          transcript: encounter.transcript,
          specialty: encounter.specialty,
          visitType: encounter.visitType,
          templateId: encounter.templateId,
          patientLabel: encounter.patientLabel,
          patientAge: encounter.patientAge,
          patientSex: encounter.patientSex,
        },
      });
      if (!result.ok) {
        setDraftError(result.error);
        toast.error(result.error);
        return;
      }
      setNote(encounter.id, result.note);
      setTab("note");
      toast.success("Draft ready for review.");
    } catch {
      const msg = "Drafting failed. Try again, or write the note yourself.";
      setDraftError(msg);
      toast.error(msg);
    } finally {
      setDrafting(false);
    }
  }

  function startBlankNote() {
    if (locked) return;
    setNote(encounter.id, emptyNote());
    setTab("note");
  }

  function updateNoteField<K extends keyof ClinicalNote>(key: K, value: ClinicalNote[K]) {
    if (!encounter.note || locked) return;
    setNote(encounter.id, { ...encounter.note, [key]: value });
  }

  async function rewrite(section: keyof ClinicalNote, instruction: string) {
    if (!encounter.note || locked) return;
    const current = encounter.note[section];
    if (typeof current !== "string") return;
    setRefining(section);
    try {
      const result = await refineSection({
        data: {
          section,
          text: current,
          instruction,
          transcript: encounter.transcript,
        },
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      updateNoteField(section, result.text.trim() as ClinicalNote[typeof section]);
    } finally {
      setRefining(null);
    }
  }

  async function copyNote() {
    if (!encounter.note) return;
    const text = formatNoteText(encounter, settings, encounter.note);
    await navigator.clipboard.writeText(text);
    toast.success("Note copied.");
  }

  async function sendCopilot(preset?: string) {
    const q = (preset ?? question).trim();
    if (!q) return;
    setAsking(true);
    appendCopilot(encounter.id, { role: "user", text: q });
    setQuestion("");
    try {
      const result = await askCopilot({
        data: {
          question: q,
          transcript: encounter.transcript,
          noteJson: encounter.note ? JSON.stringify(encounter.note) : "",
          specialty: encounter.specialty,
        },
      });
      appendCopilot(encounter.id, {
        role: "assistant",
        text: result.ok ? result.text : result.error,
      });
    } finally {
      setAsking(false);
    }
  }

  const demo = encounter.specialty === "Pediatrics" ? SAMPLE_PEDIATRIC_TRANSCRIPT : SAMPLE_HYPERTENSION_TRANSCRIPT;

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col md:min-h-dvh">
      <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 md:px-6">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link to="/" aria-label="Back to board">
            <ArrowLeft />
          </Link>
        </Button>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground">
          {initialsOf(encounter.patientLabel)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-lg leading-tight font-medium tracking-tight">
              {encounter.patientLabel}
              {encounter.patientAge ? ` · ${encounter.patientAge}` : ""}
              {encounter.patientSex}
            </h1>
            <Badge variant={locked ? "signed" : recording ? "live" : "outline"}>
              {locked ? "Signed" : recording ? "Recording" : encounter.note ? "Draft" : "Open"}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {encounter.specialty} · {visitTypeLabel(encounter.visitType)} · {templateLabel(encounter.templateId)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCopilotOpen(true)}>
            <MessageSquare />
            Copilot
          </Button>
          <Button size="sm" onClick={draftNote} disabled={locked || drafting || encounter.transcript.trim().length < 40}>
            {drafting ? <LoaderCircle className="animate-spin" /> : <PenLine />}
            {encounter.note ? "Redraft" : "Draft note"}
          </Button>
        </div>
      </header>

      <div className="grid flex-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        <section className="flex min-h-0 flex-col border-b border-border lg:border-r lg:border-b-0">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
            <div>
              <p className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">Transcript</p>
              <p className="font-mono text-sm tabular-nums">{formatClock(elapsed)}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onUpload(file);
                  e.target.value = "";
                }}
              />
              <Button variant="outline" size="sm" disabled={locked || busyAudio} onClick={() => fileRef.current?.click()}>
                <FileUp />
                Audio
              </Button>
              {recording ? (
                <Button variant="destructive" size="sm" onClick={() => void stopRecording()}>
                  <Square />
                  Stop
                </Button>
              ) : (
                <Button size="sm" disabled={locked} onClick={() => void startRecording()}>
                  <Mic />
                  Record
                </Button>
              )}
            </div>
          </div>
          {recording ? (
            <div className="mx-4 mb-3 flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive md:mx-5">
              <span className="live-dot size-2 rounded-full bg-live" />
              Live capture. Speak in turns — clinician, then patient.
            </div>
          ) : null}
          {busyAudio ? (
            <p className="px-4 pb-2 text-xs text-muted-foreground md:px-5">Enhancing transcript from audio…</p>
          ) : null}
          <Textarea
            className="min-h-64 flex-1 resize-none rounded-none border-0 bg-transparent px-4 font-mono text-[13px] leading-relaxed shadow-none focus-visible:ring-0 md:px-5"
            value={encounter.transcript + (interim ? (encounter.transcript ? " " : "") + interim : "")}
            onChange={(e) => patchTranscript(e.target.value)}
            readOnly={locked || recording}
            placeholder="Record the consult, paste a transcript, or load a sample below."
          />
          <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3 md:px-5">
            <Button
              variant="secondary"
              size="sm"
              disabled={locked}
              onClick={() => {
                sessionPrefix.current = "";
                patchTranscript(demo);
                toast.message("Sample consult loaded. Draft a note when you are ready.");
              }}
            >
              Load sample consult
            </Button>
          </div>
        </section>

        <section className="flex min-h-0 flex-col bg-card/40">
          <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5">
              <TabsList>
                <TabsTrigger value="note">Note</TabsTrigger>
                <TabsTrigger value="codes">Codes</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={!encounter.note} onClick={() => void copyNote()}>
                  <Copy />
                  Copy
                </Button>
                {locked ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateEncounter(encounter.id, { status: "ready" })}
                  >
                    Unlock
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={!encounter.note}
                    onClick={() => updateEncounter(encounter.id, { status: "signed" })}
                  >
                    <Check />
                    Sign
                  </Button>
                )}
              </div>
            </div>
            <TabsContent value="note" className="mt-0 min-h-0 flex-1">
              <ScrollArea className="h-full max-h-[calc(100dvh-12rem)]">
                <div className="note-paper space-y-5 px-4 pb-24 md:px-6">
                  {!encounter.note ? (
                    <EmptyNote
                      drafting={drafting}
                      error={draftError}
                      locked={locked}
                      onDraft={() => void draftNote()}
                      onWrite={startBlankNote}
                      disabled={encounter.transcript.trim().length < 40}
                    />
                  ) : (
                    <>
                      {SECTIONS.map((section) => {
                        const value = encounter.note?.[section.key];
                        if (typeof value !== "string") return null;
                        return (
                          <NoteField
                            key={section.key}
                            label={section.label}
                            value={value}
                            locked={locked}
                            busy={refining === section.key}
                            onChange={(v) => updateNoteField(section.key, v)}
                            onTighten={() => void rewrite(section.key, "Make this more concise, keep clinical facts.")}
                            onExpand={() => void rewrite(section.key, "Expand slightly with clearer clinical phrasing, still faithful to the transcript.")}
                          />
                        );
                      })}
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="codes" className="mt-0 px-4 pb-24 md:px-6">
              {!encounter.note ? (
                <p className="text-sm text-muted-foreground">Draft a note to see suggested ICD-10 codes and medications.</p>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-display text-lg">Suggested diagnoses</h2>
                    <p className="text-xs text-muted-foreground">Confirm against a licensed codebook before billing.</p>
                    <ul className="mt-3 space-y-2">
                      {encounter.note.diagnoses.length === 0 ? (
                        <li className="text-sm text-muted-foreground">None extracted.</li>
                      ) : (
                        encounter.note.diagnoses.map((d, i) => (
                          <li key={`${d.icd10}-${i}`} className="rounded-lg bg-card p-3 shadow-[var(--shadow-border)]">
                            <div className="flex items-baseline justify-between gap-3">
                              <p className="text-sm font-medium">{d.term}</p>
                              <span className="font-mono text-xs text-primary">{d.icd10 || "—"}</span>
                            </div>
                            {d.rationale ? <p className="mt-1 text-xs text-muted-foreground">{d.rationale}</p> : null}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  <div>
                    <h2 className="font-display text-lg">Medications mentioned</h2>
                    <ul className="mt-3 space-y-2">
                      {encounter.note.medications.length === 0 ? (
                        <li className="text-sm text-muted-foreground">None extracted.</li>
                      ) : (
                        encounter.note.medications.map((m, i) => (
                          <li key={`${m.name}-${i}`} className="rounded-lg bg-card p-3 shadow-[var(--shadow-border)]">
                            <p className="text-sm font-medium">{m.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {m.dose}
                              {m.instructions ? ` — ${m.instructions}` : ""}
                            </p>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  {encounter.note.redFlags.length ? (
                    <div>
                      <h2 className="font-display text-lg">Safety-net</h2>
                      <ul className="mt-2 list-disc pl-5 text-sm">
                        {encounter.note.redFlags.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {encounter.note.missingInformation.length ? (
                    <div>
                      <h2 className="font-display text-lg">Not in the transcript</h2>
                      <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                        {encounter.note.missingInformation.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>

      <Sheet open={copilotOpen} onOpenChange={setCopilotOpen}>
        <SheetContent className="bg-card">
          <SheetHeader>
            <SheetTitle>MediTalk copilot</SheetTitle>
            <SheetDescription>Ask about gaps, wording, or coding. Not a diagnostic engine.</SheetDescription>
          </SheetHeader>
          <div className="flex flex-wrap gap-2 px-5">
            {[
              "What is missing from this history?",
              "List red flags I should safety-net.",
              "Draft a short patient-facing summary.",
            ].map((q) => (
              <button
                key={q}
                type="button"
                className="rounded-full bg-muted px-3 py-1.5 text-left text-xs text-foreground"
                onClick={() => void sendCopilot(q)}
              >
                {q}
              </button>
            ))}
          </div>
          <ScrollArea className="min-h-0 flex-1 px-5 py-4">
            <div className="space-y-3">
              {encounter.copilot.length === 0 ? (
                <p className="text-sm text-muted-foreground">Questions stay with this encounter on this device.</p>
              ) : (
                encounter.copilot.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm leading-relaxed",
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    {m.text}
                  </div>
                ))
              )}
              {asking ? <p className="text-xs text-muted-foreground">Thinking…</p> : null}
            </div>
          </ScrollArea>
          <form
            className="flex gap-2 border-t border-border p-4"
            onSubmit={(e) => {
              e.preventDefault();
              void sendCopilot();
            }}
          >
            <input
              className="h-11 flex-1 rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              placeholder="Ask about this consult"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Button type="submit" size="icon" disabled={asking || !question.trim()}>
              <Send />
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function EmptyNote({
  drafting,
  error,
  locked,
  onDraft,
  onWrite,
  disabled,
}: {
  drafting: boolean;
  error: string | null;
  locked: boolean;
  onDraft: () => void;
  onWrite: () => void;
  disabled: boolean;
}) {
  return (
    <div className="rounded-xl bg-card p-6 shadow-[var(--shadow-border)]">
      <h2 className="font-display text-2xl tracking-tight">The page is still blank</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Capture the consult on the left, then draft. MediTalk will structure SOAP, codes, and patient instructions
        without inventing findings that were not said.
      </p>
      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      <div className="mt-5 flex flex-wrap gap-2">
        <Button onClick={onDraft} disabled={disabled || drafting || locked}>
          {drafting ? <LoaderCircle className="animate-spin" /> : <PenLine />}
          {drafting ? "Drafting…" : "Draft note"}
        </Button>
        <Button variant="outline" onClick={onWrite} disabled={locked}>
          Write myself
        </Button>
      </div>
    </div>
  );
}

function NoteField({
  label,
  value,
  locked,
  busy,
  onChange,
  onTighten,
  onExpand,
}: {
  label: string;
  value: string;
  locked: boolean;
  busy: boolean;
  onChange: (v: string) => void;
  onTighten: () => void;
  onExpand: () => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Label>{label}</Label>
        {!locked ? (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-8 text-[11px]" disabled={busy || !value} onClick={onTighten}>
              Tighten
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-[11px]" disabled={busy} onClick={onExpand}>
              Expand
            </Button>
          </div>
        ) : null}
      </div>
      <Textarea
        className="min-h-28 bg-card/80 leading-relaxed"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={locked}
      />
    </div>
  );
}
