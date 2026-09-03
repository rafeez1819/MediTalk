import { APP_NAME } from "./brand";
import type { ClinicalNote, Encounter, PracticeSettings } from "./types";
import { templateLabel, visitTypeLabel } from "./types";

function demographics(e: Encounter) {
  const sex = e.patientSex ? e.patientSex : "";
  const age = e.patientAge ? `${e.patientAge}y` : "";
  return [e.patientLabel, age + sex].filter(Boolean).join(" · ");
}

export function formatNoteText(
  encounter: Encounter,
  settings: PracticeSettings,
  note: ClinicalNote,
) {
  const when = new Date(encounter.createdAt).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const dx = note.diagnoses
    .map((d) => `- ${d.term}${d.icd10 ? ` (${d.icd10})` : ""}${d.rationale ? ` — ${d.rationale}` : ""}`)
    .join("\n");
  const meds = note.medications
    .map((m) => `- ${m.name}${m.dose ? `, ${m.dose}` : ""}${m.instructions ? ` — ${m.instructions}` : ""}`)
    .join("\n");

  return [
    `${settings.clinicName}`,
    `${settings.clinicianName}${settings.credentials ? `, ${settings.credentials}` : ""}`,
    `${APP_NAME} · ${templateLabel(encounter.templateId)} · ${visitTypeLabel(encounter.visitType)}`,
    `${demographics(encounter)} · ${encounter.specialty} · ${when}`,
    "",
    "Chief complaint",
    note.chiefComplaint || "—",
    "",
    "History",
    note.history || "—",
    "",
    "Subjective",
    note.subjective || "—",
    "",
    "Objective",
    note.objective || "—",
    "",
    "Assessment",
    note.assessment || "—",
    "",
    "Plan",
    note.plan || "—",
    "",
    "Diagnoses (suggested)",
    dx || "—",
    "",
    "Medications",
    meds || "—",
    "",
    "Follow-up",
    note.followUp || "—",
    "",
    "Patient instructions",
    note.patientInstructions || "—",
    "",
    note.redFlags.length ? `Safety-net / red flags\n${note.redFlags.map((r) => `- ${r}`).join("\n")}` : "",
    note.missingInformation.length
      ? `\nMissing from transcript\n${note.missingInformation.map((r) => `- ${r}`).join("\n")}`
      : "",
    "",
    `Drafted in ${APP_NAME}. Requires clinician review before filing.`,
  ]
    .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
    .join("\n")
    .trim();
}
