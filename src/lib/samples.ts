import type { ClinicalNote, Encounter } from "./types";

export const SAMPLE_HYPERTENSION_TRANSCRIPT = `Clinician: Good morning, Mrs. Rajan. Come on in. How have you been since we last met in January?
Patient: Morning, doctor. A bit mixed. The amlodipine is fine, no swollen ankles this time, but I've had a few headaches in the afternoon, and my home readings have been bouncing around.
Clinician: What numbers are you seeing?
Patient: Mornings are usually one-thirty over eighty-two, but after work I've had a few one-fifty-eights over ninety-four. I check with that Omron you suggested. I wrote them in the booklet.
Clinician: That's helpful. Any chest pain, shortness of breath, or visual changes with the headaches?
Patient: No chest pain. I get a bit puffed walking up the hill to the shops, but that's been years. Headaches are more a dull band, not a thunderclap. Vision is fine. I still take my glasses for driving.
Clinician: And the ramipril — any cough?
Patient: A little dry cough in the evenings. I thought it was the heating.
Clinician: How often?
Patient: Most nights, not every hour. Doesn't wake me. Sleep is alright. I stopped the ibuprofen like you said; I use paracetamol if the knee flares.
Clinician: Alcohol, salt, walking?
Patient: I cut the takeaways. Walking the dog most days, twenty minutes. Wine on Friday, two glasses. Blood pressure tablets every morning with breakfast, I don't miss them.
Clinician: Let's look at today's reading... one-forty-eight over ninety-two, heart rate seventy-four, regular. Weight seventy-one, that's down a kilo. Lungs clear, no ankle oedema, apex not displaced. I'll repeat the ECG — last one was sinus, no LVH. Your labs from last month: creatinine 78, eGFR 74, potassium 4.4, HbA1c 39, cholesterol 4.9, LDL 2.8 on atorvastatin 20.
Patient: The chemist asked if the statin dose should go up.
Clinician: Your LDL is close to target. We'll leave it for now and recode in six months. I think the ramipril cough is real, so I'd like to switch you to candesartan 8 milligrams in the morning and keep amlodipine 5. Home readings twice a day for two weeks, then we'll review. If systolic stays above 140 I'll increase the candesartan. Headaches that are sudden, worst of life, or with weakness — that's emergency, not us. Any questions?
Patient: Will the new one drop my pressure too low in the morning?
Clinician: Unlikely at 8 milligrams. Sit at the edge of the bed if you feel lightheaded. I'll send a script and a note to your pharmacy. See you in six weeks, or sooner if the cough doesn't settle in a fortnight.`;

export const SAMPLE_PEDIATRIC_TRANSCRIPT = `Clinician: Hi, I'm Dr. Chen. You must be Jonah, and mum — thanks for coming in. What's been going on?
Parent: He's had a temperature since Tuesday night, pulling at his left ear, not eating much. Paracetamol helps for a couple of hours then it spikes again. He's had two ear infections last winter.
Clinician: Jonah, does your ear hurt? Can you point?
Child: This one. It pops.
Clinician: Any vomiting, rash, stiff neck, or he's been harder to wake?
Parent: No rash, no vomiting. He slept a lot yesterday but he woke when I spoke to him. Drinking water. Wet nappies — he's eight, sorry, wet once last night which is unusual. No one else at home is sick. He's fully immunised.
Clinician: Let's have a look. Temperature 38.4, heart rate 104, sats 98% air, weight 26.2. Throat mildly red, no exudate, nodes a bit tender on the left. Chest clear. Left tympanic membrane is red and bulging, no perforation. Right looks fine. No meningism.
Parent: Does he need antibiotics? Last time they said wait.
Clinician: This time the drum is bulging and he's had fever more than 48 hours, so yes — a three-day course of amoxicillin, 500 milligrams three times a day. Keep paracetamol, ibuprofen is fine with food if the fever bothers him. If he becomes drowsy, has a rash that doesn't fade, neck stiffness, or the fever is still there after three days, come back or go to emergency. No swimming until the ear is settled. Fluids, rest. I'll write a note for school. Any allergies?
Parent: Only the penicillin — wait, no, that's his cousin. Jonah is fine with amoxicillin. He took it last year.
Clinician: Good. Script at the desk. Follow up if he's not clearly better in 72 hours.`;

