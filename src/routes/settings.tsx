import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ANDROID_APPLICATION_ID,
  APP_NAME,
  APP_SLUG,
  BUNDLE_ID,
  IOS_BUNDLE_IDENTIFIER,
  WEB_APPLICATION_ID,
} from "@/lib/brand";
import { useMediTalk } from "@/lib/store";
import { SPECIALTIES } from "@/lib/types";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const settings = useMediTalk((s) => s.settings);
  const updateSettings = useMediTalk((s) => s.updateSettings);
  const restoreDemo = useMediTalk((s) => s.restoreDemo);

  return (
    <AppShell>
      <main className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-8">
        <p className="text-[11px] tracking-[0.22em] text-primary uppercase">{APP_NAME}</p>
        <h1 className="font-display mt-2 text-4xl tracking-tight">Practice</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Appears on copied notes. Saved in this browser only — MediTalk does not open accounts or a shared chart.
        </p>

        <form className="mt-8 space-y-4 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <div className="grid gap-1.5">
            <Label htmlFor="clinic">Clinic</Label>
            <Input
              id="clinic"
              value={settings.clinicName}
              onChange={(e) => updateSettings({ clinicName: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="clinician">Clinician</Label>
            <Input
              id="clinician"
              value={settings.clinicianName}
              onChange={(e) => updateSettings({ clinicianName: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="creds">Credentials</Label>
            <Input
              id="creds"
              value={settings.credentials}
              onChange={(e) => updateSettings({ credentials: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="spec">Default specialty</Label>
            <select
              id="spec"
              className="h-11 rounded-md border border-input bg-card px-3 text-sm shadow-[var(--shadow-border)] focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              value={settings.defaultSpecialty}
              onChange={(e) => updateSettings({ defaultSpecialty: e.target.value })}
            >
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </form>

        <section className="mt-8 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-xl tracking-tight">Workspace identity</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Application IDs used across web and store listings for {APP_NAME}.
          </p>
          <dl className="mt-4 grid gap-3 text-sm">
            <Row k="Display name" v={APP_NAME} />
            <Row k="Workspace" v={APP_SLUG} />
            <Row k="Web application ID" v={WEB_APPLICATION_ID} />
            <Row k="Bundle identifier" v={BUNDLE_ID} />
            <Row k="iOS" v={IOS_BUNDLE_IDENTIFIER} />
            <Row k="Android" v={ANDROID_APPLICATION_ID} />
          </dl>
        </section>

        <section className="mt-8 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-display text-xl tracking-tight">On this device</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Encounters live in local storage. Restoring the demo replaces your current board.
          </p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              restoreDemo();
              toast.success("Demo board restored.");
            }}
          >
            Restore demo board
          </Button>
        </section>
      </main>
    </AppShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2 last:border-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-mono text-xs">{v}</dd>
    </div>
  );
}
