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
import { ScrollEffects } from "@/components/ScrollEffects";
import { DEFAULT_DESCRIPTION, SITE_CONFIGURED, SITE_NAME, SITE_URL, TAGLINE } from "@/lib/site";
import { NOINDEX } from "@/lib/seo/metadata";
import { env } from "@/lib/env";

const FONTS = "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Jost:wght@300;400;500&display=swap";

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
export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "light dark", themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F7F3EB" }, { media: "(prefers-color-scheme: dark)", color: "#12100D" }] };
const THEME_SCRIPT = `try{var t=localStorage.getItem("mc_theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}try{if(sessionStorage.getItem("mc_splash"))document.documentElement.setAttribute("data-splash","done");else sessionStorage.setItem("mc_splash","1")}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" suppressHydrationWarning><head>
      <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      {/* Fonts load from the head (not a CSS @import) so they start sooner; display=swap keeps text visible meanwhile. */}
      <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      {env.supabaseUrl && <link rel="preconnect" href={env.supabaseUrl} crossOrigin="" />}
      <link rel="stylesheet" href={FONTS} />
    </head><body><Splash /><NavProgress /><ScrollEffects /><ScrollVideo />
      <SessionProvider><CartProvider><Header /><main>{children}</main><Footer /></CartProvider></SessionProvider>
    </body></html>
  );
}
