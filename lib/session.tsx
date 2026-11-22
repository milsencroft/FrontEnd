"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface Ctx { session: Session | null; loading: boolean; permissions: string[]; role: string | null; refresh: () => Promise<void> }
const SessionCtx = createContext<Ctx>({ session: null, loading: true, permissions: [], role: null, refresh: async () => {} });
export const useSession = () => useContext(SessionCtx);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [role, setRole] = useState<string | null>(null);

  async function loadAccess(s: Session | null) {
    if (!s) { setPermissions([]); setRole(null); return; }
    const [p, r] = await Promise.all([supabase.rpc("my_permissions"), supabase.rpc("my_role")]);
    setPermissions((p.data as string[]) ?? []); setRole((r.data as string) ?? null);
  }
  const refresh = async () => { const { data } = await supabase.auth.getSession(); setSession(data.session); await loadAccess(data.session); };
  useEffect(() => {
    refresh().finally(() => setLoading(false));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); void loadAccess(s); });
    return () => data.subscription.unsubscribe();
  }, []);
  return <SessionCtx.Provider value={{ session, loading, permissions, role, refresh }}>{children}</SessionCtx.Provider>;
}
