import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { Clock3, MoreHorizontal, Plus, Stethoscope } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { NewEncounterButton } from "@/components/new-encounter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import { useMediTalk } from "@/lib/store";
import { templateLabel, visitTypeLabel, type Encounter } from "@/lib/types";
import { formatClock, initialsOf } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const encounters = useMediTalk((s) => s.encounters);
  const hydrated = useMediTalk((s) => s.hydrated);
  const settings = useMediTalk((s) => s.settings);
  const deleteEncounter = useMediTalk((s) => s.deleteEncounter);
  const duplicateEncounter = useMediTalk((s) => s.duplicateEncounter);

  const drafted = encounters.filter((e) => e.note).length;
  const minutes = Math.round(encounters.reduce((n, e) => n + e.durationSec, 0) / 60);

  return (
    <AppShell>
      <main className="px-4 py-6 md:px-8 md:py-8">
        <section className="relative overflow-hidden rounded-xl bg-card px-5 py-8 shadow-[var(--shadow-border)] md:px-10 md:py-12">
          <p className="text-[11px] tracking-[0.22em] text-primary uppercase">{settings.clinicName}</p>
          <h1 className="font-display mt-3 max-w-xl text-4xl leading-[1.05] font-medium tracking-tight md:text-5xl">
            The consult is the record.
          </h1>
          <p className="mt-3 max-w-lg text-sm text-muted-foreground md:text-base">
            {APP_NAME} listens, then drafts SOAP, codes, and patient instructions for your review.{" "}
            {APP_TAGLINE}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <NewEncounterButton>
              <Plus />
              New encounter
            </NewEncounterButton>
            <Button variant="outline" asChild>
              <Link to="/encounter/$id" params={{ id: "enc-demo-jonah" }}>
                Open sample (J.T.)
              </Link>
            </Button>
          </div>
          <Stethoscope className="pointer-events-none absolute -right-4 -bottom-6 size-36 text-primary/10 md:size-48" />
        </section>

        <dl className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Encounters" value={String(encounters.length)} />
          <Stat label="Notes drafted" value={String(drafted)} />
          <Stat label="Capture" value={`${minutes} min`} />
        </dl>

        <div className="mt-8 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight">Board</h2>
            <p className="text-sm text-muted-foreground">Stored on this device. Initials only — never full names.</p>
          </div>
        </div>

        { !hydrated ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="h-40 rounded-xl bg-card shadow-[var(--shadow-border)]" />
            <div className="h-40 rounded-xl bg-card shadow-[var(--shadow-border)]" />
          </div>
        ) : encounters.length === 0 ? (
          <div className="mt-4 rounded-xl bg-card px-5 py-10 text-center shadow-[var(--shadow-border)]">
            <p className="font-display text-xl">No encounters yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Start a room, or restore the demo board in Practice.</p>
            <div className="mt-4 flex justify-center">
              <NewEncounterButton>New encounter</NewEncounterButton>
            </div>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {encounters.map((encounter) => (
              <EncounterCard
                key={encounter.id}
                encounter={encounter}
                onDelete={() => deleteEncounter(encounter.id)}
                onDuplicate={() => duplicateEncounter(encounter.id)}
              />
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-card px-3 py-3 shadow-[var(--shadow-border)] md:px-4">
      <dt className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">{label}</dt>
      <dd className="font-display mt-1 text-2xl tabular-nums tracking-tight">{value}</dd>
    </div>
  );
}

function EncounterCard({
  encounter,
  onDelete,
  onDuplicate,
}: {
  encounter: Encounter;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <li className="group relative rounded-xl bg-card p-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_rgb(27_35_48/0.10),0_8px_24px_-12px_rgb(27_35_48/0.18)]">
      <Link
        to="/encounter/$id"
        params={{ id: encounter.id }}
        className="absolute inset-0 z-0 rounded-xl"
        aria-label={`Open ${encounter.patientLabel}`}
      />
      <div className="relative z-10 flex items-start gap-3">
        <div className="pointer-events-none flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-medium text-accent-foreground">
          {initialsOf(encounter.patientLabel)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="pointer-events-none">
              <p className="font-medium">
                {encounter.patientLabel}
                {encounter.patientAge ? ` · ${encounter.patientAge}` : ""}
                {encounter.patientSex}
              </p>
              <p className="text-xs text-muted-foreground">
                {encounter.specialty} · {visitTypeLabel(encounter.visitType)}
              </p>
            </div>
            <div className="relative z-10 flex items-center gap-1">
              <StatusBadge encounter={encounter} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Encounter actions">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/encounter/$id" params={{ id: encounter.id }}>
                      Open
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={onDuplicate}>Duplicate</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onSelect={onDelete}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="pointer-events-none mt-3 line-clamp-2 text-sm text-muted-foreground">
            {encounter.note?.chiefComplaint ||
              encounter.transcript.slice(0, 140) ||
              "Empty room — record or paste a consult."}
          </p>
          <div className="pointer-events-none mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3" />
              {formatDistanceToNow(encounter.updatedAt, { addSuffix: true })}
            </span>
            <span className="font-mono tabular-nums">{formatClock(encounter.durationSec)}</span>
            <span>{templateLabel(encounter.templateId)}</span>
          </div>
        </div>
      </div>
    </li>
  );
}

function StatusBadge({ encounter }: { encounter: Encounter }) {
  if (encounter.status === "signed") return <Badge variant="signed">Signed</Badge>;
  if (encounter.status === "recording") return <Badge variant="live">Live</Badge>;
  if (encounter.note) return <Badge variant="default">Draft</Badge>;
  return <Badge variant="outline">Open</Badge>;
}
