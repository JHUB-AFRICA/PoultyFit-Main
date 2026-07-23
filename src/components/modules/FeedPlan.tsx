import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { computeFeedPlan } from "@/lib/poultry-calc";
import { getFeedIngredients } from "@/lib/feed.functions";
import type { BirdStage, FeedIngredient } from "@/lib/poultry-data";
import type { FarmerProfile } from "@/lib/auth";
import { cn } from "@/lib/utils";

const STAGE_META: Record<BirdStage, { label: string; weeks: string; order: number }> = {
  chick:  { label: "Chick",       weeks: "0–8 wks",  order: 0 },
  grower: { label: "Grower",      weeks: "9–18 wks", order: 1 },
  layer:  { label: "Point-of-lay",weeks: "19+ wks",  order: 2 },
};

export function FeedPlanModule({ profile, birds }: { profile: FarmerProfile; birds: number }) {
  const fetchIngredients = useServerFn(getFeedIngredients);
  const { data: ingredients, isLoading } = useQuery({
    queryKey: ["feed_ingredients", profile.county],
    queryFn: () => fetchIngredients({ data: { county: profile.county } }),
    staleTime: 5 * 60_000,
  });

  const startOrder = STAGE_META[profile.startingStage].order;
  const trajectoryStages = (Object.keys(STAGE_META) as BirdStage[])
    .filter((s) => STAGE_META[s].order >= startOrder)
    .sort((a, b) => STAGE_META[a].order - STAGE_META[b].order);

  const [stage, setStage] = useState<BirdStage>(profile.startingStage);
  const ingredientList: FeedIngredient[] = ingredients ?? [];

  const plan = useMemo(
    () => computeFeedPlan(stage, Math.max(1, birds), ingredientList, profile.county),
    [stage, birds, ingredientList, profile.county],
  );

  const trajectory = useMemo(
    () => trajectoryStages.map((s) => ({
      stage: s,
      plan: computeFeedPlan(s, Math.max(1, birds), ingredientList, profile.county),
    })),
    [trajectoryStages, birds, ingredientList, profile.county],
  );

  const locationLabel = profile.ward?.trim() ? profile.ward.trim() : profile.county;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-2xl bg-muted animate-pulse" />
        <div className="h-40 rounded-2xl bg-muted animate-pulse" />
        <div className="h-48 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  const energyCount = ingredientList.filter((i) => i.energyKcal >= 2500 && i.proteinPct < 20).length;
  const proteinCount = ingredientList.filter((i) => i.proteinPct >= 30).length;

  if (energyCount < 2 || proteinCount < 2 || !plan) {
    return (
      <div className="rounded-2xl border border-clay/40 bg-clay/5 p-6">
        <p className="font-display text-lg">Not enough feed data yet for your area</p>
        <p className="mt-2 text-sm text-muted-foreground">
          We don't have enough ingredient pricing and nutrition data for {locationLabel} to build a
          least-cost feed mix. Check back soon — the feed researcher is adding new ingredients weekly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Feeding plan for</p>
        <p className="mt-1 font-display text-2xl">
          <span className="text-primary">{birds}</span> birds
          <span className="text-muted-foreground text-base"> · flock size from your yard</span>
        </p>
      </div>

      {trajectoryStages.length > 1 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Cost trajectory</p>
          <p className="mt-1 text-sm text-muted-foreground">Monthly feed cost as your flock grows through each stage.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {trajectory.map((t, i) => {
              const active = t.stage === stage;
              return (
                <button
                  key={t.stage}
                  type="button"
                  onClick={() => setStage(t.stage)}
                  className={cn(
                    "relative rounded-xl border p-4 text-left transition",
                    active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                      )}>{i + 1}</span>
                      <span className="text-sm font-medium">{STAGE_META[t.stage].label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{STAGE_META[t.stage].weeks}</span>
                  </div>
                  {t.plan ? (
                    <>
                      <p className="mt-3 font-display text-xl">KES {t.plan.monthlyCost.toLocaleString()}<span className="text-xs text-muted-foreground font-sans">/mo</span></p>
                      <p className="text-xs text-muted-foreground">{t.plan.dailyKg} kg/day · {t.plan.proteinPct}% protein</p>
                    </>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">No mix available</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {trajectoryStages.length === 1 && (
        <div>
          <div className="grid grid-cols-1 gap-2">
            {trajectoryStages.map((s) => (
              <button key={s} type="button" onClick={() => setStage(s)}
                className={cn("rounded-lg border px-3 py-2 text-sm capitalize",
                  stage === s ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50")}>
                {STAGE_META[s].label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Daily feed" value={`${plan.dailyKg} kg`} />
        <Stat label="Daily cost" value={`KES ${plan.dailyCost.toLocaleString()}`} />
        <Stat label="Monthly cost" value={`KES ${plan.monthlyCost.toLocaleString()}`} accent />
        <Stat label="Protein" value={`${plan.proteinPct}%`} />
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-secondary/50 px-5 py-3 text-sm font-medium">
          Least-cost mix for {locationLabel} · KES {plan.costPerKg}/kg · {STAGE_META[stage].label} stage
        </div>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Ingredient</th>
              <th className="px-5 py-3 text-right font-medium">Share</th>
              <th className="px-5 py-3 text-right font-medium">kg / day</th>
              <th className="px-5 py-3 text-right font-medium">KES / day</th>
            </tr>
          </thead>
          <tbody>
            {plan.mix.map((row) => (
              <tr key={row.ingredient.id} className="border-t border-border">
                <td className="px-5 py-3">{row.ingredient.name}</td>
                <td className="px-5 py-3 text-right">{row.pct}%</td>
                <td className="px-5 py-3 text-right">{row.kg}</td>
                <td className="px-5 py-3 text-right">{row.cost.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Prices are indicative Kenyan agrovet rates and refresh as the platform's own pricing API adds partners.
      </p>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-4",
      accent ? "border-primary bg-primary/5" : "border-border bg-card")}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("mt-1 font-display text-2xl", accent && "text-primary")}>{value}</p>
    </div>
  );
}
