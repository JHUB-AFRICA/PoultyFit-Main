// Curated reference data used across modules. In a later phase this becomes
// an API served from the platform's own backend (agrovet-integrated).

import type { PoultryType } from "@/lib/auth";

export const COUNTIES = [
  "Nairobi", "Kiambu", "Machakos", "Kajiado", "Nakuru", "Mombasa",
  "Kisumu", "Uasin Gishu", "Nyeri", "Meru", "Murang'a", "Kakamega",
] as const;

export type CountyName = (typeof COUNTIES)[number];

export const POULTRY_LABEL: Record<PoultryType, string> = {
  chicken: "Chicken",
  duck: "Duck",
  turkey: "Turkey",
  goose: "Goose",
  quail: "Quail",
  "guinea-fowl": "Guinea fowl",
};

// Space requirement per bird (m²) depending on housing type.
export const SPACE_PER_BIRD: Record<string, number> = {
  "backyard-open": 0.6,
  "deep-litter":   0.35,
  "cage":          0.15,
  "free-range":    1.0,
};

// Startup cost per bird (KES) by starting stage, day-old chick + brooder share is
// cheapest; growers cost more (already fed for weeks); point-of-lay pullets cost the
// most but start producing immediately. Reasonable Kenyan agrovet gaps (2025).
export const STARTUP_COST_PER_BIRD: Record<BirdStage, number> = {
  chick:  180,
  grower: 500,
  layer:  850,
};

// Feed ingredients, indicative Kenyan agrovet prices (KES per kg)
export interface FeedIngredient {
  id: string;
  name: string;
  pricePerKg: number;
  proteinPct: number;   // crude protein %
  energyKcal: number;   // kcal/kg
}

export const FEED_INGREDIENTS: FeedIngredient[] = [
  { id: "maize",     name: "Maize germ",       pricePerKg: 42, proteinPct: 9,  energyKcal: 3400 },
  { id: "wheat",     name: "Wheat pollard",    pricePerKg: 35, proteinPct: 14, energyKcal: 2600 },
  { id: "omena",     name: "Omena (fish meal)",pricePerKg: 120,proteinPct: 55, energyKcal: 2900 },
  { id: "soya",      name: "Soya meal",        pricePerKg: 95, proteinPct: 44, energyKcal: 2400 },
  { id: "sunflower", name: "Sunflower cake",   pricePerKg: 55, proteinPct: 30, energyKcal: 2200 },
  { id: "lime",      name: "Limestone / DCP",  pricePerKg: 25, proteinPct: 0,  energyKcal: 0    },
];

export type BirdStage = "chick" | "grower" | "layer";

export const STAGE_TARGET: Record<BirdStage, { protein: number; gramsPerBirdDay: number }> = {
  chick:  { protein: 20, gramsPerBirdDay: 40 },
  grower: { protein: 16, gramsPerBirdDay: 80 },
  layer:  { protein: 17, gramsPerBirdDay: 120 },
};

// Space a bird of this species needs, relative to a chicken, at the same
// housing type. A chicken at 1.0 is the baseline SPACE_PER_BIRD figure above;
// other species multiply it. Turkeys and geese are much bigger birds and need
// real room; quail need almost none.
export const SPECIES_SPACE_MULTIPLIER: Record<PoultryType, number> = {
  chicken: 1.0,
  duck: 1.3,
  turkey: 2.5,
  goose: 3.0,
  quail: 0.15,
  "guinea-fowl": 1.0,
};

// Startup cost per bird (KES) by species and starting stage. Turkey and
// guinea fowl figures are sourced from Kenyan farmer accounts (2020-2026
// reporting); chicken is the existing agrovet-price baseline. Duck, goose,
// and quail figures are estimates, no solid Kenya-specific sourcing was
// found for those three, flagged here so they're not mistaken for the same
// confidence level as the sourced ones.
export const SPECIES_STARTUP_COST_PER_BIRD: Record<PoultryType, Record<BirdStage, number>> = {
  chicken: { chick: 180, grower: 500, layer: 850 },
  duck: { chick: 220, grower: 550, layer: 900 }, // estimate
  turkey: { chick: 550, grower: 2500, layer: 5000 }, // sourced: poult ~500-600, mature ~5000
  goose: { chick: 550, grower: 2500, layer: 4500 }, // estimate, geese are scarce in KE, limited data
  quail: { chick: 30, grower: 80, layer: 150 }, // estimate
  "guinea-fowl": { chick: 300, grower: 1000, layer: 2000 }, // sourced
};

