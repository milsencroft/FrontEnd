"use client";
import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Google sign-in is the only auth method. The anon key is public by design; RLS and RPC checks protect data.
export const supabase = createClient(env.supabaseUrl || "http://localhost", env.anonKey || "missing", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export const RETURN_KEY = "mc_return_to";
export const signInWithGoogle = () => {
  // Remember where the customer was so they land back there (e.g. the launch page) after Google sign-in.
  try { sessionStorage.setItem(RETURN_KEY, window.location.pathname + window.location.search); } catch {}
  return supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
};
export const signOut = () => supabase.auth.signOut();
