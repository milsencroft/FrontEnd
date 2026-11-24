// Server-side reads of the public API, used for metadata, sitemap and first-paint HTML.
// Same allowlisted /rpc endpoints the browser uses; no keys, no database access. Every helper returns
// undefined when the API cannot be reached, so a build or a page never fails because of it.
import { env } from "../env";
import type { ShopBundle, ShopRow } from "../useShop";
import type { PageRow } from "@/components/PageBody";

export const REVALIDATE_SECONDS = 300;

export async function fetchRpc<T>(fn: string, args: Record<string, unknown> = {}, f: typeof fetch = fetch): Promise<T | undefined> {
  if (!env.apiBase) return undefined;
  try {
    const res = await f(`${env.apiBase}/rpc/${fn}`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(args),
      signal: AbortSignal.timeout(4000), next: { revalidate: REVALIDATE_SECONDS },
    } as RequestInit);
    if (!res.ok) return undefined;
    const json = (await res.json()) as { data?: unknown };
    return (json?.data ?? null) as T;
  } catch { return undefined; }
}

const list = <T,>(v: unknown): T[] | undefined => (Array.isArray(v) ? (v as T[]) : undefined);

/** Published, purchasable catalogue. Launch-only and draft products are never returned by the backend. */
export const fetchCatalogue = async () => list<ShopRow>(await fetchRpc("shop_catalogue"));
export const fetchLaunchOpen = async (code: string) => {
  const r = await fetchRpc<{ status: string }[]>("public_launch_state", { p_code: code });
  return Array.isArray(r) ? ["preorder_active", "paused", "closed"].includes(r[0]?.status ?? "") : undefined;
};
export const fetchBundles = async () => list<ShopBundle>(await fetchRpc("shop_bundles"));
export const fetchPageList = async (kind: "journal" | "legal") => list<PageRow>(await fetchRpc("public_pages", { p_kind: kind }));

/** A published page of the given kind. null = confirmed not published; undefined = could not check. */
export async function fetchPage(slug: string, kind: string): Promise<PageRow | null | undefined> {
  const d = await fetchRpc<PageRow | PageRow[] | null>("public_page", { p_slug: slug });
  if (d === undefined) return undefined;
  const row = Array.isArray(d) ? d[0] : d;
  return row && row.kind === kind ? row : null;
}

/** Groups catalogue rows (one per size) by product, keeping the backend's order. */
export function groupByProduct(rows: ShopRow[]): Map<string, ShopRow[]> {
  const m = new Map<string, ShopRow[]>();
  for (const r of rows) m.set(r.product_code, [...(m.get(r.product_code) ?? []), r]);
  return m;
}