// Feed target (crude protein % and grams/bird/day) by species and stage.
// Chicken values are the existing baseline. Other species genuinely need
// different protein levels, a turkey or quail chick needs 24-28% starter
// protein, well above a chicken's 20%, and eats a different daily volume.
// These are standard poultry-nutrition reference ranges, not Kenya-specific
// pricing, so they don't carry the same sourcing caveat as prices above.
export const SPECIES_STAGE_TARGET: Record<PoultryType, Record<BirdStage, { protein: number; gramsPerBirdDay: number }>> = {
  chicken: {
    chick: { protein: 20, gramsPerBirdDay: 40 },
    grower: { protein: 16, gramsPerBirdDay: 80 },
    layer: { protein: 17, gramsPerBirdDay: 120 },
  },
  duck: {
    chick: { protein: 20, gramsPerBirdDay: 60 },
    grower: { protein: 16, gramsPerBirdDay: 110 },
    layer: { protein: 16, gramsPerBirdDay: 150 },
  },
  turkey: {
    chick: { protein: 28, gramsPerBirdDay: 60 },
    grower: { protein: 22, gramsPerBirdDay: 150 },
    layer: { protein: 16, gramsPerBirdDay: 250 },
  },
  goose: {
    chick: { protein: 20, gramsPerBirdDay: 80 },
    grower: { protein: 15, gramsPerBirdDay: 200 },
    layer: { protein: 15, gramsPerBirdDay: 280 },
  },
  quail: {
    chick: { protein: 24, gramsPerBirdDay: 8 },
    grower: { protein: 20, gramsPerBirdDay: 15 },
    layer: { protein: 18, gramsPerBirdDay: 22 },
  },
  "guinea-fowl": {
    chick: { protein: 24, gramsPerBirdDay: 35 },
    grower: { protein: 20, gramsPerBirdDay: 70 },
    layer: { protein: 16, gramsPerBirdDay: 90 },
  },
};

// Symptom, condition category with rough weight.
export interface SymptomRule {
  id: string;
  label: string;
  weights: Partial<Record<string, number>>;
}

export const CONDITIONS: Record<string, { name: string; urgency: "low" | "medium" | "high"; note: string }> = {
  respiratory: { name: "Respiratory condition (e.g. Newcastle, IB, CRD)", urgency: "high", note: "Isolate affected birds. Do not treat blindly with antibiotics, see a vet for diagnosis." },
  digestive:   { name: "Digestive / parasitic (e.g. coccidiosis, worms)", urgency: "medium", note: "Improve litter hygiene and clean water. A vet or agrovet can confirm and dispense the correct dose." },
  nutritional: { name: "Nutritional deficiency", urgency: "low", note: "Review feed protein and calcium. Consider recalculating your feed plan." },
  external:    { name: "External parasites / stress", urgency: "low", note: "Check for mites, lice, overcrowding. Dust the coop and reduce stocking density." },
  emergency:   { name: "Possible outbreak, urgent", urgency: "high", note: "Sudden deaths or drop in eggs of 30%+ needs a vet within 24 hours." },
};

export const SYMPTOMS: SymptomRule[] = [
  { id: "sneezing",       label: "Sneezing / coughing / rattling", weights: { respiratory: 3 } },
  { id: "discharge",      label: "Nasal or eye discharge",         weights: { respiratory: 3 } },
  { id: "twisted-neck",   label: "Twisted neck or paralysis",      weights: { respiratory: 4, emergency: 3 } },
  { id: "diarrhoea",      label: "Watery or bloody droppings",     weights: { digestive: 4 } },
  { id: "weight-loss",    label: "Weight loss, pale comb",         weights: { digestive: 2, nutritional: 2 } },
  { id: "soft-shells",    label: "Soft or thin egg shells",        weights: { nutritional: 4 } },
  { id: "drop-in-eggs",   label: "Sudden drop in egg production",  weights: { respiratory: 2, emergency: 3 } },
  { id: "mites",          label: "Feather loss / scratching",      weights: { external: 4 } },
  { id: "sudden-deaths",  label: "Several sudden deaths",          weights: { emergency: 5, respiratory: 2 } },
  { id: "swollen-face",   label: "Swollen face or wattles",        weights: { respiratory: 3 } },
];