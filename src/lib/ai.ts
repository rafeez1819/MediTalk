import { createServerFn } from "@tanstack/react-start";
import type { ClinicalNote, NoteTemplateId } from "./types";
import { emptyNote } from "./types";

const MODEL = "grok-4.5";

type ChatOk = { ok: true; text: string };
type ChatErr = { ok: false; error: string };
type ChatResult = ChatOk | ChatErr;

async function chat(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  maxTokens: number,
): Promise<ChatResult> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false, error: "AI is not available in this environment." };

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: maxTokens,
      messages,
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const errBody = (await res.json()) as { error?: string; code?: string };
      detail = errBody.error ?? errBody.code ?? "";
    } catch {
      /* ignore */
    }
    if (res.status === 403 || /credits|spending-limit|quota/i.test(detail)) {
      return {
        ok: false,
        error:
          "AI drafting is paused for this workspace (quota). Open the signed M.R. encounter to review a finished note, or write this one yourself.",
      };
    }
    return { ok: false, error: `MediTalk could not reach the model (${res.status}).` };
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = body.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) return { ok: false, error: "The model returned an empty draft." };
  return { ok: true, text };
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? text).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON object in model output");
  return JSON.parse(raw.slice(start, end + 1));
}

function asString(v: unknown) {
  return typeof v === "string" ? v : "";
}

function asStringList(v: unknown) {
  if (!Array.isArray(v)) return [];
  return v.map((x) => (typeof x === "string" ? x : "")).filter(Boolean);
}

function parseNote(text: string): ClinicalNote {
  const raw = extractJson(text) as Record<string, unknown>;
  const diagnoses = Array.isArray(raw.diagnoses)
    ? raw.diagnoses
        .map((d) => {
          if (!d || typeof d !== "object") return null;
          const row = d as Record<string, unknown>;
          return {
            term: asString(row.term),
            icd10: asString(row.icd10),
            rationale: asString(row.rationale),
          };
        })
        .filter((d): d is ClinicalNote["diagnoses"][number] => Boolean(d && d.term))
    : [];
  const medications = Array.isArray(raw.medications)
    ? raw.medications
        .map((m) => {
          if (!m || typeof m !== "object") return null;
          const row = m as Record<string, unknown>;
          return {
            name: asString(row.name),
            dose: asString(row.dose),
            instructions: asString(row.instructions),
          };
        })
        .filter((m): m is ClinicalNote["medications"][number] => Boolean(m && m.name))
    : [];

  return {
    ...emptyNote(),
    chiefComplaint: asString(raw.chiefComplaint),
    history: asString(raw.history),
    subjective: asString(raw.subjective),
    objective: asString(raw.objective),
    assessment: asString(raw.assessment),
    plan: asString(raw.plan),
    diagnoses,
    medications,
    followUp: asString(raw.followUp),
    patientInstructions: asString(raw.patientInstructions),
    redFlags: asStringList(raw.redFlags),
    missingInformation: asStringList(raw.missingInformation),
  };
}

const SYSTEM_NOTE = `You are MediTalk, a clinical documentation assistant for licensed clinicians.
Draft notes strictly from the provided consult transcript. Do not invent vital signs, exam findings, medications, allergies, or diagnoses that are not supported by the transcript.
If a finding is absent, leave the field as an empty string or list it in missingInformation.
ICD-10 codes are suggestions only and must be marked as such in rationale.
Output a single JSON object with keys:
chiefComplaint, history, subjective, objective, assessment, plan,
diagnoses (array of {term, icd10, rationale}),
medications (array of {name, dose, instructions}),
followUp, patientInstructions,
redFlags (string array),
missingInformation (string array).
Match the requested template:
- soap: classic SOAP structure
- hp: history & physical, richer history and exam
- progress: interval history and focused plan
- referral: assessment + plan written as a specialist referral (clinical question in plan)
- discharge: course, diagnoses, aftercare
- consult: opinion and recommendations
Write in professional clinical prose. No markdown. JSON only.`;

