"use client";
import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Google sign-in is the only auth method. The anon key is public by design; RLS and RPC checks protect data.
export const supabase = createClient(env.supabaseUrl || "http://localhost", env.anonKey || "missing", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
export const signOut = () => supabase.auth.signOut();
