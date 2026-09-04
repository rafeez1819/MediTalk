import { TERMS } from "./terms";
import { PHRASES } from "./phrases";

export type QuizQuestion = {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  hint: string;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function buildQuiz(count = 8): QuizQuestion[] {
  const termQs: QuizQuestion[] = TERMS.map((t) => {
    const distractors = shuffle(TERMS.filter((x) => x.id !== t.id))
      .slice(0, 3)
      .map((x) => x.plain.en);
    const choices = shuffle([t.plain.en, ...distractors]);
    return {
      id: `t-${t.id}`,
      prompt: `What does “${t.term.en}” mean in plain language?`,
      choices,
      answer: choices.indexOf(t.plain.en),
      hint: t.term.en,
    };
  });

  const phraseQs: QuizQuestion[] = PHRASES.filter((p) => p.text.es).map((p) => {
    const distractors = shuffle(PHRASES.filter((x) => x.id !== p.id))
      .slice(0, 3)
      .map((x) => x.text.en);
    const choices = shuffle([p.text.en, ...distractors]);
    return {
      id: `p-${p.id}`,
      prompt: `A patient or clinician says: “${p.text.es}”\nWhat are they saying?`,
      choices,
      answer: choices.indexOf(p.text.en),
      hint: "Spanish → English",
    };
  });

  return shuffle([...termQs, ...phraseQs]).slice(0, count);
}
