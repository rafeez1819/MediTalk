import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  NOTE_TEMPLATES,
  SPECIALTIES,
  VISIT_TYPES,
  type NoteTemplateId,
  type PatientSex,
  type VisitType,
} from "@/lib/types";
import { useMediTalk } from "@/lib/store";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function NewEncounterButton({
  children,
  variant = "default",
  templateId: presetTemplate,
}: {
  children: ReactNode;
  variant?: "default" | "secondary" | "outline";
  templateId?: NoteTemplateId;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const createEncounter = useMediTalk((s) => s.createEncounter);
  const defaultSpecialty = useMediTalk((s) => s.settings.defaultSpecialty);

  const [patientLabel, setPatientLabel] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientSex, setPatientSex] = useState<PatientSex>("");
  const [specialty, setSpecialty] = useState(defaultSpecialty);
  const [visitType, setVisitType] = useState<VisitType>("follow-up");
  const [templateId, setTemplateId] = useState<NoteTemplateId>(presetTemplate ?? "soap");

  function submit() {
    const encounter = createEncounter({
      patientLabel,
      patientAge,
      patientSex,
      specialty,
      visitType,
      templateId,
    });
    setOpen(false);
    setPatientLabel("");
    setPatientAge("");
    setPatientSex("");
    navigate({ to: "/encounter/$id", params: { id: encounter.id } });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && presetTemplate) setTemplateId(presetTemplate);
      }}
    >
      <DialogTrigger asChild>
        <Button variant={variant}>{children}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New encounter</DialogTitle>
          <DialogDescription>
            Use initials only. MediTalk drafts notes for you to review — it is not a medical device.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="pt-label">Patient initials</Label>
            <Input
              id="pt-label"
              placeholder="A.K."
              value={patientLabel}
              onChange={(e) => setPatientLabel(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="pt-age">Age</Label>
              <Input
                id="pt-age"
                inputMode="numeric"
                placeholder="54"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="pt-sex">Sex</Label>
              <select
                id="pt-sex"
                className="h-11 rounded-md border border-input bg-card px-3 text-sm shadow-[var(--shadow-border)] focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                value={patientSex}
                onChange={(e) => setPatientSex(e.target.value as PatientSex)}
              >
                <option value="">Unspecified</option>
                <option value="F">Female</option>
                <option value="M">Male</option>
                <option value="X">Another / X</option>
              </select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="specialty">Specialty</Label>
            <select
              id="specialty"
              className="h-11 rounded-md border border-input bg-card px-3 text-sm shadow-[var(--shadow-border)] focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="visit">Visit type</Label>
            <select
              id="visit"
              className="h-11 rounded-md border border-input bg-card px-3 text-sm shadow-[var(--shadow-border)] focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              value={visitType}
              onChange={(e) => setVisitType(e.target.value as VisitType)}
            >
              {VISIT_TYPES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="template">Note template</Label>
            <select
              id="template"
              className="h-11 rounded-md border border-input bg-card px-3 text-sm shadow-[var(--shadow-border)] focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value as NoteTemplateId)}
            >
              {NOTE_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit}>Open room</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
