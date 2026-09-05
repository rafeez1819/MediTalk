import { createServerFn } from "@tanstack/react-start";
import { getLang, isLang, langName, type Lang } from "./languages";
import { matchPhrase } from "./phrases";
import { TERMS } from "./terms";

export type TranslateResult =
  | {
      ok: true;
      translation: string;
      plain: string;
      source: "phrasebook" | "glossary" | "ai";
    }
  | {
      ok: false;
      error: string;
    };

type Input = {
  text: string;
  sourceLang: Lang;
  targetLang: Lang;
  mode?: "talk" | "term";
};

function localTranslate(input: Input): TranslateResult | null {
  const text = input.text.trim();
  if (!text) return { ok: false, error: "Type something to translate." };
  if (input.sourceLang === input.targetLang) {
    return { ok: true, translation: text, plain: "", source: "phrasebook" };
  }
  const phrase = matchPhrase(text, input.sourceLang);
  if (phrase) {
    return {
      ok: true,
      translation: phrase.text[input.targetLang],
      plain: "",
      source: "phrasebook",
    };
  }
  const q = text.toLowerCase();
  const term = TERMS.find((t) => Object.values(t.term).some((v) => v.toLowerCase() === q));
  if (term) {
    return {
      ok: true,
      translation: term.term[input.targetLang],
      plain: term.plain[input.targetLang],
      source: "glossary",
    };
  }
  return null;
}

export const translateUtterance = createServerFn({ method: "POST" })
  .validator((input: Input) => {
    if (!input || typeof input.text !== "string") {
      throw new Error("Invalid input");
    }
    if (!isLang(input.sourceLang) || !isLang(input.targetLang)) {
      throw new Error("Unknown language");
    }
    return {
      text: input.text.slice(0, 1200),
      sourceLang: input.sourceLang,
      targetLang: input.targetLang,
      mode: input.mode === "term" ? "term" : "talk",
    } satisfies Input;
  })
  .handler(async ({ data }): Promise<TranslateResult> => {
    const local = localTranslate(data);
    if (local) return local;

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return {
        ok: false,
        error: "Live translation is unavailable. Use the phrasebook, or try a saved phrase.",
      };
    }

    const src = getLang(data.sourceLang);
    const tgt = getLang(data.targetLang);
    const system =
      data.mode === "term"
        ? `You are a medical literacy editor. Explain the term in ${langName(data.targetLang)} using short, everyday words. Do not diagnose. Return JSON only.`
        : `You are a certified medical interpreter working at the bedside. Translate faithfully from ${src.name} to ${tgt.name}. Do not add clinical advice. Do not diagnose. Keep questions as questions. If the source uses jargon, also give a one-sentence plain-language restatement in the target language. Return JSON only.`;

    const user =
      data.mode === "term"
        ? `Term or sentence:\n${data.text}\n\nRespond as {"translation":"...","plain":"everyday explanation in ${tgt.name}"}`
        : `Utterance:\n${data.text}\n\nRespond as {"translation":"...","plain":"...or empty string"}`;

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          temperature: 0.1,
          max_tokens: 400,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!res.ok) {
        return { ok: false, error: "Translation service is busy. Try a phrasebook line." };
      }
      const body = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const raw = body.choices?.[0]?.message?.content ?? "{}";
      let parsed: { translation?: string; plain?: string } = {};
      try {
        parsed = JSON.parse(raw) as { translation?: string; plain?: string };
      } catch {
        parsed = { translation: raw };
      }
      const translation = (parsed.translation ?? "").trim();
      if (!translation) {
        return { ok: false, error: "No translation came back. Try again." };
      }
      return {
        ok: true,
        translation,
        plain: (parsed.plain ?? "").trim(),
        source: "ai",
      };
    } catch {
      return {
        ok: false,
        error: "Could not reach the translator. Use the phrasebook.",
      };
    }
  });

export async function translateClient(input: Input): Promise<TranslateResult> {
  const local = localTranslate(input);
  if (local) return local;
  return translateUtterance({ data: input });
}
