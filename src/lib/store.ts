import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang } from "./languages";
import { uid } from "./utils";

export type Role = "clinician" | "patient";

export type TalkMessage = {
  id: string;
  at: number;
  from: "me" | "them";
  sourceLang: Lang;
  targetLang: Lang;
  source: string;
  translation: string;
  plain?: string;
};

export type Visit = {
  id: string;
  startedAt: number;
  endedAt?: number;
  myLang: Lang;
  theirLang: Lang;
  role: Role;
  messages: TalkMessage[];
};

type State = {
  role: Role;
  myLang: Lang;
  theirLang: Lang;
  autoSpeak: boolean;
  visits: Visit[];
  activeVisitId: string | null;
  quizBest: number;
  setRole: (role: Role) => void;
  setLangs: (myLang: Lang, theirLang: Lang) => void;
  swapLangs: () => void;
  setAutoSpeak: (v: boolean) => void;
  startVisit: () => string;
  endVisit: () => void;
  addMessage: (msg: Omit<TalkMessage, "id" | "at">) => TalkMessage;
  clearHistory: () => void;
  setQuizBest: (n: number) => void;
};

export const useMediStore = create<State>()(
  persist(
    (set, get) => ({
      role: "clinician",
      myLang: "en",
      theirLang: "es",
      autoSpeak: true,
      visits: [],
      activeVisitId: null,
      quizBest: 0,
      setRole: (role) => set({ role }),
      setLangs: (myLang, theirLang) => set({ myLang, theirLang }),
      swapLangs: () => {
        const { myLang, theirLang } = get();
        set({ myLang: theirLang, theirLang: myLang });
      },
      setAutoSpeak: (autoSpeak) => set({ autoSpeak }),
      startVisit: () => {
        const { myLang, theirLang, role, activeVisitId, visits } = get();
        const current = visits.find((v) => v.id === activeVisitId && !v.endedAt);
        if (current) return current.id;
        const visit: Visit = {
          id: uid(),
          startedAt: Date.now(),
          myLang,
          theirLang,
          role,
          messages: [],
        };
        set({ visits: [visit, ...visits].slice(0, 40), activeVisitId: visit.id });
        return visit.id;
      },
      endVisit: () => {
        const { visits, activeVisitId } = get();
        set({
          visits: visits.map((v) =>
            v.id === activeVisitId && !v.endedAt ? { ...v, endedAt: Date.now() } : v,
          ),
          activeVisitId: null,
        });
      },
      addMessage: (msg) => {
        const message: TalkMessage = { ...msg, id: uid(), at: Date.now() };
        const id = get().startVisit();
        set({
          visits: get().visits.map((v) =>
            v.id === id ? { ...v, messages: [...v.messages, message] } : v,
          ),
        });
        return message;
      },
      clearHistory: () => set({ visits: [], activeVisitId: null }),
      setQuizBest: (n) => set({ quizBest: Math.max(get().quizBest, n) }),
    }),
    { name: "meditalk-v1" },
  ),
);

export function useActiveVisit() {
  return useMediStore((s) => s.visits.find((v) => v.id === s.activeVisitId) ?? null);
}
