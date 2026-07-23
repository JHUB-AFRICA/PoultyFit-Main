// Curated reference data used across modules. In a later phase this becomes
// an API served from the platform's own backend (agrovet-integrated).

export const COUNTIES = [
  "Nairobi", "Kiambu", "Machakos", "Kajiado", "Nakuru", "Mombasa",
  "Kisumu", "Uasin Gishu", "Nyeri", "Meru", "Murang'a", "Kakamega",
] as const;

export type CountyName = (typeof COUNTIES)[number];

// Simplified indicative bylaws / advisory notes per county.
// Real deployment: replace with authoritative county / ward data.
export const COUNTY_BYLAWS: Record<string, {
  urbanMaxBackyard: number;   // advisory max birds in urban backyard
  requiresPermit: boolean;
  setbackMeters: number;      // recommended distance from neighbour
  note: string;
}> = {
  Nairobi:   { urbanMaxBackyard: 20, requiresPermit: true,  setbackMeters: 3, note: "Nairobi County requires a livestock permit for keeping poultry in residential zones." },
  Kiambu:    { urbanMaxBackyard: 50, requiresPermit: false, setbackMeters: 2, note: "Peri-urban wards generally allow backyard flocks; keep coop clean to avoid nuisance complaints." },
  Machakos:  { urbanMaxBackyard: 80, requiresPermit: false, setbackMeters: 2, note: "Rural wards are lenient; urban wards may require ward officer notification." },
  Kajiado:   { urbanMaxBackyard: 60, requiresPermit: false, setbackMeters: 2, note: "Check with your ward administrator in Ongata Rongai / Kitengela estates." },
  Nakuru:    { urbanMaxBackyard: 40, requiresPermit: true,  setbackMeters: 3, note: "Nakuru City by-laws require a livestock permit inside city boundary." },
  Mombasa:   { urbanMaxBackyard: 15, requiresPermit: true,  setbackMeters: 4, note: "Coastal humidity increases disease risk; keep flock small in dense estates." },
  Kisumu:    { urbanMaxBackyard: 30, requiresPermit: true,  setbackMeters: 3, note: "Kisumu City requires notification; rural sub-counties are open." },
  "Uasin Gishu": { urbanMaxBackyard: 80, requiresPermit: false, setbackMeters: 2, note: "Generally open; Eldoret CBD estates may restrict." },
  Nyeri:     { urbanMaxBackyard: 60, requiresPermit: false, setbackMeters: 2, note: "Most sub-counties allow backyard poultry." },
  Meru:      { urbanMaxBackyard: 80, requiresPermit: false, setbackMeters: 2, note: "Open in most wards." },
  "Murang'a":{ urbanMaxBackyard: 80, requiresPermit: false, setbackMeters: 2, note: "Open in most wards." },
  Kakamega:  { urbanMaxBackyard: 80, requiresPermit: false, setbackMeters: 2, note: "Open in most wards." },
};

// Space requirement per bird (m²) depending on housing type.
export const SPACE_PER_BIRD: Record<string, number> = {
  "backyard-open": 0.6,
  "deep-litter":   0.35,
  "cage":          0.15,
  "free-range":    1.0,
};

// Startup cost per bird (KES) by starting stage — day-old chick + brooder share is
// cheapest; growers cost more (already fed for weeks); point-of-lay pullets cost the
// most but start producing immediately. Reasonable Kenyan agrovet gaps (2025).
export const STARTUP_COST_PER_BIRD: Record<BirdStage, number> = {
  chick:  180,
  grower: 500,
  layer:  850,
};

// Feed ingredients — indicative Kenyan agrovet prices (KES per kg)
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

// Sample vet & agrovet directory. In later phase this is served from partner-integrated backend.
export interface VetContact {
  id: string;
  name: string;
  kind: "vet" | "agrovet";
  county: string;
  lat: number;
  lng: number;
  phone: string;
  services: string[];
}

export const VET_DIRECTORY: VetContact[] = [
  { id: "v1", name: "Juja Farmers Vet Clinic", kind: "vet", county: "Kiambu", lat: -1.1018, lng: 37.0144, phone: "+254 720 111 001", services: ["Vaccination", "Deworming", "Post-mortem"] },
  { id: "v2", name: "Thika Livestock Vet", kind: "vet", county: "Kiambu", lat: -1.0396, lng: 37.0900, phone: "+254 720 111 002", services: ["Vaccination", "Emergency call-out"] },
  { id: "v3", name: "Kasarani Agrovet & Vet", kind: "vet", county: "Nairobi", lat: -1.2226, lng: 36.8965, phone: "+254 720 111 003", services: ["Poultry drugs", "Consultation"] },
  { id: "a1", name: "Farmers Choice Agrovet — Ruiru", kind: "agrovet", county: "Kiambu", lat: -1.1436, lng: 36.9614, phone: "+254 720 222 001", services: ["Feeds", "Vaccines", "Chicks"] },
  { id: "a2", name: "Kenchic Distributor — Kikuyu", kind: "agrovet", county: "Kiambu", lat: -1.2464, lng: 36.6636, phone: "+254 720 222 002", services: ["Day-old chicks", "Feeds"] },
  { id: "a3", name: "Sigma Feeds Agrovet — Kitengela", kind: "agrovet", county: "Kajiado", lat: -1.4785, lng: 36.9598, phone: "+254 720 222 003", services: ["Feeds", "Equipment"] },
  { id: "a4", name: "Unga Feeds Outlet — Nakuru", kind: "agrovet", county: "Nakuru", lat: -0.3031, lng: 36.0800, phone: "+254 720 222 004", services: ["Feeds", "Supplements"] },
  { id: "v4", name: "Meru Poultry Vet", kind: "vet", county: "Meru", lat: 0.0472, lng: 37.6499, phone: "+254 720 111 004", services: ["Vaccination", "Consultation"] },
  { id: "a5", name: "Kisumu Poultry Supplies", kind: "agrovet", county: "Kisumu", lat: -0.0917, lng: 34.7679, phone: "+254 720 222 005", services: ["Feeds", "Drugs"] },
  { id: "v5", name: "Mombasa Coast Vet", kind: "vet", county: "Mombasa", lat: -4.0435, lng: 39.6682, phone: "+254 720 111 005", services: ["Consultation", "Emergency"] },
];

// Symptom → condition category with rough weight.
export interface SymptomRule {
  id: string;
  label: string;
  weights: Partial<Record<string, number>>;
}

export const CONDITIONS: Record<string, { name: string; urgency: "low" | "medium" | "high"; note: string }> = {
  respiratory: { name: "Respiratory condition (e.g. Newcastle, IB, CRD)", urgency: "high", note: "Isolate affected birds. Do not treat blindly with antibiotics — see a vet for diagnosis." },
  digestive:   { name: "Digestive / parasitic (e.g. coccidiosis, worms)", urgency: "medium", note: "Improve litter hygiene and clean water. A vet or agrovet can confirm and dispense the correct dose." },
  nutritional: { name: "Nutritional deficiency", urgency: "low", note: "Review feed protein and calcium. Consider recalculating your feed plan." },
  external:    { name: "External parasites / stress", urgency: "low", note: "Check for mites, lice, overcrowding. Dust the coop and reduce stocking density." },
  emergency:   { name: "Possible outbreak — urgent", urgency: "high", note: "Sudden deaths or drop in eggs of 30%+ needs a vet within 24 hours." },
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
