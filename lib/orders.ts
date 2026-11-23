export const FULFIL_LABEL: Record<string, string> = { unfulfilled: "Received", processing: "Processing", packed: "Ready to ship", shipped: "Shipped", in_transit: "In transit", out_for_delivery: "Out for delivery", delivery_failed: "Delivery failed", delivered: "Delivered", return_requested: "Return requested", returned: "Returned", cancelled: "Cancelled" };
export const PAYMENT_LABEL: Record<string, string> = { created: "Created", pending: "Payment pending", captured: "Confirmed", failed: "Failed", refund_pending: "Refund processing", refunded: "Refunded" };
export const TYPE_LABEL: Record<string, string> = { launch_preorder: "Launch pre-order", regular_retail: "Regular retail" };

/** Buttons offered for each state. This only shapes the UI; the database enforces the real transitions. */
export const NEXT_ACTIONS: Record<string, { to: string; label: string }[]> = {
  unfulfilled: [{ to: "processing", label: "Start processing" }],
  processing: [{ to: "packed", label: "Mark ready to ship" }],
  packed: [{ to: "shipped", label: "Mark as shipped" }],
  shipped: [{ to: "in_transit", label: "Mark in transit" }, { to: "out_for_delivery", label: "Mark out for delivery" }, { to: "delivered", label: "Mark delivered" }, { to: "delivery_failed", label: "Mark delivery failed" }],
  in_transit: [{ to: "out_for_delivery", label: "Mark out for delivery" }, { to: "delivered", label: "Mark delivered" }, { to: "delivery_failed", label: "Mark delivery failed" }],
  out_for_delivery: [{ to: "delivered", label: "Mark delivered" }, { to: "delivery_failed", label: "Mark delivery failed" }],
  delivery_failed: [{ to: "out_for_delivery", label: "Retry delivery" }, { to: "returned", label: "Mark returned" }],
  delivered: [{ to: "return_requested", label: "Start return" }],
  return_requested: [{ to: "returned", label: "Mark returned" }],
};

export const ORDER_ERRORS: Record<string, string> = {
  invalid_transition: "That status change is not allowed from the current status.", tracking_required: "Courier and tracking number are required to ship.",
  not_paid: "The payment has not been confirmed.", refund_required: "Paid orders must be refunded before cancelling.", forbidden: "You do not have permission for this.",
  packing_incomplete: "Tick every item on the packing checklist before marking the order as packed.", not_packing: "The checklist can only be changed while the order is being processed.", invalid_item: "That checklist item does not exist.",
  invalid_tracking_url: "The tracking URL must start with http:// or https://",
};
export const orderError = (m: string) => ORDER_ERRORS[m] ?? "Could not complete that action.";

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => { let s = v == null ? "" : String(v); if (/^[=+\-@]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; }; // blocks spreadsheet formula injection
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}
