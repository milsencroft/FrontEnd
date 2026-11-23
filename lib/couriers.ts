export interface Courier { name: string; url_template: string | null; is_active: boolean }

/** Builds a tracking link from a courier's saved template. Returns null when no template is saved. */
export const trackingLink = (couriers: Courier[], courier: string | null | undefined, tracking: string | null | undefined): string | null => {
  const t = couriers.find((c) => c.is_active && c.name.toLowerCase() === (courier ?? "").trim().toLowerCase())?.url_template;
  const n = (tracking ?? "").trim();
  return t && n ? t.replace("{tracking}", encodeURIComponent(n)) : null;
};

export const shipMessage = (o: { name: string; order: string; courier?: string | null; tracking?: string | null; link?: string | null; eta?: string | null }) =>
  `Hello ${o.name || "there"}, your Milsen & Croft order ${o.order} has shipped${o.courier ? ` with ${o.courier}` : ""}.` +
  `${o.tracking ? ` Tracking number: ${o.tracking}.` : ""}${o.link ? ` Track it here: ${o.link}` : ""}${o.eta ? ` Estimated delivery: ${o.eta}.` : ""} Thank you for choosing Milsen & Croft.`;

/** WhatsApp click-to-chat link. Indian 10-digit numbers get the 91 country code. Returns null for numbers that cannot be used. */
export const whatsappLink = (phone: string | null | undefined, text: string): string | null => {
  const d = (phone ?? "").replace(/\D/g, "");
  const full = d.length === 10 ? `91${d}` : d.length >= 11 && d.length <= 15 ? d : null;
  return full ? `https://wa.me/${full}?text=${encodeURIComponent(text)}` : null;
};
