import type { Metadata } from "next";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "../site";

export const NOINDEX: NonNullable<Metadata["robots"]> = { index: false, follow: false, googleBot: { index: false, follow: false } };
/** For thin or utility pages that should not rank but whose links may be followed. */
export const NOINDEX_FOLLOW: NonNullable<Metadata["robots"]> = { index: false, follow: true };

export interface OgImage { url: string; alt: string; width?: number; height?: number }
/** The brand card in app/opengraph-image.png (1200x630). */
export const DEFAULT_OG: OgImage = { url: "/opengraph-image.png", width: 1200, height: 630, alt: "Milsen & Croft monogram beside the words: A sense of place. A lasting impression." };

/** Cuts text to a search-snippet length at a word boundary, collapsing whitespace. */
export function clip(text: string | null | undefined, max = 155): string {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[\s,;:.\-]+$/, "")}…`;
}

interface Opts {
  /** Page title. The root template appends the brand. */
  title: string;
  /** Use as the whole title, without the brand suffix. */
  absoluteTitle?: boolean;
  description?: string;
  /** Path of this page, e.g. "/shop". Becomes the canonical URL. */
  path: string;
  image?: OgImage | null;
  type?: "website" | "article";
  robots?: Metadata["robots"];
}

/** One place that builds title, description, canonical, Open Graph and Twitter so every page stays consistent. */
export function pageMetadata({ title, absoluteTitle, description = DEFAULT_DESCRIPTION, path, image, type = "website", robots }: Opts): Metadata {
  const desc = clip(description, 200);
  const img = image ?? DEFAULT_OG;
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  const images = [{ url: img.url, alt: img.alt, ...(img.width && img.height ? { width: img.width, height: img.height } : {}) }];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    alternates: { canonical: path },
    ...(robots ? { robots } : {}),
    openGraph: { title: fullTitle, description: desc, url: path, siteName: SITE_NAME, type, locale: "en_IN", images },
    twitter: { card: "summary_large_image", title: fullTitle, description: desc, images: [{ url: img.url, alt: img.alt }] },
  };
}

/** Metadata for pages that must stay out of search results (account, admin, cart, sign-in helpers). */
export const noindexMetadata = (title: string): Metadata => ({ title, robots: NOINDEX });
