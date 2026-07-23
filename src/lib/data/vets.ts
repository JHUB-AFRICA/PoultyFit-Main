// Data provider for vets and agrovets.
// Today: reads from the bundled directory.
// Tomorrow: swap the body of listVets() to fetch from the backend.
// The rest of the app only imports listVets() so the swap stays local.

import { VET_DIRECTORY, type VetContact } from "@/lib/poultry-data";

export type { VetContact };

export interface ListVetsOptions {
  county?: string;
  kind?: "vet" | "agrovet";
}

export async function listVets(opts: ListVetsOptions = {}): Promise<VetContact[]> {
  let rows = VET_DIRECTORY;
  if (opts.county) rows = rows.filter((v) => v.county === opts.county);
  if (opts.kind) rows = rows.filter((v) => v.kind === opts.kind);
  return rows;
}
