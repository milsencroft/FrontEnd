"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useSession } from "@/lib/session";
import { Art, ArtBadge } from "./Art";
import { ADMIN_GROUPS } from "./nav";

/** Sidebar on wide screens, a scrolling pill bar on phones and folded devices. */
export function AdminShell({ children }: { children: ReactNode }) {
  const { permissions } = useSession();
  const path = usePathname() ?? "";
  if (permissions.length === 0) return <>{children}</>;
  const groups = ADMIN_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => !i.perm || permissions.includes(i.perm)) })).filter((g) => g.items.length);
  const all = groups.flatMap((g) => g.items);
  const current = all.find((i) => path === i.href || path.startsWith(i.href + "/"));
  const on = (href: string) => path === href || path.startsWith(href + "/");
  return (
    <div className="admin wrap lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
      <aside className="admin-side" aria-label="Admin">
        <Link href="/admin" aria-current={path === "/admin" ? "page" : undefined} className="admin-link admin-home"><Art name="home" size={22} /><span>Dashboard</span></Link>
        <nav className="admin-nav">
          {groups.map((g) => (
            <div key={g.title} className="admin-group">
              <p className="admin-group-title">{g.title}</p>
              {g.items.map((i) => (
                <Link key={i.href} href={i.href} aria-current={on(i.href) ? "page" : undefined} className="admin-link"><Art name={i.art} size={22} /><span>{i.label}</span></Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      <div className="admin-main min-w-0 py-8">
        {current && (
          <div className="admin-banner">
            <ArtBadge name={current.art} size={56} />
            <p className="text-sm text-charcoal/70">{current.blurb}</p>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
