import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SessionProvider } from "@/lib/session";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NavProgress } from "@/components/NavProgress";
import { Splash } from "@/components/Splash";
import { ScrollVideo } from "@/components/ScrollVideo";
import { Cursor } from "@/components/Cursor";
import { Motion } from "@/components/Motion";
import { ScrollEffects } from "@/components/ScrollEffects";
import { DEFAULT_DESCRIPTION, SITE_CONFIGURED, SITE_NAME, SITE_URL, TAGLINE } from "@/lib/site";
import { NOINDEX } from "@/lib/seo/metadata";
import { env } from "@/lib/env";

const FONTS = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Jost:wght@400;500&display=swap";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | ${TAGLINE}`, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  // Until NEXT_PUBLIC_SITE_URL names the real domain, keep every page out of search results.
  ...(SITE_CONFIGURED ? {} : { robots: NOINDEX }),
  openGraph: { title: SITE_NAME, description: TAGLINE, siteName: SITE_NAME, type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image", title: SITE_NAME, description: TAGLINE },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "dark", themeColor: "#12100D" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" data-theme="dark" suppressHydrationWarning><head>
      {/* Fonts load from the head (not a CSS @import) so they start sooner; display=swap keeps text visible meanwhile. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {env.supabaseUrl && <link rel="preconnect" href={env.supabaseUrl} crossOrigin="" />}
      <link rel="stylesheet" href={FONTS} />
    </head><body><Splash /><NavProgress /><ScrollEffects /><Motion /><Cursor /><ScrollVideo />
      <SessionProvider><CartProvider><Header /><main>{children}</main><Footer /></CartProvider></SessionProvider>
    </body></html>
  );
}
