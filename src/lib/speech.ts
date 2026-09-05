import { getLang, type Lang } from "./languages";

type RecognitionCtor = new () => SpeechRecognitionLike;

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function canListen() {
  return !!getRecognitionCtor();
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speak(text: string, lang: Lang) {
  if (!canSpeak() || !text.trim()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = getLang(lang).bcp47;
  u.rate = 0.94;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}

export function listenOnce(lang: Lang): Promise<string> {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return Promise.reject(new Error("Voice input is not available in this browser."));
  return new Promise((resolve, reject) => {
    const rec = new Ctor();
    rec.lang = getLang(lang).bcp47;
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (ev) => {
      const text = ev.results[0]?.[0]?.transcript ?? "";
      resolve(text.trim());
    };
    rec.onerror = (ev) => {
      reject(
        new Error(
          ev.error === "not-allowed"
            ? "Microphone permission was denied."
            : "Could not hear that. Try again.",
        ),
      );
    };
    rec.onend = () => {};
    try {
      rec.start();
    } catch {
      reject(new Error("Could not start the microphone."));
    }
  });
}
