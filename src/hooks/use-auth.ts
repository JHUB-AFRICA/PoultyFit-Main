import { useEffect, useState } from "react";
import { getCurrentUser, getProfile, hydrateProfileFromFarm, type AuthUser, type FarmerProfile } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // `ready` only flips true once BOTH the auth session and (when a user
    // is present) the profile-hydration attempt have settled. Otherwise a
    // returning user with a real farm row can be briefly seen as
    // profile-less and misredirected to /onboarding.
    const sync = async () => {
      const u = getCurrentUser();
      if (cancelled) return;
      setUser(u);
      let p = getProfile();
      if (u && !p) {
        p = await hydrateProfileFromFarm(u.id);
        if (cancelled) return;
      }
      setProfile(p);
      setReady(true);
    };

    void sync();
    const onEvent = () => { void sync(); };
    window.addEventListener("poultryfit-auth", onEvent);
    window.addEventListener("storage", onEvent);
    return () => {
      cancelled = true;
      window.removeEventListener("poultryfit-auth", onEvent);
      window.removeEventListener("storage", onEvent);
    };
  }, []);

  return { user, profile, ready };
}
