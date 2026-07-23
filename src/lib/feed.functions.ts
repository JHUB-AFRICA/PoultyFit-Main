import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { FEED_INGREDIENTS, type FeedIngredient } from "./poultry-data";

const InputSchema = z.object({
  county: z.string().min(1).max(100).optional(),
});

/**
 * Public-read merge of feed_ingredients (nutrition) with feed_prices (KES/kg).
 * Returns a list shaped like the legacy FEED_INGREDIENTS entries so
 * computeFeedPlan doesn't need to change its internal math.
 * Uses the lowest price_kes_per_kg when multiple brands sell the same
 * feed_type in the same county.
 */
export const getFeedIngredients = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => InputSchema.parse(input ?? {}))
  .handler(async ({ data }): Promise<FeedIngredient[]> => {
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const [ingredientsRes, pricesRes] = await Promise.all([
      client.from("feed_ingredients").select("*"),
      data.county
        ? client.from("feed_prices").select("*").eq("county", data.county)
        : client.from("feed_prices").select("*"),
    ]);

    const ingredients = ingredientsRes.data ?? [];
    const prices = pricesRes.data ?? [];

    // Lowest price per feed_type wins.
    const cheapestBySlug = new Map<string, number>();
    for (const p of prices) {
      const slug = p.feed_type;
      const price = Number(p.price_kes_per_kg);
      if (!Number.isFinite(price)) continue;
      const existing = cheapestBySlug.get(slug);
      if (existing === undefined || price < existing) {
        cheapestBySlug.set(slug, price);
      }
    }

    return ingredients.map((row) => {
      const fallback = FEED_INGREDIENTS.find((i) => i.id === row.slug);
      return {
        id: row.slug,
        name: row.name,
        energyKcal: Number(row.energy_kcal),
        proteinPct: Number(row.protein_pct),
        pricePerKg: cheapestBySlug.get(row.slug) ?? fallback?.pricePerKg ?? 0,
      };
    });
  });
