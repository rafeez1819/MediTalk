export const LANGS = [
  { id: "en", name: "English", native: "English", bcp47: "en-US", dir: "ltr" },
  { id: "es", name: "Spanish", native: "Español", bcp47: "es-US", dir: "ltr" },
  { id: "zh", name: "Chinese", native: "中文", bcp47: "zh-CN", dir: "ltr" },
  { id: "ar", name: "Arabic", native: "العربية", bcp47: "ar-SA", dir: "rtl" },
  { id: "fr", name: "French", native: "Français", bcp47: "fr-FR", dir: "ltr" },
  { id: "pt", name: "Portuguese", native: "Português", bcp47: "pt-BR", dir: "ltr" },
  { id: "vi", name: "Vietnamese", native: "Tiếng Việt", bcp47: "vi-VN", dir: "ltr" },
  { id: "ko", name: "Korean", native: "한국어", bcp47: "ko-KR", dir: "ltr" },
  { id: "ht", name: "Haitian Creole", native: "Kreyòl Ayisyen", bcp47: "ht-HT", dir: "ltr" },
  { id: "hi", name: "Hindi", native: "हिन्दी", bcp47: "hi-IN", dir: "ltr" },
] as const;

export type Lang = (typeof LANGS)[number]["id"];

export const LANG_IDS = LANGS.map((l) => l.id) as Lang[];

export function isLang(value: string): value is Lang {
  return LANG_IDS.includes(value as Lang);
}

export function getLang(id: Lang) {
  return LANGS.find((l) => l.id === id) ?? LANGS[0];
}

export function langName(id: Lang, native = false) {
  const l = getLang(id);
  return native ? l.native : l.name;
}
