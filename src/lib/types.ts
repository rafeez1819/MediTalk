export const SPECIALTIES = [
  "General Practice",
  "Internal Medicine",
  "Cardiology",
  "Pediatrics",
  "Psychiatry",
  "Orthopedics",
  "Dermatology",
  "Emergency Medicine",
  "Obstetrics & Gynaecology",
  "Neurology",
] as const;

export const VISIT_TYPES = [
  { id: "new", label: "New patient" },
  { id: "follow-up", label: "Follow-up" },
  { id: "acute", label: "Acute visit" },
  { id: "telehealth", label: "Telehealth" },
  { id: "procedure", label: "Procedure" },
] as const;

export const NOTE_TEMPLATES = [
  {
    id: "soap",
    label: "SOAP note",
    summary: "Subjective, objective, assessment, and plan.",
  },
  {
    id: "hp",
    label: "History & physical",
    summary: "Full H&P with ROS, exam, and impression.",
  },
  {
    id: "progress",
    label: "Progress note",
    summary: "Interval update for an established problem.",
  },
  {
    id: "referral",
    label: "Referral letter",
    summary: "Specialist referral with clinical question.",
  },
  {
    id: "discharge",
    label: "Discharge summary",
    summary: "Admission course, diagnoses, and aftercare.",
  },
  {
    id: "consult",
    label: "Consult note",
    summary: "Opinion, recommendations, and return plan.",
  },
] as const;

export type Specialty = (typeof SPECIALTIES)[number];
export type VisitType = (typeof VISIT_TYPES)[number]["id"];
export type NoteTemplateId = (typeof NOTE_TEMPLATES)[number]["id"];
export type EncounterStatus = "draft" | "recording" | "ready" | "signed";
export type PatientSex = "F" | "M" | "X" | "";

export interface Diagnosis {
  term: string;
  icd10: string;
  rationale: string;
}

export interface Medication {
  name: string;
  dose: string;
  instructions: string;
}

export interface ClinicalNote {
  chiefComplaint: string;
  history: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnoses: Diagnosis[];
  medications: Medication[];
  followUp: string;
  patientInstructions: string;
  redFlags: string[];
  missingInformation: string[];
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: number;
}

export interface Encounter {
  id: string;
  createdAt: number;
  updatedAt: number;
  patientLabel: string;
  patientAge: string;
  patientSex: PatientSex;
  specialty: Specialty | string;
  visitType: VisitType;
  templateId: NoteTemplateId;
  status: EncounterStatus;
  transcript: string;
  durationSec: number;
  note: ClinicalNote | null;
  copilot: CopilotMessage[];
}

export interface PracticeSettings {
  clinicianName: string;
  credentials: string;
  clinicName: string;
  defaultSpecialty: string;
}

export function emptyNote(): ClinicalNote {
  return {
    chiefComplaint: "",
    history: "",
    subjective: "",
    objective: "",
    assessment: "",
    plan: "",
    diagnoses: [],
    medications: [],
    followUp: "",
    patientInstructions: "",
    redFlags: [],
    missingInformation: [],
  };
}

export function visitTypeLabel(id: VisitType) {
  return VISIT_TYPES.find((v) => v.id === id)?.label ?? id;
}

export function templateLabel(id: NoteTemplateId) {
  return NOTE_TEMPLATES.find((t) => t.id === id)?.label ?? id;
}
