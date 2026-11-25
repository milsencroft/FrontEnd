export interface AdminItem { href: string; label: string; art: string; perm: string | null; blurb: string }
export interface AdminGroup { title: string; items: AdminItem[] }

/** One place that lists every admin section, who may see it, and what it is for. */
export const ADMIN_GROUPS: AdminGroup[] = [
  { title: "Sell", items: [
    { href: "/admin/orders", label: "Orders", art: "orders", perm: "orders.view", blurb: "Find orders, pack them and track delivery." },
    { href: "/admin/catalogue", label: "Catalogue", art: "catalogue", perm: "catalog.manage", blurb: "Fragrances, sizes and prices." },
    { href: "/admin/stock", label: "Stock", art: "stock", perm: "inventory.view", blurb: "What is on the shelf and what is running low." },
    { href: "/admin/offers", label: "Offers", art: "coupons", perm: "coupons.manage", blurb: "Buy 1 get 1, clearance sales and member offers that apply by themselves." },
    { href: "/admin/coupons", label: "Coupons", art: "coupons", perm: "coupons.manage", blurb: "Discount codes customers type in." },
    { href: "/admin/couriers", label: "Couriers", art: "couriers", perm: "orders.manage", blurb: "Delivery partners and tracking links." },
  ] },
  { title: "Launch", items: [
    { href: "/admin/launches", label: "Launches", art: "launches", perm: "launches.manage", blurb: "Open, pause or close a launch and set its capacity." },
    { href: "/admin/society", label: "Society", art: "society", perm: "society.manage", blurb: "Members, tiers and caps." },
  ] },
  { title: "Brand", items: [
    { href: "/admin/media", label: "Media", art: "media", perm: "media.manage", blurb: "Photos and films used across the site." },
    { href: "/admin/content", label: "Content", art: "content", perm: "content.manage", blurb: "Stories, legal pages and site text." },
    { href: "/admin/newsletter", label: "Newsletter", art: "newsletter", perm: "newsletter.manage", blurb: "People who asked to hear from us." },
  ] },
  { title: "Insight", items: [
    { href: "/admin/reports", label: "Reports", art: "reports", perm: "payments.view", blurb: "Sales and payments at a glance." },
    { href: "/admin/notifications", label: "Notifications", art: "notifications", perm: "notifications.view", blurb: "Messages sent to customers and any that failed." },
  ] },
  { title: "Manage", items: [
    { href: "/admin/settings", label: "Settings", art: "settings", perm: "settings.manage", blurb: "Tax and other business settings." },
    { href: "/admin/staff", label: "Staff", art: "staff", perm: "staff.manage", blurb: "Who can sign in to the admin and what they can do." },
  ] },
];
