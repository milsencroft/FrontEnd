"use client";
import type { ReactNode } from "react";
import { useSession } from "@/lib/session";
import { signInWithGoogle } from "@/lib/supabase";

export function SignedInOnly({ children }: { children: ReactNode }) {
  const { session, loading } = useSession();
  if (loading) return <p className="wrap py-16">Loading…</p>;
  if (!session) return (
    <div className="wrap py-16"><p className="mb-4">Please sign in to continue.</p><button className="btn" onClick={() => signInWithGoogle()}>Sign in with Google</button></div>
  );
  return <>{children}</>;
}
