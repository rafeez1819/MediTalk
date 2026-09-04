import type { Lang } from "./languages";

export const PAIN_LEVELS: {
  value: number;
  label: Record<Lang, string>;
}[] = [
  {
    value: 0,
    label: {
      en: "No pain",
      es: "Sin dolor",
      zh: "不痛",
      ar: "لا ألم",
      fr: "Aucune douleur",
      pt: "Sem dor",
      vi: "Không đau",
      ko: "통증 없음",
      ht: "Pa gen doulè",
      hi: "दर्द नहीं",
    },
  },
  {
    value: 2,
    label: {
      en: "Mild",
      es: "Leve",
      zh: "轻微",
      ar: "خفيف",
      fr: "Légère",
      pt: "Leve",
      vi: "Nhẹ",
      ko: "약함",
      ht: "Lim",
      hi: "हल्का",
    },
  },
  {
    value: 4,
    label: {
      en: "Uncomfortable",
      es: "Molesto",
      zh: "不舒服",
      ar: "مزعج",
      fr: "Gênante",
      pt: "Incômoda",
      vi: "Khó chịu",
      ko: "불편함",
      ht: "Dezagreyab",
      hi: "असुविधाजनक",
    },
  },
  {
    value: 6,
    label: {
      en: "Distressing",
      es: "Angustioso",
      zh: "很难受",
      ar: "مؤلم جداً",
      fr: "Pénible",
      pt: "Angustiante",
      vi: "Khá nặng",
      ko: "괴로움",
      ht: "Difisil",
      hi: "कष्टदायक",
    },
  },
  {
    value: 8,
    label: {
      en: "Intense",
      es: "Intenso",
      zh: "剧痛",
      ar: "شديد",
      fr: "Intense",
      pt: "Intensa",
      vi: "Dữ dội",
      ko: "매우 심함",
      ht: "Entans",
      hi: "तीव्र",
    },
  },
  {
    value: 10,
    label: {
      en: "Worst possible",
      es: "El peor posible",
      zh: "能想象的最痛",
      ar: "أسوأ ألم ممكن",
      fr: "Pire douleur possible",
      pt: "A pior possível",
      vi: "Tồi tệ nhất",
      ko: "상상할 수 있는 최악",
      ht: "Pi mal posib",
      hi: "सबसे ज्यादा",
    },
  },
];

export function painPhrase(value: number, lang: Lang) {
  const level = PAIN_LEVELS.reduce((best, l) =>
    Math.abs(l.value - value) < Math.abs(best.value - value) ? l : best,
  );
  const templates: Record<Lang, string> = {
    en: `My pain is ${value} out of 10 — ${level.label.en}.`,
    es: `Mi dolor es ${value} de 10: ${level.label.es}.`,
    zh: `我的疼痛是 10 分里的 ${value} 分——${level.label.zh}。`,
    ar: `ألمي ${value} من 10 — ${level.label.ar}.`,
    fr: `Ma douleur est à ${value} sur 10 — ${level.label.fr}.`,
    pt: `Minha dor é ${value} de 10 — ${level.label.pt}.`,
    vi: `Cơn đau của tôi là ${value} trên 10 — ${level.label.vi}.`,
    ko: `통증은 10점 만점에 ${value}점입니다 — ${level.label.ko}.`,
    ht: `Doulè mwen se ${value} sou 10 — ${level.label.ht}.`,
    hi: `मेरा दर्द 10 में से ${value} है — ${level.label.hi}.`,
  };
  return templates[lang];
}
