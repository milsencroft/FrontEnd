"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SignedInOnly } from "@/components/Gate";
import { Loader } from "@/components/Loader";
import { Art, Scene } from "@/components/admin/Art";
import { ADMIN_GROUPS } from "@/components/admin/nav";
import { db } from "@/lib/api";
import { useSession } from "@/lib/session";
import { rupees } from "@/lib/money";

interface Summary { orders_paid?: number; revenue_paise?: number; to_pack?: number; refunds_pending?: number }

function Stat({ art, label, value, href, hint }: { art: string; label: string; value: string; href?: string; hint?: string }) {
  const body = (<>
    <span className="admin-stat-art"><Art name={art} size={30} /></span>
    <span className="min-w-0"><span className="block text-sm text-charcoal/70">{label}</span><span className="block font-serif text-3xl leading-tight">{value}</span>{hint && <span className="block text-xs text-brass">{hint}</span>}</span>
  </>);
  return href ? <Link href={href} className="admin-stat card">{body}</Link> : <div className="admin-stat card">{body}</div>;
}

function Dashboard() {
  const { permissions, session } = useSession();
  const [s, setS] = useState<Summary | null>(null);
  const canStats = permissions.includes("orders.view");
  useEffect(() => { if (canStats) db.rpc("admin_summary").then(({ data }) => setS((data as Summary) ?? {})); }, [canStats]);
  if (permissions.length === 0) return <div className="wrap py-16"><h1 className="text-3xl">No admin access</h1><p className="mt-2">Your Google account is not a staff account.</p></div>;
  const name = (session?.user?.user_metadata?.full_name as string | undefined)?.split(" ")[0];
  const groups = ADMIN_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !i.perm || permissions.includes(i.perm)) })).filter((g) => g.items.length);
  const toPack = s?.to_pack ?? 0;
  return (
    <div className="grid gap-8">
      <div className="admin-hero card">
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl">{name ? `Welcome, ${name}` : "Welcome"}</h1>
          <p className="mt-2 max-w-md text-charcoal/75">{canStats && s ? (toPack > 0 ? `${toPack} ${toPack === 1 ? "order is" : "orders are"} waiting to be packed.` : "Nothing is waiting to be packed.") : "Pick a section to get started."}</p>
          {canStats && toPack > 0 && <Link href="/admin/orders" className="btn mt-5">Go to orders</Link>}
        </div>
        <div className="admin-hero-art"><Scene /></div>
      </div>

      {canStats && (s ? (
        <div className="cq"><div className="cq-grid grid grid-cols-1 gap-4">
          <Stat art="orders" label="Paid orders" value={String(s.orders_paid ?? 0)} href="/admin/orders" />
          <Stat art="reports" label="Sales so far" value={rupees(Number(s.revenue_paise ?? 0))} href={permissions.includes("payments.view") ? "/admin/reports" : undefined} />
          <Stat art="stock" label="Orders to pack" value={String(toPack)} href="/admin/orders" hint={toPack > 0 ? "Needs attention" : undefined} />
          <Stat art="coupons" label="Refunds in progress" value={String(s.refunds_pending ?? 0)} />
        </div></div>
      ) : <Loader />)}

      {groups.map((g) => (
        <section key={g.title} aria-labelledby={`g-${g.title}`}>
          <h2 id={`g-${g.title}`} className="admin-group-title mb-3">{g.title}</h2>
          <div className="cq"><div className="cq-grid grid grid-cols-1 gap-4">
            {g.items.map((i) => (
              <Link key={i.href} href={i.href} className="admin-tile card">
                <span className="admin-tile-art"><Art name={i.art} size={52} /></span>
                <span className="block font-serif text-xl">{i.label}</span>
                <span className="mt-1 block text-sm text-charcoal/70">{i.blurb}</span>
              </Link>
            ))}
          </div></div>
        </section>
      ))}
    </div>
  );
}

export default function Page() { return <SignedInOnly><Dashboard /></SignedInOnly>; }
