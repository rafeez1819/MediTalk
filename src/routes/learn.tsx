import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { buildQuiz, type QuizQuestion } from "@/lib/quiz";
import { useMediStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn")({ component: LearnPage });

function LearnPage() {
  const quizBest = useMediStore((s) => s.quizBest);
  const setQuizBest = useMediStore((s) => s.setQuizBest);
  const [seed, setSeed] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setQuestions(buildQuiz(8));
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }, [seed]);

  const q: QuizQuestion | undefined = questions[index];

  function choose(i: number) {
    if (picked !== null || !q) return;
    setPicked(i);
    if (i === q.answer) setScore((s) => s + 1);
  }

  function next() {
    if (!q) return;
    if (index + 1 >= questions.length) {
      setDone(true);
      setQuizBest(score);
      return;
    }
    setIndex((n) => n + 1);
    setPicked(null);
  }

  function restart() {
    setSeed((n) => n + 1);
  }

  if (questions.length === 0) {
    return (
      <AppShell title="Language drill">
        <p className="text-muted">Loading drill…</p>
      </AppShell>
    );
  }

  if (done) {
    return (
      <AppShell title="Language drill">
        <div className="rounded-xl bg-elevated px-5 py-8 text-center shadow-[var(--shadow-border)]">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Session</p>
          <p className="mt-2 font-heading text-5xl tabular-nums">{score}/8</p>
          <p className="mt-2 text-muted">Best on this device: {Math.max(quizBest, score)}/8</p>
          <Button className="mt-6" onClick={restart}>
            Drill again
          </Button>
        </div>
      </AppShell>
    );
  }

  if (!q) return null;

  return (
    <AppShell title="Language drill">
      <div className="space-y-5">
        <header className="flex items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl tracking-tight">Learn the language of care</h1>
            <p className="mt-1 text-muted">Spanish phrases and plain-English medical terms.</p>
          </div>
          <p className="tabular-nums text-sm text-muted">
            {index + 1}/8 · {score} correct
          </p>
        </header>
        <article className="rounded-xl bg-elevated p-5 shadow-[var(--shadow-border)]">
          <p className="whitespace-pre-wrap text-lg leading-relaxed">{q.prompt}</p>
          <p className="mt-2 text-xs text-subtle">{q.hint}</p>
          <div className="mt-4 grid gap-2">
            {q.choices.map((choice, i) => {
              const isPick = picked === i;
              const isAnswer = i === q.answer;
              const show = picked !== null;
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => choose(i)}
                  className={cn(
                    "min-h-12 rounded-lg px-4 py-3 text-left text-sm shadow-[var(--shadow-border)] transition-[background-color,transform] duration-150 ease-out active:scale-[0.96]",
                    !show && "bg-bg hover:bg-mist",
                    show && isAnswer && "bg-mist text-accent",
                    show && isPick && !isAnswer && "bg-sand text-danger",
                    show && !isPick && !isAnswer && "bg-bg text-muted",
                  )}
                >
                  {choice}
                </button>
              );
            })}
          </div>
          {picked !== null ? (
            <Button className="mt-4" onClick={next}>
              {index + 1 >= questions.length ? "See score" : "Next"}
            </Button>
          ) : null}
        </article>
      </div>
    </AppShell>
  );
}
