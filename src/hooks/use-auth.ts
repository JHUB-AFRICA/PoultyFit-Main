import { useEffect, useState } from "react";
import { getCurrentUser, getProfile, hydrateProfileFromFarm, type AuthUser, type FarmerProfile } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      const u = getCurrentUser();
      setUser(u);
      const p = getProfile();
      setProfile(p);
      if (u && !p) {
        void hydrateProfileFromFarm(u.id).then((hydrated) => {
          if (hydrated) setProfile(hydrated);
        });
      }
    };
    sync();
    setReady(true);
    window.addEventListener("poultryfit-auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("poultryfit-auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user, profile, ready };
}
