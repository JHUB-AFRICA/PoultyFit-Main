import { useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getCountyBylaw } from "@/lib/bylaws.functions";
import { getFeedIngredients } from "@/lib/feed.functions";
import { computeFeasibility, feedCostPerBirdPerWeek, type FeasibilityResult } from "@/lib/poultry-calc";

/**
 * Pulls the signed-in farmer's profile, fetches their county bylaw and real
 * feed ingredient prices, and computes the feasibility result, the same
 * steps every dashboard page needs, now centralized so each route file
 * doesn't refetch/recompute it independently. The feed prices are what let
 * the budget constraint reserve real feed money, not just bird-stock cost.
 */
export function useFeasibilitySnapshot() {
  const { profile } = useAuth();
  const fetchBylaw = useServerFn(getCountyBylaw);
  const fetchIngredients = useServerFn(getFeedIngredients);

  const { data: bylaw, isLoading } = useQuery({
    queryKey: ["county_bylaw", profile?.county ?? null, profile?.ward ?? null],
    queryFn: () =>
      fetchBylaw({ data: { county: profile!.county, sub_county: profile!.ward || undefined } }),
    enabled: !!profile?.county,
    staleTime: 5 * 60_000,
  });

  const { data: ingredients } = useQuery({
    queryKey: ["feed_ingredients", profile?.county ?? null],
    queryFn: () => fetchIngredients({ data: { county: profile?.county } }),
    enabled: !!profile,
    staleTime: 5 * 60_000,
  });

  const feas = useMemo<FeasibilityResult | null>(() => {
    if (!profile) return null;
    const weeklyFeed = ingredients ? feedCostPerBirdPerWeek(profile.startingStage, ingredients) : null;
    return computeFeasibility(profile, bylaw?.countyBylaw ?? null, weeklyFeed);
  }, [profile, bylaw, ingredients]);

  return { profile, bylaw, feas, isLoading };
}