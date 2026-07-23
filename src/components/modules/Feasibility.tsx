import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { computeFeasibility } from "@/lib/poultry-calc";
import { getCountyBylaw, type CountyBylawRow } from "@/lib/bylaws.functions";
import { saveFeasibilityReport } from "@/lib/reports.functions";
import { SPACE_PER_BIRD, STARTUP_COST_PER_BIRD } from "@/lib/poultry-data";
import type { FarmerProfile } from "@/lib/auth";
import { Ruler, Wallet, Scale, ShieldCheck, ShieldAlert, Ruler as RulerIcon, Save, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function FeasibilityModule({ profile }: { profile: FarmerProfile }) {
  const fetchBylaw = useServerFn(getCountyBylaw);
  const saveReport = useServerFn(saveFeasibilityReport);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const { data: bylaw, isLoading } = useQuery({
    queryKey: ["county_bylaw", profile.county, profile.ward ?? null],
    queryFn: () =>
      fetchBylaw({ data: { county: profile.county, sub_county: profile.ward || undefined } }),
    staleTime: 5 * 60_000,
  });

  const result = useMemo(() => computeFeasibility(profile, bylaw ?? null), [profile, bylaw]);
  const perBird = SPACE_PER_BIRD[profile.housing];

  const handleSave = async () => {
    if (isSaving || justSaved) return;
    setIsSaving(true);
    try {
      await saveReport({
        data: {
          farm_id: null,
          inputs: profile as never,
          results: result as never,
        },
      });
      toast.success("Report saved");
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 4000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save report";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <div className="h-40 rounded-2xl bg-muted animate-pulse md:col-span-1" />
        <div className="h-40 rounded-2xl bg-muted animate-pulse md:col-span-2" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1 rounded-2xl border border-border bg-card p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Recommended flock</p>
        <p className="mt-2 font-display text-6xl text-primary">{result.recommended}</p>
        <p className="mt-2 text-sm text-muted-foreground">birds you can comfortably keep</p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Limited by {result.bindingConstraint}
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving || justSaved}
          className={cn(
            "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
            justSaved
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60",
          )}
        >
          {isSaving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving…
            </>
          ) : justSaved ? (
            <>
              <Check className="h-4 w-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save this report
            </>
          )}
        </button>
      </div>

      <div className="grid gap-3 md:col-span-2">
        <Constraint
          icon={Ruler}
          label="By space"
          value={result.maxBySpace}
          hint={`${profile.lengthM && profile.widthM ? `${profile.lengthM}m × ${profile.widthM}m = ` : ""}${profile.spaceM2} m² ÷ ${perBird} m²/bird (${profile.housing.replace("-", " ")})`}
          binding={result.bindingConstraint === "space"}
        />
        <Constraint
          icon={Wallet}
          label="By budget"
          value={result.maxByBudget}
          hint={`KES ${profile.budgetKes.toLocaleString()} ÷ KES ${STARTUP_COST_PER_BIRD[profile.startingStage]}/bird (${stageLabel(profile.startingStage)})`}
          binding={result.bindingConstraint === "budget"}
        />
        {result.maxByBylaw !== null && (
          <Constraint
            icon={Scale}
            label={`By ${profile.county} bylaw`}
            value={result.maxByBylaw}
            hint="Advisory maximum for urban backyard keepers"
            binding={result.bindingConstraint === "bylaw"}
          />
        )}
      </div>

      {bylaw && (
        <div className="md:col-span-3">
          <BylawCallout county={profile.county} bylaw={bylaw} />
        </div>
      )}
    </div>
  );
}

function BylawCallout({ county, bylaw }: { county: string; bylaw: CountyBylawRow }) {
  const warn = bylaw.permit_required;
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        warn ? "border-clay/40 bg-clay/5" : "border-primary/30 bg-primary/5",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg">{county} County</h3>
          <span className="text-xs text-muted-foreground">local guidance</span>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
            warn ? "bg-clay/15 text-clay" : "bg-primary/15 text-primary",
          )}
        >
          {warn ? <ShieldAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
          {warn ? "Permit required" : "No permit needed"}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {bylaw.setback_meters !== null && (
          <div className="rounded-xl border border-border/60 bg-background/60 p-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <RulerIcon className="h-3.5 w-3.5" /> Setback from neighbour
            </div>
            <p className="mt-1 font-display text-xl">{bylaw.setback_meters} m</p>
            <p className="text-xs text-muted-foreground">Minimum coop distance advised</p>
          </div>
        )}
        {bylaw.max_birds_residential !== null && (
          <div className="rounded-xl border border-border/60 bg-background/60 p-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <Scale className="h-3.5 w-3.5" /> Urban backyard cap
            </div>
            <p className="mt-1 font-display text-xl">{bylaw.max_birds_residential} birds</p>
            <p className="text-xs text-muted-foreground">Advisory maximum</p>
          </div>
        )}
      </div>

      {bylaw.notes && <p className="mt-4 text-sm text-foreground/80">{bylaw.notes}</p>}
    </div>
  );
}

function Constraint({
  icon: Icon, label, value, hint, binding,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; hint: string; binding: boolean }) {
  return (
    <div className={cn("flex items-center gap-4 rounded-2xl border p-4",
      binding ? "border-primary bg-primary/5" : "border-border bg-card")}>
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl",
        binding ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <p className="font-display text-2xl">{value}</p>
    </div>
  );
}

function stageLabel(s: FarmerProfile["startingStage"]) {
  return s === "chick" ? "day-old chicks" : s === "grower" ? "growers" : "point-of-lay";
}