export const SAMPLE_HYPERTENSION_NOTE: ClinicalNote = {
  chiefComplaint:
    "Follow-up of hypertension with afternoon home readings in the high-150s and a possible ACE-inhibitor cough.",
  history:
    "61-year-old woman with essential hypertension on amlodipine 5 mg and ramipril, atorvastatin 20 mg. Prior advice to stop ibuprofen. Walks the dog most days. Modest alcohol. Adherent to morning antihypertensives.",
  subjective:
    "Mrs. R. reports mixed control since January. Morning home BP typically ~130/82; after work some readings 158/94 on an Omron device, recorded in a booklet. Afternoon band-like headaches without thunderclap, visual change, chest pain, or syncope. Longstanding dyspnoea on a hill. Dry evening cough most nights, not sleep-disrupting, temporally associated with ramipril. Stopped ibuprofen; uses paracetamol for knee pain. Reduced takeaways; wine Friday only. No missed doses.",
  objective:
    "Clinic BP 148/92, HR 74 regular. Weight 71 kg (down 1 kg). Lungs clear. No ankle oedema. Apex not displaced. Prior ECG sinus, no LVH (to be repeated). Labs (last month): creatinine 78, eGFR 74, K 4.4, HbA1c 39, TC 4.9, LDL 2.8 on atorvastatin 20 mg.",
  assessment:
    "1. Essential hypertension, suboptimal afternoon control; no red-flag headache features today. 2. Probable ramipril-related dry cough. 3. Dyslipidaemia on statin, LDL near target. 4. Possible ACE-cough vs environmental; switch planned. No clinical heart failure today.",
  plan: "Switch ramipril to candesartan 8 mg daily; continue amlodipine 5 mg and atorvastatin 20 mg. Home BP twice daily for 14 days. Review 6 weeks, or sooner if cough persists >2 weeks; uptitrate candesartan if systolic remains >140. Safety-net sudden/worst headache, neurological deficit. Script and pharmacy note. Repeat ECG today.",
  diagnoses: [
    {
      term: "Essential (primary) hypertension",
      icd10: "I10",
      rationale: "Established diagnosis with elevated clinic and home readings.",
    },
    {
      term: "Adverse effect of ACE inhibitor (cough)",
      icd10: "T46.4X5A",
      rationale: "Dry evening cough while taking ramipril; plan to switch ARB.",
    },
  ],
  medications: [
    {
      name: "Candesartan",
      dose: "8 mg orally each morning",
      instructions: "New; replaces ramipril. Sit on bed edge if lightheaded.",
    },
    {
      name: "Amlodipine",
      dose: "5 mg orally daily",
      instructions: "Continue.",
    },
    {
      name: "Atorvastatin",
      dose: "20 mg orally nightly",
      instructions: "Continue; LDL near target, reassess in 6 months.",
    },
  ],
  followUp:
    "6 weeks routine; 2 weeks if cough not settling. Safety-net emergency features for headache.",
  patientInstructions:
    "Take candesartan 8 mg every morning instead of ramipril. Keep amlodipine. Check blood pressure morning and evening for two weeks and bring the booklet. Seek emergency care for sudden severe headache, weakness, or vision loss. Contact the practice if you feel faint or the cough continues beyond two weeks.",
  redFlags: [
    "Sudden worst-of-life headache",
    "Neurological deficit or visual change",
    "Chest pain",
  ],
  missingInformation: [
    "Today's ECG tracing not yet attached",
    "Exact ramipril dose not stated in the consult",
  ],
};

export function demoEncounters(now = Date.now()): Encounter[] {
  return [
    {
      id: "enc-demo-rajan",
      createdAt: now - 1000 * 60 * 60 * 26,
      updatedAt: now - 1000 * 60 * 60 * 25,
      patientLabel: "M.R.",
      patientAge: "61",
      patientSex: "F",
      specialty: "General Practice",
      visitType: "follow-up",
      templateId: "soap",
      status: "signed",
      transcript: SAMPLE_HYPERTENSION_TRANSCRIPT,
      durationSec: 412,
      note: SAMPLE_HYPERTENSION_NOTE,
      copilot: [],
    },
    {
      id: "enc-demo-jonah",
      createdAt: now - 1000 * 60 * 50,
      updatedAt: now - 1000 * 60 * 40,
      patientLabel: "J.T.",
      patientAge: "8",
      patientSex: "M",
      specialty: "Pediatrics",
      visitType: "acute",
      templateId: "soap",
      status: "ready",
      transcript: SAMPLE_PEDIATRIC_TRANSCRIPT,
      durationSec: 286,
      note: null,
      copilot: [],
    },
  ];
}
