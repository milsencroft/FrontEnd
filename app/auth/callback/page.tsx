"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, RETURN_KEY } from "@/lib/supabase";

export default function Callback() {
  const router = useRouter();
  const dest = () => {
    try { const r = sessionStorage.getItem(RETURN_KEY); sessionStorage.removeItem(RETURN_KEY); if (r && r.startsWith("/") && !r.startsWith("//")) return r; } catch {}
    return "/account";
  };
  useEffect(() => {
    const target = dest(); // read once so both listeners agree
    // supabase-js exchanges the OAuth code in the URL automatically (detectSessionInUrl).
    const { data } = supabase.auth.onAuthStateChange((e, s) => { if (s) router.replace(target); });
    supabase.auth.getSession().then(({ data: d }) => { if (d.session) router.replace(target); });
    const t = setTimeout(() => router.replace("/access-denied"), 8000);
    return () => { clearTimeout(t); data.subscription.unsubscribe(); };
  }, [router]);
  return <p className="wrap py-16">Signing you in…</p>;
}
