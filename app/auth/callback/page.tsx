"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Callback() {
  const router = useRouter();
  useEffect(() => {
    // supabase-js exchanges the OAuth code in the URL automatically (detectSessionInUrl).
    const { data } = supabase.auth.onAuthStateChange((e, s) => { if (s) router.replace("/account"); });
    supabase.auth.getSession().then(({ data: d }) => { if (d.session) router.replace("/account"); });
    const t = setTimeout(() => router.replace("/access-denied"), 8000);
    return () => { clearTimeout(t); data.subscription.unsubscribe(); };
  }, [router]);
  return <p className="wrap py-16">Signing you in…</p>;
}
