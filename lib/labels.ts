// Plain-language names for the internal values the backend uses. Screens show these, never the raw values.
export const LAUNCH_LABEL: Record<string, string> = {
  draft: "Draft", pending_approval: "Waiting for approval", preorder_active: "Pre-order open", paused: "Paused", closed: "Closed (fully allocated)",
  post_launch_review: "Reviewing results", published_in_shop: "Now in the shop", completed: "Completed", postponed: "Postponed", cancelled: "Cancelled", archived: "Archived",
};
export const PRODUCT_LABEL: Record<string, string> = { concept: "Concept (not public)", draft: "Draft", approved: "Approved", published: "Published", archived: "Archived" };
export const PAGE_LABEL: Record<string, string> = { draft: "Draft", published: "Published", archived: "Archived" };
export const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super Admin", admin: "Admin", product_manager: "Product manager", order_manager: "Order manager", content_manager: "Content manager", customer_support: "Customer support",
};
export const MEMBERSHIP_LABEL: Record<string, string> = { active: "Active", lapsed: "Lapsed", cancelled: "Cancelled", paused: "Paused", ended: "Ended" };
export const REFUND_LABEL: Record<string, string> = { pending: "In progress", processed: "Refunded", failed: "Failed" };
export const HISTORY_KIND_LABEL: Record<string, string> = { payment: "Payment", fulfilment: "Order" };
export const CHANNEL_LABEL: Record<string, string> = { email: "email", whatsapp: "WhatsApp", staff_alert: "staff alert", google_chat: "Google Chat" };
export const SOURCE_LABEL: Record<string, string> = { footer: "Website footer", website: "Website" };

/** Fallback for any value without a name above: "post_launch_review" becomes "Post launch review". */
export const human = (v: unknown): string => {
  const s = String(v ?? "").replace(/[_-]+/g, " ").trim();
  return s ? s[0].toUpperCase() + s.slice(1) : "";
};
export const label = (map: Record<string, string>, v: unknown) => map[String(v)] ?? human(v);

/** Messages for backend error codes that have no screen-specific wording. */
const ERROR_TEXT: Record<string, string> = {
  reason_required: "Please add a reason.", forbidden: "You do not have permission to do this.", not_found: "That item was not found.", invalid_input: "Please check the details and try again.",
  rate_limited: "Too many attempts. Please wait a moment and try again.", invalid_email: "Enter a valid email address.", unauthorized: "Please sign in again.",
  invalid_range: "Choose a start date before the end date.", limit_reached: "You have reached the limit.",
};
export const errorText = (code: string | undefined | null, fallback = "Something went wrong. Please try again.") => (code && ERROR_TEXT[code]) || fallback;
