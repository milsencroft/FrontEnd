// Public site identity and URL helpers. Nothing secret lives here.

/** Placeholder origin used only until NEXT_PUBLIC_SITE_URL is set. While it is in use every page is noindex. */
export const PLACEHOLDER_SITE = "https://front-end-delta-two-74.vercel.app";

export const SITE_NAME = "Milsen & Croft";
export const TAGLINE = "A sense of place. A lasting impression.";
export const DEFAULT_DESCRIPTION =
  "Milsen & Croft is an independent fragrance house in Kerala, India. Each fragrance begins with a place and is made in a limited run.";
export const CONTACT_EMAIL = "milsencroft@gmail.com";

/** Turns the env value into a clean origin, or reports that no usable production domain has been configured. */
export function resolveSite(raw: string | undefined): { url: string; configured: boolean } {
  const v = (raw ?? "").trim();
  if (v) {
    try {
      const u = new URL(v);
      if (u.protocol === "https:" || u.protocol === "http:") return { url: u.origin, configured: true };
    } catch { /* fall through to the placeholder */ }
  }
  return { url: PLACEHOLDER_SITE, configured: false };
}

const site = resolveSite(process.env.NEXT_PUBLIC_SITE_URL);
export const SITE_URL = site.url;
/** False until the owner sets NEXT_PUBLIC_SITE_URL to the real domain. Search engines are told not to index meanwhile. */
export const SITE_CONFIGURED = site.configured;

export const absoluteUrl = (path = "/", base = SITE_URL) => new URL(path.startsWith("/") ? path : `/${path}`, base).toString();
