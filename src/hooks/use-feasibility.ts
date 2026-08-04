import { useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getCountyBylaw } from "@/lib/bylaws.functions";
import { computeFeasibility, type FeasibilityResult } from "@/lib/poultry-calc";

/**
 * Pulls the signed-in farmer's profile, fetches their county bylaw, and
 * computes the feasibility result, the same three steps every dashboard
 * page needs, now centralized so each route file doesn't refetch/recompute
 * it independently.
 */
export function useFeasibilitySnapshot() {
  const { profile } = useAuth();
  const fetchBylaw = useServerFn(getCountyBylaw);

  const { data: bylaw, isLoading } = useQuery({
    queryKey: ["county_bylaw", profile?.county ?? null, profile?.ward ?? null],
    queryFn: () =>
      fetchBylaw({ data: { county: profile!.county, sub_county: profile!.ward || undefined } }),
    enabled: !!profile?.county,
    staleTime: 5 * 60_000,
  });

  const feas = useMemo<FeasibilityResult | null>(
    () => (profile ? computeFeasibility(profile, bylaw?.countyBylaw ?? null) : null),
    [profile, bylaw],
  );

  return { profile, bylaw, feas, isLoading };
}