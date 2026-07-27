// Data provider for vets and agrovets, backed by the `vets` table via a
// public server function. FindHelpModule imports listVets() from here.

import { listVetsFn, type VetRow } from "@/lib/vets.functions";

export type VetContact = VetRow;

export interface ListVetsOptions {
  county?: string;
  kind?: "vet" | "agrovet";
}

export async function listVets(opts: ListVetsOptions = {}): Promise<VetContact[]> {
  return await listVetsFn({ data: opts });
}
