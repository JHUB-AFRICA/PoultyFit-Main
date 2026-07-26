import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SiteHeader } from "@/components/SiteHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Ruler, Wheat, Stethoscope, MapPin, Settings2 } from "lucide-react";
import { FeasibilityModule } from "@/components/modules/Feasibility";
import { FeedPlanModule } from "@/components/modules/FeedPlan";
import { HealthTriageModule } from "@/components/modules/HealthTriage";
import { computeFeasibility } from "@/lib/poultry-calc";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getCountyBylaw } from "@/lib/bylaws.functions";

const FindHelpModule = lazy(() =>
  import("@/components/modules/FindHelp").then((m) => ({ default: m.FindHelpModule })),
);

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · PoultryFit Kenya" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, profile, ready } = useAuth();
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const fetchBylaw = useServerFn(getCountyBylaw);
  const { data: bylaw } = useQuery({
    queryKey: ["county_bylaw", profile?.county ?? null, profile?.ward ?? null],
    queryFn: () =>
      fetchBylaw({ data: { county: profile!.county, sub_county: profile!.ward || undefined } }),
    enabled: !!profile?.county,
    staleTime: 5 * 60_000,
  });


  if (!ready) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="mx-auto max-w-md px-6 py-20 text-center">
          <h2 className="font-display text-2xl">Sign in to see your plan</h2>
          <div className="mt-6 flex justify-center gap-2">
            <Link to="/signup"><Button>Create account</Button></Link>
            <Link to="/signin"><Button variant="outline">Sign in</Button></Link>
          </div>
        </div>
      </div>
    );
  }
  if (!profile) return null;

  const feas = computeFeasibility(profile, bylaw ?? null);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Greeting + snapshot */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Karibu, {user.name.split(" ")[0]}.</p>
            <h1 className="font-display text-3xl md:text-4xl">Your flock plan</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.county}{profile.ward ? ` · ${profile.ward}` : ""} · {profile.spaceM2} m² · {profile.housing.replace("-", " ")}
              {profile.poultryTypes?.length ? ` · ${profile.poultryTypes.map((t) => t.replace("-", " ")).join(", ")}` : ""}
            </p>
          </div>
          <Link to="/onboarding">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Settings2 className="h-4 w-4" /> Update yard
            </Button>
          </Link>
        </div>

        {/* Snapshot cards */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Snapshot label="Recommended flock" value={`${feas.recommended} birds`} hint={`limited by ${feas.bindingConstraint}`} />
          <Snapshot label="Startup budget" value={`KES ${profile.budgetKes.toLocaleString()}`} hint="from your setup" />
          <Snapshot label="Goal" value={profile.goal} hint={`${profile.experience.replace("-", " ")} keeper`} />
        </div>

        {/* Modules */}
        <Tabs defaultValue="feasibility" className="mt-10">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="feasibility" className="gap-2"><Ruler className="h-4 w-4" /><span className="hidden sm:inline">Feasibility</span></TabsTrigger>
            <TabsTrigger value="feed" className="gap-2"><Wheat className="h-4 w-4" /><span className="hidden sm:inline">Feed plan</span></TabsTrigger>
            <TabsTrigger value="health" className="gap-2"><Stethoscope className="h-4 w-4" /><span className="hidden sm:inline">Health check</span></TabsTrigger>
            <TabsTrigger value="find" className="gap-2"><MapPin className="h-4 w-4" /><span className="hidden sm:inline">Find help</span></TabsTrigger>
          </TabsList>

          <TabsContent value="feasibility" className="mt-6">
            <ModuleHeader title="Flock size" desc="What fits your space and pocket." />
            <FeasibilityModule profile={profile} />
          </TabsContent>

          <TabsContent value="feed" className="mt-6">
            <ModuleHeader title="Feed plan" desc="Cheapest mix from local agrovets." />
            <FeedPlanModule profile={profile} birds={feas.recommended || 10} />
          </TabsContent>

          <TabsContent value="health" className="mt-6">
            <ModuleHeader title="Symptom check" desc="A hint, not a diagnosis." />
            <HealthTriageModule />
          </TabsContent>

          <TabsContent value="find" className="mt-6">
            <ModuleHeader title="Vets and agrovets" desc="Tap to call." />
            {mounted && (
              <Suspense fallback={<div className="h-[480px] rounded-2xl bg-muted animate-pulse" />}>
                <FindHelpModule county={profile.county} />
              </Suspense>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Snapshot({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-display text-2xl capitalize">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function ModuleHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
