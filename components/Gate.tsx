"use client";
import { Loader } from "@/components/Loader";
import type { ReactNode } from "react";
import { useSession } from "@/lib/session";
import { signInWithGoogle } from "@/lib/supabase";

export function SignedInOnly({ children }: { children: ReactNode }) {
  const { session, loading } = useSession();
  if (loading) return <Loader />;
  if (!session) return (
    <div className="wrap py-16"><p className="mb-4">Please sign in to continue.</p><button className="btn" onClick={() => signInWithGoogle()}>Sign in with Google</button></div>
  );
  return <>{children}</>;
}
