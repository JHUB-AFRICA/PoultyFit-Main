// Supabase-backed auth, with a synchronous local cache so existing components
// that call getCurrentUser() / getProfile() during render keep working.
// FarmerProfile is still kept in localStorage as a UI cache; the source of
// truth for a signed-in user's farm data is the `farms` table on the backend.

import { supabase } from "@/integrations/supabase/client";

const USER_CACHE_KEY = "poultryfit.user";
const PROFILE_KEY = "poultryfit.profile";

export interface AuthUser {
  email: string;
  name: string;
  id: string;
}

export type HousingType = "backyard-open" | "deep-litter" | "cage" | "free-range";
export type Experience = "first-time" | "some" | "experienced";
export type BirdGoal = "eggs" | "meat" | "dual";
export type PoultryType = "chicken" | "duck" | "turkey" | "goose" | "quail" | "guinea-fowl";
export type StartingStage = "chick" | "grower" | "layer";

export interface FarmerProfile {
  county: string;
  ward?: string;
  spaceM2: number;
  lengthM?: number;
  widthM?: number;
  budgetKes: number;
  housing: HousingType;
  goal: BirdGoal;
  experience: Experience;
  startingStage: StartingStage;
  poultryTypes: PoultryType[];
  createdAt: string;
}

function read<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeCache(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (user) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  else localStorage.removeItem(USER_CACHE_KEY);
  window.dispatchEvent(new Event("poultryfit-auth"));
}

export function getCurrentUser(): AuthUser | null {
  return read<AuthUser | null>(USER_CACHE_KEY, null);
}
export function getProfile(): FarmerProfile | null {
  return read<FarmerProfile | null>(PROFILE_KEY, null);
}
export function saveProfile(p: FarmerProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  window.dispatchEvent(new Event("poultryfit-auth"));
  // Fire-and-forget mirror to backend when signed in
  const u = getCurrentUser();
  if (u) {
    void supabase.from("farms").upsert(
      {
        user_id: u.id,
        name: "My farm",
        county: p.county,
        sub_county: p.ward,
        space_m2: p.spaceM2,
        budget_kes: p.budgetKes,
        housing: p.housing,
      },
      { onConflict: "user_id" },
    );
  }
}

function toAuthUser(u: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null): AuthUser | null {
  if (!u) return null;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const name = (meta.full_name as string) || (meta.name as string) || (u.email ?? "").split("@")[0];
  return { id: u.id, email: u.email ?? "", name };
}

export async function signUp(name: string, email: string, password: string): Promise<AuthUser> {
  email = email.trim().toLowerCase();
  if (!name.trim() || !email || password.length < 6) {
    throw new Error("Enter your name, a valid email and a password of 6+ characters.");
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name.trim() },
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  });
  if (error) throw new Error(error.message);
  const user = toAuthUser(data.user);
  if (!user) throw new Error("Sign up succeeded but no user returned. Check your email to confirm.");
  writeCache(user);
  return user;
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  email = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  const user = toAuthUser(data.user);
  if (!user) throw new Error("Sign in failed.");
  writeCache(user);
  return user;
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin + "/dashboard" },
  });
  if (error) throw new Error(error.message ?? "Google sign-in failed");
  // Browser will redirect to Google; session hydrates on return via onAuthStateChange.
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
  if (typeof window !== "undefined") {
    localStorage.removeItem(PROFILE_KEY);
  }
  writeCache(null);
}

const HOUSING_VALUES: HousingType[] = ["backyard-open", "deep-litter", "cage", "free-range"];
function isHousing(v: unknown): v is HousingType {
  return typeof v === "string" && (HOUSING_VALUES as string[]).includes(v);
}

export async function hydrateProfileFromFarm(userId: string): Promise<FarmerProfile | null> {
  if (typeof window === "undefined") return null;
  if (getProfile()) return getProfile();
  const { data, error } = await supabase
    .from("farms")
    .select("county, sub_county, space_m2, budget_kes, housing")
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  const profile: FarmerProfile = {
    county: data.county ?? "",
    ward: data.sub_county ?? undefined,
    spaceM2: data.space_m2 ?? 0,
    budgetKes: data.budget_kes ?? 0,
    housing: isHousing(data.housing) ? data.housing : "backyard-open",
    goal: "eggs",
    experience: "first-time",
    startingStage: "chick",
    poultryTypes: ["chicken"],
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("poultryfit-auth"));
  return profile;
}

// Bootstrap: hydrate cache from Supabase session and keep it in sync.
if (typeof window !== "undefined") {
  void supabase.auth.getUser().then(({ data }) => {
    const u = toAuthUser(data.user);
    writeCache(u);
    if (u) void hydrateProfileFromFarm(u.id);
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    const u = toAuthUser(session?.user ?? null);
    writeCache(u);
    if (u) void hydrateProfileFromFarm(u.id);
  });
}

