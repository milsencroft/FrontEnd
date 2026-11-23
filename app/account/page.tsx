"use client";
import { useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session";
import { rupees } from "@/lib/money";
import Link from "next/link";
import { useAddresses, useWishlist } from "@/lib/useSaved";
import { useShop } from "@/lib/useShop";
import { SocietyStatus } from "@/components/SocietyStatus";

interface Order { id: string; order_number: string; order_type: string; total_paise: number; payment_status: string; fulfilment_status: string; courier: string | null; tracking_number: string | null; tracking_url: string | null; estimated_delivery: string | null; created_at: string }
interface Me { full_name: string | null; phone: string | null; whatsapp_consent: boolean }

const BLANK = { label: "Home", recipient: "", phone: "", line1: "", line2: "", city: "", state: "Kerala", pincode: "", is_default: false };

function Addresses() {
  const { list, reload } = useAddresses();
  const [f, setF] = useState(BLANK); const [open, setOpen] = useState(false); const [msg, setMsg] = useState<string | null>(null);
  const set = (k: keyof typeof BLANK) => (e: { target: { value: string; type?: string; checked?: boolean } }) => setF({ ...f, [k]: e.target.type === "checkbox" ? !!e.target.checked : e.target.value });
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.rpc("my_save_address", { p_id: null, p_label: f.label, p_recipient: f.recipient, p_phone: f.phone, p_line1: f.line1, p_line2: f.line2, p_city: f.city, p_state: f.state, p_pincode: f.pincode, p_default: f.is_default });
    if (error) return setMsg(error.message === "limit_reached" ? "You can save up to 10 addresses." : "Please check the address details.");
    setF(BLANK); setOpen(false); setMsg(null); void reload();
  }
  return (
    <div>
      <h2 className="text-2xl mb-4">Saved addresses</h2>
      {list.length === 0 && <p className="text-charcoal/70">No saved addresses yet.</p>}
      <ul className="grid gap-3">{list.map((a) => (
        <li key={a.id} className="card flex flex-wrap items-start justify-between gap-3">
          <div className="text-sm"><p className="font-medium">{a.label}{a.is_default ? " (default)" : ""}</p><p>{a.recipient} · {a.phone}</p><p>{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}</p></div>
          <div className="flex gap-2">
            {!a.is_default && <button className="btn-ghost" onClick={async () => { await supabase.rpc("my_save_address", { p_id: a.id, p_label: a.label, p_recipient: a.recipient, p_phone: a.phone, p_line1: a.line1, p_line2: a.line2, p_city: a.city, p_state: a.state, p_pincode: a.pincode, p_default: true }); void reload(); }}>Make default</button>}
            <button className="btn-ghost" onClick={async () => { await supabase.rpc("my_delete_address", { p_id: a.id }); void reload(); }}>Remove</button>
          </div>
        </li>))}</ul>
      {!open ? <button className="btn-ghost mt-4" onClick={() => setOpen(true)}>Add an address</button> : (
        <form onSubmit={add} className="card mt-4 grid max-w-xl gap-3">
          <div><label className="label" htmlFor="al">Label</label><input id="al" className="field" value={f.label} onChange={set("label")} /></div>
          <div><label className="label" htmlFor="ar">Recipient</label><input id="ar" className="field" required value={f.recipient} onChange={set("recipient")} /></div>
          <div><label className="label" htmlFor="ap">Mobile</label><input id="ap" className="field" required inputMode="numeric" value={f.phone} onChange={set("phone")} /></div>
          <div><label className="label" htmlFor="a1">Address</label><input id="a1" className="field" required value={f.line1} onChange={set("line1")} /></div>
          <div><label className="label" htmlFor="a2">Address line 2 (optional)</label><input id="a2" className="field" value={f.line2} onChange={set("line2")} /></div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className="label" htmlFor="ac">City</label><input id="ac" className="field" required value={f.city} onChange={set("city")} /></div>
            <div><label className="label" htmlFor="as">State</label><input id="as" className="field" required value={f.state} onChange={set("state")} /></div>
            <div><label className="label" htmlFor="az">PIN code</label><input id="az" className="field" required inputMode="numeric" pattern="[1-9][0-9]{5}" value={f.pincode} onChange={set("pincode")} /></div>
          </div>
          <label className="flex min-h-[44px] items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5" checked={f.is_default} onChange={set("is_default")} />Use as my default address</label>
          {msg && <p role="alert" className="text-sm text-danger">{msg}</p>}
          <div className="flex gap-3"><button className="btn">Save address</button><button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancel</button></div>
        </form>)}
    </div>
  );
}

function Wishlist() {
  const { codes, toggle } = useWishlist();
  const { rows } = useShop();
  const items = codes.map((c) => (rows ?? []).find((r) => r.product_code === c)).filter((r): r is NonNullable<typeof r> => !!r);
  return (
    <div>
      <h2 className="text-2xl mb-4">Wishlist</h2>
      {items.length === 0 ? <p className="text-charcoal/70">Nothing saved yet. <Link className="underline underline-offset-4" href="/shop">Browse the shop</Link>.</p> : (
        <ul className="grid gap-3">{items.map((r) => (
          <li key={r.product_code} className="card flex flex-wrap items-center justify-between gap-3">
            <Link href={`/shop/${r.product_code}`}><p className="font-serif text-xl">{r.product_name}</p><p className="text-sm text-charcoal/70">{r.region_name} · from {rupees(r.price_paise)}</p></Link>
            <button className="btn-ghost" onClick={() => void toggle(r.product_code)}>Remove</button>
          </li>))}</ul>)}
      {codes.length > items.length && <p className="mt-3 text-sm text-charcoal/60">Some saved items are not in the shop right now.</p>}
    </div>
  );
}

function Account() {
  const { session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [me, setMe] = useState<Me>({ full_name: "", phone: "", whatsapp_consent: false });
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("orders").select("id,order_number,order_type,total_paise,payment_status,fulfilment_status,courier,tracking_number,tracking_url,estimated_delivery,created_at").order("created_at", { ascending: false }).then(({ data }) => setOrders((data as Order[]) ?? []));
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
      <SocietyStatus />
      <div>
        <h2 className="text-2xl mb-4">Orders</h2>
        {orders.length === 0 ? <p className="text-charcoal/70">No orders yet.</p> : (
          <ul className="grid gap-3">{orders.map((o) => (
            <li key={o.id} className="card flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-medium">{o.order_number}</p><p className="text-sm text-charcoal/70">{new Date(o.created_at).toLocaleDateString("en-IN")} · {o.order_type === "launch_preorder" ? "Launch pre-order" : "Retail"}</p></div>
              <div className="text-sm text-right"><p>{rupees(o.total_paise)}</p><p>Payment: {o.payment_status.replace(/_/g, " ")} · {o.fulfilment_status}</p>{o.tracking_number && <p>{o.courier}: {o.tracking_number}</p>}{o.tracking_url && /^https?:\/\//.test(o.tracking_url) && <p><a className="underline underline-offset-4" href={o.tracking_url} target="_blank" rel="noopener noreferrer">Track your parcel</a></p>}{o.estimated_delivery && <p>Estimated delivery: {new Date(o.estimated_delivery).toLocaleDateString("en-IN")}</p>}</div>
            </li>))}</ul>)}
      </div>
      <Wishlist />
      <Addresses />
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
