"use client";
import { useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { rupees } from "@/lib/money";

interface Order { id: string; order_number: string; order_type: string; total_paise: number; payment_status: string; fulfilment_status: string; courier: string | null; tracking_number: string | null; created_at: string }
interface Member { membership_number: string; tier: number; status: string }
interface Me { full_name: string | null; phone: string | null; whatsapp_consent: boolean }

function Account() {
  const { session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [me, setMe] = useState<Me>({ full_name: "", phone: "", whatsapp_consent: false });
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("orders").select("id,order_number,order_type,total_paise,payment_status,fulfilment_status,courier,tracking_number,created_at").order("created_at", { ascending: false }).then(({ data }) => setOrders((data as Order[]) ?? []));
    supabase.from("society_memberships").select("membership_number,tier,status").eq("status", "active").maybeSingle().then(({ data }) => setMember((data as Member) ?? null));
    supabase.from("customers").select("full_name,phone,whatsapp_consent").maybeSingle().then(({ data }) => data && setMe(data as Me));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.rpc("update_my_profile", { p_name: me.full_name ?? "", p_phone: me.phone ?? "", p_whatsapp: me.whatsapp_consent });
    setSaved(error ? "Could not save. Please check your details." : "Saved.");
  }

  return (
    <section className="wrap py-16 grid gap-10">
      <h1 className="text-4xl">Your account</h1>
      <p className="text-sm text-charcoal/70">{session?.user.email}</p>
      {member && <div className="card"><p className="text-xs uppercase tracking-[0.18em] text-bronze">Society member</p><p className="mt-1 font-serif text-2xl">{member.membership_number}</p><p className="text-sm">Tier {member.tier}</p></div>}
      <div>
        <h2 className="text-2xl mb-4">Orders</h2>
        {orders.length === 0 ? <p className="text-charcoal/70">No orders yet.</p> : (
          <ul className="grid gap-3">{orders.map((o) => (
            <li key={o.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-medium">{o.order_number}</p><p className="text-sm text-charcoal/70">{new Date(o.created_at).toLocaleDateString("en-IN")} · {o.order_type === "launch" ? "Launch pre-order" : "Retail"}</p></div>
              <div className="text-sm text-right"><p>{rupees(o.total_paise)}</p><p>Payment: {o.payment_status.replace(/_/g, " ")} · {o.fulfilment_status}</p>{o.tracking_number && <p>{o.courier}: {o.tracking_number}</p>}</div>
            </li>))}</ul>)}
      </div>
      <form onSubmit={save} className="card grid gap-4 max-w-xl">
        <h2 className="text-2xl">Contact details</h2>
        <div><label className="label" htmlFor="fn">Name</label><input id="fn" className="field" value={me.full_name ?? ""} onChange={(e) => setMe({ ...me, full_name: e.target.value })} /></div>
        <div><label className="label" htmlFor="ph">Mobile</label><input id="ph" className="field" inputMode="numeric" value={me.phone ?? ""} onChange={(e) => setMe({ ...me, phone: e.target.value })} /></div>
        <label className="flex items-start gap-3 text-sm min-h-[44px]"><input type="checkbox" className="mt-1 h-5 w-5" checked={me.whatsapp_consent} onChange={(e) => setMe({ ...me, whatsapp_consent: e.target.checked })} />I agree to receive order updates on WhatsApp.</label>
        <div><button className="btn">Save</button>{saved && <span role="status" className="ml-4 text-sm">{saved}</span>}</div>
      </form>
    </section>
  );
}
export default function Page() { return <SignedInOnly><Account /></SignedInOnly>; }
