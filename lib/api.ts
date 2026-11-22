import { env } from "./env";
import { supabase } from "./supabase";

export interface Address { name: string; phone: string; line1: string; line2?: string; city: string; state_code: string; pincode: string }
export interface CheckoutResult { order_id: string; order_number: string; amount_paise: number; currency: "INR"; razorpay_order_id: string; razorpay_key_id: string }
export class ApiError extends Error { constructor(public code: string, public status: number) { super(code); } }

async function post<T>(path: string, body: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(`${env.apiBase}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(json.error ?? "request_failed", res.status);
  return json as T;
}
// Only identifiers and the address are sent. Prices, tax and totals are computed by the backend.
export const checkoutLaunch = (launch_code: string, sku: string, address: Address) => post<CheckoutResult>("/checkout/launch", { launch_code, sku, address });
export const checkoutRetail = (items: { sku?: string; bundle?: string; qty: number }[], address: Address, coupon?: string) => post<CheckoutResult>("/checkout/retail", { items, address, coupon });
export const refundOrder = (orderId: string, reason: string) => post<{ ok: true }>(`/admin/orders/${orderId}/refund`, { reason });

export const ERROR_TEXT: Record<string, string> = {
  unauthorized: "Please sign in again.", closed: "This launch is fully allocated.", no_reservation: "Your slot hold has expired. Please start again.",
  launch_only: "This product is available only on its launch page.", out_of_stock: "Sorry, that item just went out of stock.",
  invalid_address: "Please check your address.", invalid_coupon: "That coupon is not valid.", invalid_items: "Something in your cart is no longer available.", invalid_request: "Please check the details you entered.",
  payment_unavailable: "Payments are temporarily unavailable. Please try again shortly.", payments_not_configured: "Payments are not switched on yet.",
};
export const errorText = (e: unknown) => (e instanceof ApiError ? ERROR_TEXT[e.code] ?? "Something went wrong. Please try again." : "Something went wrong. Please try again.");
