import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { EncounterWorkspace } from "@/components/workspace";
import { Button } from "@/components/ui/button";
import { useMediTalk } from "@/lib/store";

export const Route = createFileRoute("/encounter/$id")({ component: EncounterPage });

function EncounterPage() {
  const { id } = Route.useParams();
  const encounter = useMediTalk((s) => s.encounters.find((e) => e.id === id));
  const hydrated = useMediTalk((s) => s.hydrated);

  if (!encounter) {
    return (
      <AppShell>
        <main className="flex min-h-[60dvh] flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display text-3xl tracking-tight">
            {hydrated ? "This encounter is not on this device" : "Loading board…"}
          </h1>
          {hydrated ? (
            <Button className="mt-5" asChild>
              <Link to="/">Back to board</Link>
            </Button>
          ) : null}
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <EncounterWorkspace encounter={encounter} />
    </AppShell>
  );
}