export const generateClinicalNote = createServerFn({ method: "POST" })
  .validator(
    (input: {
      transcript: string;
      specialty: string;
      visitType: string;
      templateId: NoteTemplateId;
      patientLabel: string;
      patientAge: string;
      patientSex: string;
    }) => input,
  )
  .handler(async ({ data }): Promise<{ ok: true; note: ClinicalNote } | ChatErr> => {
    const transcript = data.transcript.trim();
    if (transcript.length < 40) {
      return { ok: false, error: "Add more of the consult before drafting a note." };
    }
    const clipped = transcript.slice(0, 14000);
    const result = await chat(
      [
        { role: "system", content: SYSTEM_NOTE },
        {
          role: "user",
          content: `Template: ${data.templateId}
Specialty: ${data.specialty}
Visit type: ${data.visitType}
Patient label (initials only): ${data.patientLabel}, age ${data.patientAge || "unspecified"}, sex ${data.patientSex || "unspecified"}

Transcript:
${clipped}`,
        },
      ],
      1800,
    );
    if (!result.ok) return result;
    try {
      return { ok: true, note: parseNote(result.text) };
    } catch {
      const fallback = emptyNote();
      fallback.subjective = result.text.slice(0, 8000);
      fallback.missingInformation = ["Model did not return structured JSON; raw draft placed in Subjective."];
      return { ok: true, note: fallback };
    }
  });

export const askCopilot = createServerFn({ method: "POST" })
  .validator(
    (input: {
      question: string;
      transcript: string;
      noteJson: string;
      specialty: string;
    }) => input,
  )
  .handler(async ({ data }): Promise<ChatResult> => {
    const question = data.question.trim();
    if (!question) return { ok: false, error: "Ask a question about this encounter." };
    const result = await chat(
      [
        {
          role: "system",
          content: `You are MediTalk Copilot, assisting a clinician with documentation. You do not diagnose the patient or replace clinical judgement. Be concise, structured, and explicit about uncertainty. Never invent findings that are not in the transcript or note.`,
        },
        {
          role: "user",
          content: `Specialty: ${data.specialty}

Note JSON:
${data.noteJson.slice(0, 8000) || "(no note yet)"}

Transcript (may be truncated):
${data.transcript.slice(0, 8000) || "(empty)"}

Question:
${question.slice(0, 2000)}`,
        },
      ],
      700,
    );
    return result;
  });

export const refineSection = createServerFn({ method: "POST" })
  .validator(
    (input: {
      section: string;
      text: string;
      instruction: string;
      transcript: string;
    }) => input,
  )
  .handler(async ({ data }): Promise<ChatResult> => {
    const result = await chat(
      [
        {
          role: "system",
          content:
            "You rewrite a single section of a clinical note. Stay faithful to the transcript. Return plain text only for that section, no headings or JSON.",
        },
        {
          role: "user",
          content: `Section: ${data.section}
Instruction: ${data.instruction.slice(0, 400)}
Current text:
${data.text.slice(0, 4000)}

Transcript excerpt:
${data.transcript.slice(0, 8000)}`,
        },
      ],
      700,
    );
    return result;
  });

export const transcribeAudio = createServerFn({ method: "POST" })
  .validator(
    (input: {
      audioBase64: string;
      mimeType: string;
      fileName: string;
      keyterms: string[];
    }) => input,
  )
  .handler(
    async ({
      data,
    }): Promise<{ ok: true; text: string; duration: number } | ChatErr> => {
      const apiKey = process.env.XAI_API_KEY;
      if (!apiKey) return { ok: false, error: "AI is not available in this environment." };

      const b64 = data.audioBase64.includes(",")
        ? data.audioBase64.slice(data.audioBase64.indexOf(",") + 1)
        : data.audioBase64;
      if (b64.length > 6_000_000) {
        return { ok: false, error: "Recording is too large. Keep consults under about two minutes, or paste a transcript." };
      }

      const bytes = Buffer.from(b64, "base64");
      const form = new FormData();
      form.append("format", "true");
      form.append("language", "en");
      form.append("diarize", "true");
      const terms = ["SOAP", "hypertension", "amlodipine", ...data.keyterms].slice(0, 24);
      for (const term of terms) {
        if (term.trim()) form.append("keyterm", term.trim().slice(0, 50));
      }
      const blob = new Blob([bytes], { type: data.mimeType || "application/octet-stream" });
      form.append("file", blob, data.fileName || "consult.webm");

      const res = await fetch("https://api.x.ai/v1/stt", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });

      if (!res.ok) {
        if (res.status === 403) {
          return {
            ok: false,
            error: "Transcription is paused for this workspace (quota). Paste the consult or use live dictation.",
          };
        }
        return { ok: false, error: `Transcription failed (${res.status}). You can still paste the consult.` };
      }

      const body = (await res.json()) as { text?: string; duration?: number };
      const text = (body.text ?? "").trim();
      if (!text) return { ok: false, error: "No speech was recognised in that recording." };
      return { ok: true, text, duration: typeof body.duration === "number" ? body.duration : 0 };
    },
  );
