import type { MetadataRoute } from "next";
import { SITE_CONFIGURED, SITE_URL } from "../site";

/** Private and utility areas. Search engines should never crawl these. */
export const PRIVATE_PATHS = ["/admin", "/account", "/cart", "/checkout", "/api", "/auth", "/access-denied"];

export function buildRobots(base = SITE_URL, configured = SITE_CONFIGURED): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE_PATHS }],
    // Until the real domain is set, pages carry noindex and the sitemap is not advertised.
    ...(configured ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}

