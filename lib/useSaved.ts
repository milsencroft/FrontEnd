"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";

export interface SavedAddress { id: string; label: string; recipient: string; phone: string; line1: string; line2: string | null; city: string; state: string; pincode: string; is_default: boolean }

export function useAddresses() {
  const { session } = useSession();
  const [list, setList] = useState<SavedAddress[]>([]);
  const load = useCallback(async () => {
    if (!session) return setList([]);
    const { data } = await supabase.from("customer_addresses").select("*").order("created_at");
    setList((data as SavedAddress[]) ?? []);
  }, [session]);
  useEffect(() => { void load(); }, [load]);
  return { list, reload: load };
}

export function useWishlist() {
  const { session } = useSession();
  const [codes, setCodes] = useState<string[]>([]);
  const load = useCallback(async () => {
    if (!session) return setCodes([]);
    const { data } = await supabase.from("wishlist_items").select("product_code").order("created_at", { ascending: false });
    setCodes(((data as { product_code: string }[]) ?? []).map((r) => r.product_code));
  }, [session]);
  useEffect(() => { void load(); }, [load]);
  const toggle = async (code: string) => { const { error } = await supabase.rpc("my_toggle_wishlist", { p_code: code }); if (!error) await load(); return !error; };
  return { codes, toggle, signedIn: !!session };
}
