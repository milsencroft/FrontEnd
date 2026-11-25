import { env } from "./env";
import { supabase } from "./supabase";

export interface Address { name: string; phone: string; line1: string; line2?: string; city: string; state_code: string; pincode: string }
export interface CheckoutResult { order_id: string; order_number: string; amount_paise: number; currency: "INR"; razorpay_order_id: string; razorpay_key_id: string }
export class ApiError extends Error { constructor(public code: string, public status: number) { super(code); } }

const GUEST_KEY = "mc_guest_cart";
/** Random token that identifies a visitor's cart on the backend. It carries no data itself. */
export function guestToken(): string {
  try {
    let t = localStorage.getItem(GUEST_KEY);
    if (!t || t.length < 32) { t = Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, "0")).join(""); localStorage.setItem(GUEST_KEY, t); }
    return t;
  } catch { return "x".repeat(48); }
}
export const forgetGuestToken = () => { try { localStorage.removeItem(GUEST_KEY); } catch {} };

/** Every call to the backend goes through here. The browser never talks to the database directly. */
export async function request<T>(method: string, path: string, body?: unknown, opts: { guest?: boolean } = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  else if (opts.guest) headers["x-cart-token"] = guestToken();
  const res = await fetch(`${env.apiBase}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error ?? "request_failed", res.status);
  return json as T;
}
const post = <T,>(path: string, body: unknown) => request<T>("POST", path, body);

/** Calls an allowlisted database function through the backend. Resolves { data, error } so screens read like before. */
export async function rpc(fn: string, args: Record<string, unknown> = {}): Promise<{ data: any; error: { message: string } | null }> {
  try { const r = await request<{ data: unknown }>("POST", `/rpc/${fn}`, args); return { data: r.data, error: null }; }
  catch (e) { return { data: null, error: { message: e instanceof ApiError ? e.code : "request_failed" } }; }
}
export const db = { rpc };

// ---- Cart (stored and decided by the backend) ----
export interface CartLineView { sku: string | null; bundle: string | null; qty: number; name: string | null; unit_paise: number | null; max_qty: number; ok: boolean }
export interface CartView { lines: CartLineView[]; count: number; subtotal_paise: number; capped?: boolean; offer_discount_paise?: number; after_offers_paise?: number; offer_labels?: string[]; offers_block_coupon?: boolean }
export type LineRef = { sku?: string; bundle?: string };
export const cartApi = {
  get: () => request<CartView>("GET", "/cart", undefined, { guest: true }),
  add: (l: LineRef, qty: number) => request<CartView>("POST", "/cart/items", { ...l, qty }, { guest: true }),
  setQty: (l: LineRef, qty: number) => request<CartView>("PATCH", "/cart/items", { ...l, qty }, { guest: true }),
  remove: (l: LineRef) => request<CartView>("DELETE", "/cart/items", l, { guest: true }),
  clear: () => request<CartView>("DELETE", "/cart", undefined, { guest: true }),
  merge: async () => {
    const g = guestToken();
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;
    const res = await fetch(`${env.apiBase}/cart/merge`, { method: "POST", headers: { authorization: `Bearer ${data.session.access_token}`, "x-cart-token": g, "content-type": "application/json" }, body: "{}" });
    return res.ok ? ((await res.json()) as CartView) : null;
  },
};

// ---- Staff media upload: the backend hands out a signed URL, the browser sends the file to it ----
export async function uploadMedia(file: File, poster = false): Promise<string> {
  const r = await request<{ signed_url: string; path: string }>("POST", "/admin/media/upload-url", { content_type: file.type, poster });
  const form = new FormData(); form.append("cacheControl", "3600"); form.append("", file);
  const put = await fetch(r.signed_url, { method: "PUT", body: form });
  if (!put.ok) throw new ApiError("upload_failed", put.status);
  return r.path;
}
// Only identifiers and the address are sent. Prices, tax and totals are computed by the backend.
export const checkoutLaunch = (launch_code: string, sku: string, address: Address) => post<CheckoutResult>("/checkout/launch", { launch_code, sku, address });
// The cart lives on the backend, so checkout sends no items.
export const checkoutRetail = (address: Address, coupon?: string) => post<CheckoutResult>("/checkout/retail", { address, coupon });
export const refundOrder = (orderId: string, reason: string) => post<{ ok: true }>(`/admin/orders/${orderId}/refund`, { reason });

export const ERROR_TEXT: Record<string, string> = {
  unauthorized: "Please sign in again.", empty_cart: "Your cart is empty.", cart_full: "Your cart is full. Remove something first.", invalid_item: "That item is not available.", closed: "This launch is fully allocated.", no_reservation: "Your hold on a place has expired. Please start again.",
  launch_only: "This product is available only on its launch page.", out_of_stock: "Sorry, that item is out of stock.",
  invalid_address: "Please check your address.", invalid_coupon: "That coupon is not valid.", invalid_items: "Something in your cart is no longer available.", invalid_request: "Please check the details you entered.",
  payment_unavailable: "Payments are temporarily unavailable. Please try again shortly.", payments_not_configured: "Payments are not open yet. Please check back soon.",
};
export const errorText = (e: unknown) => (e instanceof ApiError ? ERROR_TEXT[e.code] ?? "Something went wrong. Please try again." : "Something went wrong. Please try again.");
