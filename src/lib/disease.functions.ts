import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const InputSchema = z.object({
  symptoms: z.array(z.string().min(1)).min(1).max(20),
  species: z.string().min(1).max(50).default("chicken"),
  photoBase64: z.string().max(8_000_000).optional(),
});

interface DiseaseMatch {
  slug: string;
  name: string;
  score: number;
  urgency: string;
  prevention: string | null;
  treatment_notes: string | null;
}

export interface PredictDiseaseResult {
  source: "ml" | "stub";
  top: DiseaseMatch | null;
  ranked: DiseaseMatch[];
  advice: string;
  logged_id: string | null;
}

/**
 * Disease prediction. Calls the external ML service when ML_SERVICE_URL is set;
 * otherwise falls back to a keyword-overlap match against the `diseases` table
 * so the frontend works today.
 */
export const predictDisease = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }): Promise<PredictDiseaseResult> => {
    const { symptoms, species, photoBase64 } = data;
    const mlUrl = process.env.ML_SERVICE_URL;
    const mlKey = process.env.ML_SERVICE_API_KEY;

    // Local fallback: heuristic match from the diseases table.
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const publicClient = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: rows } = await publicClient.from("diseases").select("*");
    const list = rows ?? [];
    const symLower = symptoms.map((s) => s.toLowerCase());

    const ranked: DiseaseMatch[] = list
      .filter((d) => (d.species ?? []).length === 0 || d.species.includes(species))
      .map((d) => {
        const dSyms = (d.symptoms ?? []).map((s) => s.toLowerCase());
        const score = dSyms.reduce(
          (acc, ds) => acc + (symLower.some((s) => ds.includes(s) || s.includes(ds)) ? 1 : 0),
          0,
        );
        return {
          slug: d.slug,
          name: d.name,
          score,
          urgency: d.urgency,
          prevention: d.prevention,
          treatment_notes: d.treatment_notes,
        };
      })
      .sort((a, b) => b.score - a.score);

    let source: "ml" | "stub" = "stub";
    let top: DiseaseMatch | null = ranked[0]?.score ? ranked[0] : null;
    let mlPayload: unknown = null;

    if (mlUrl && mlKey) {
      try {
        const res = await fetch(mlUrl, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${mlKey}`,
          },
          body: JSON.stringify({
            symptoms,
            species,
            ...(photoBase64 ? { photo_base64: photoBase64 } : {}),
          }),
        });
        if (res.ok) {
          mlPayload = await res.json();
          source = "ml";
          // Expected ML response: { top_slug: string, ranked: [{slug, score}] }
          const mlTop = (mlPayload as { top_slug?: string })?.top_slug;
          if (mlTop) {
            const found = list.find((d) => d.slug === mlTop);
            if (found) {
              top = {
                slug: found.slug,
                name: found.name,
                score: 1,
                urgency: found.urgency,
                prevention: found.prevention,
                treatment_notes: found.treatment_notes,
              };
            }
          }
        }
      } catch {
        // fall through to stub
      }
    }

    const advice = top
      ? `Most likely: ${top.name}. Urgency: ${top.urgency}. ${top.treatment_notes ?? ""}`
      : "No clear match. Please describe more symptoms or consult a vet.";

    // Persist the prediction for the current user
    let logged_id: string | null = null;
    const { data: ins } = await context.supabase
      .from("disease_predictions")
      .insert({
        user_id: context.userId,
        species,
        symptoms,
        top_disease_slug: top?.slug ?? null,
        ml_response: (mlPayload ?? { source, ranked }) as never,
      })
      .select("id")
      .single();
    if (ins) logged_id = ins.id;

    return { source, top, ranked, advice, logged_id };
  });