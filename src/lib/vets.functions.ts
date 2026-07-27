import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const InputSchema = z.object({
  county: z.string().min(1).max(100).optional(),
  kind: z.enum(["vet", "agrovet"]).optional(),
});

export interface VetRow {
  id: string;
  name: string;
  kind: "vet" | "agrovet";
  county: string;
  phone: string;
  lat: number;
  lng: number;
  services: string[];
}

export const listVetsFn = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => InputSchema.parse(input ?? {}))
  .handler(async ({ data }): Promise<VetRow[]> => {
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const url = process.env.SUPABASE_URL!;
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    let q = client.from("vets").select("id, name, kind, county, phone, lat, lng, services");
    if (data.county) q = q.eq("county", data.county);
    if (data.kind) q = q.eq("kind", data.kind);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? [])
      .filter((r) => r.lat != null && r.lng != null && r.phone != null)
      .map((r) => ({
        id: r.id,
        name: r.name,
        kind: r.kind as "vet" | "agrovet",
        county: r.county ?? "",
        phone: r.phone ?? "",
        lat: Number(r.lat),
        lng: Number(r.lng),
        services: r.services ?? [],
      }));
  });
