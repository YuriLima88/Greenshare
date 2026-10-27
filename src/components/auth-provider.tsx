import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { ensureUserProfile } from "@/lib/auth";

const AuthContext = createContext<{ user: User | null; loading: boolean; setUser: (user: User | null) => void; profileError: string; profileBusy: boolean; retryProfile: () => Promise<void> } | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [profileBusy, setProfileBusy] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  async function retryProfile() {
    if (!user) return;
    setProfileBusy(true);
    setProfileError("");
    try {
      const result = await ensureUserProfile(user.id);
      if (result.status === "missing") setProfileError("Seu cadastro não contém os dados necessários. Não crie outra conta; solicite ajuda à organização.");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Não foi possível concluir seu cadastro. Tente novamente.");
    } finally { setProfileBusy(false); }
  }

  useEffect(() => {
    let active = true;
    let version = 0;
    async function validate() {
      const current = ++version;
      try {
        const { data, error } = await supabase.auth.getUser();
        if (active && current === version) {
          setUser(error ? null : data.user);
          setProfileError("");
          if (!error && data.user) {
            setProfileBusy(true);
            try {
              const result = await ensureUserProfile(data.user.id);
              if (active && current === version && result.status === "missing") setProfileError("Seu cadastro não contém os dados necessários. Não crie outra conta; solicite ajuda à organização.");
            } catch (error) {
              if (active && current === version) setProfileError(error instanceof Error ? error.message : "Não foi possível concluir seu cadastro. Tente novamente.");
            } finally { if (active && current === version) setProfileBusy(false); }
          }
        }
      } catch {
        if (active && current === version) setUser(null);
      } finally {
        if (active && current === version) setLoading(false);
      }
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      if (event === "SIGNED_OUT") {
        ++version;
        setUser(null);
        setProfileError("");
        setProfileBusy(false);
        setLoading(false);
        void queryClient.cancelQueries().then(() => queryClient.clear());
      } else {
        // Defer Auth calls until the Supabase callback releases its session lock.
        queueMicrotask(() => { if (active) void validate(); });
        void queryClient.invalidateQueries();
      }
      void router.invalidate();
    });
    void validate();
    return () => { active = false; subscription.unsubscribe(); };
  }, [router, queryClient]);

  return <AuthContext.Provider value={{ user, loading, setUser, profileError, profileBusy, retryProfile }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthProvider obrigatório.");
  return auth;
}