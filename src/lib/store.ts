import { create } from "zustand";
import { persist } from "zustand/middleware";
import { demoEncounters } from "./samples";
import type {
  ClinicalNote,
  CopilotMessage,
  Encounter,
  NoteTemplateId,
  PatientSex,
  PracticeSettings,
  VisitType,
} from "./types";

const SETTINGS: PracticeSettings = {
  clinicianName: "Dr. Elena Voss",
  credentials: "FRACP",
  clinicName: "Harbourview Family Practice",
  defaultSpecialty: "General Practice",
};

interface NewEncounterInput {
  patientLabel: string;
  patientAge: string;
  patientSex: PatientSex;
  specialty: string;
  visitType: VisitType;
  templateId: NoteTemplateId;
}

interface MediTalkState {
  hydrated: boolean;
  hasOnboarded: boolean;
  encounters: Encounter[];
  settings: PracticeSettings;
  setHydrated: () => void;
  createEncounter: (input: NewEncounterInput) => Encounter;
  updateEncounter: (id: string, patch: Partial<Encounter>) => void;
  setNote: (id: string, note: ClinicalNote) => void;
  appendCopilot: (id: string, message: Omit<CopilotMessage, "id" | "at">) => void;
  deleteEncounter: (id: string) => void;
  duplicateEncounter: (id: string) => Encounter | null;
  updateSettings: (patch: Partial<PracticeSettings>) => void;
  restoreDemo: () => void;
}

function nid() {
  return crypto.randomUUID();
}

export const useMediTalk = create<MediTalkState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      hasOnboarded: false,
      encounters: [],
      settings: SETTINGS,
      setHydrated: () => {
        const onboarded = get().hasOnboarded;
        if (!onboarded) {
          set({
            hydrated: true,
            hasOnboarded: true,
            encounters: demoEncounters(),
            settings: get().settings.clinicName ? get().settings : SETTINGS,
          });
          return;
        }
        set({ hydrated: true });
      },
      createEncounter: (input) => {
        const now = Date.now();
        const encounter: Encounter = {
          id: nid(),
          createdAt: now,
          updatedAt: now,
          patientLabel: input.patientLabel.trim() || "PT",
          patientAge: input.patientAge.trim(),
          patientSex: input.patientSex,
          specialty: input.specialty,
          visitType: input.visitType,
          templateId: input.templateId,
          status: "draft",
          transcript: "",
          durationSec: 0,
          note: null,
          copilot: [],
        };
        set({ encounters: [encounter, ...get().encounters] });
        return encounter;
      },
      updateEncounter: (id, patch) => {
        set({
          encounters: get().encounters.map((e) =>
            e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e,
          ),
        });
      },
      setNote: (id, note) => {
        set({
          encounters: get().encounters.map((e) =>
            e.id === id
              ? {
                  ...e,
                  note,
                  status: e.status === "signed" ? "signed" : "ready",
                  updatedAt: Date.now(),
                }
              : e,
          ),
        });
      },
      appendCopilot: (id, message) => {
        const row: CopilotMessage = {
          id: nid(),
          at: Date.now(),
          role: message.role,
          text: message.text,
        };
        set({
          encounters: get().encounters.map((e) =>
            e.id === id ? { ...e, copilot: [...e.copilot, row], updatedAt: Date.now() } : e,
          ),
        });
      },
      deleteEncounter: (id) => {
        set({ encounters: get().encounters.filter((e) => e.id !== id) });
      },
      duplicateEncounter: (id) => {
        const src = get().encounters.find((e) => e.id === id);
        if (!src) return null;
        const now = Date.now();
        const copy: Encounter = {
          ...src,
          id: nid(),
          createdAt: now,
          updatedAt: now,
          status: src.note ? "ready" : "draft",
          copilot: [],
        };
        set({ encounters: [copy, ...get().encounters] });
        return copy;
      },
      updateSettings: (patch) => {
        set({ settings: { ...get().settings, ...patch } });
      },
      restoreDemo: () => {
        set({ encounters: demoEncounters(), settings: SETTINGS, hasOnboarded: true });
      },
    }),
    {
      name: "meditalk-store",
      version: 1,
      skipHydration: true,
      partialize: (s) => ({
        hasOnboarded: s.hasOnboarded,
        encounters: s.encounters,
        settings: s.settings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

if (typeof window !== "undefined") {
  void useMediTalk.persist.rehydrate();
}
