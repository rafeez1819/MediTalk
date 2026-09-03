type SpeechRec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((ev: SpeechResultEvent) => void) | null;
  onerror: ((ev: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechResultEvent = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

function recognitionCtor(): (new () => SpeechRec) | null {
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function speechSupported() {
  return typeof window !== "undefined" && recognitionCtor() !== null;
}

export function startLiveDictation(opts: {
  onPartial: (finalText: string, interim: string) => void;
  onError: (message: string) => void;
}): { stop: () => void } | null {
  const Ctor = recognitionCtor();
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = "en-US";
  let finalText = "";
  let stopped = false;

  rec.onresult = (ev) => {
    let interim = "";
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const piece = ev.results[i];
      const t = piece[0]?.transcript ?? "";
      if (piece.isFinal) finalText = `${finalText} ${t}`.replace(/\s+/g, " ").trim();
      else interim += t;
    }
    opts.onPartial(finalText, interim);
  };
  rec.onerror = (ev) => {
    if (ev.error === "aborted" || ev.error === "no-speech") return;
    opts.onError(ev.error === "not-allowed" ? "Microphone permission was blocked." : "Dictation paused.");
  };
  rec.onend = () => {
    if (!stopped) {
      try {
        rec.start();
      } catch {
        /* already started */
      }
    }
  };
  try {
    rec.start();
  } catch (err) {
    opts.onError(err instanceof Error ? err.message : "Could not start dictation.");
    return null;
  }
  return {
    stop: () => {
      stopped = true;
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
    },
  };
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function pickRecorderMime() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}
