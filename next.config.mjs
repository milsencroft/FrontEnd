const dev = process.env.NODE_ENV !== "production";
const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://*.supabase.co";

// Content Security Policy: only our own code, Razorpay checkout, Supabase (API + media) and privacy-friendly video embeds.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""} https://checkout.razorpay.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  `img-src 'self' data: blob: ${supabase} https://*.razorpay.com`,
  `media-src 'self' blob: ${supabase}`,
  "font-src 'self' data: https://fonts.gstatic.com",
  `connect-src 'self' ${supabase} https://*.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com${dev ? " ws:" : ""}`,
  "frame-src https://api.razorpay.com https://checkout.razorpay.com https://www.youtube-nocookie.com https://player.vimeo.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(dev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const headers = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://checkout.razorpay.com\")" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

// Private areas are kept out of search results at the HTTP level too, in addition to the page metadata and robots.txt.
// Until NEXT_PUBLIC_SITE_URL names the real domain, the whole site is noindex so a preview address is never indexed.
const siteConfigured = (() => { try { return /^https?:$/.test(new URL((process.env.NEXT_PUBLIC_SITE_URL ?? "").trim()).protocol); } catch { return false; } })();
const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
const privateSources = ["/admin/:path*", "/account/:path*", "/cart", "/checkout/:path*", "/auth/:path*", "/access-denied"];

/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/:path*", headers: siteConfigured ? headers : [...headers, ...noindex] },
      ...(siteConfigured ? privateSources.map((source) => ({ source, headers: noindex })) : []),
    ];
  },
};
