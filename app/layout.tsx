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

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://front-end-delta-two-74.vercel.app";
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Milsen & Croft", template: "%s" },
  description: "A sense of place. A lasting impression. An independent fragrance house based in Kerala.",
  applicationName: "Milsen & Croft",
  openGraph: { title: "Milsen & Croft", description: "A sense of place. A lasting impression.", siteName: "Milsen & Croft", type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image", title: "Milsen & Croft", description: "A sense of place. A lasting impression." },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "light dark", themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F7F3EB" }, { media: "(prefers-color-scheme: dark)", color: "#12100D" }] };
const THEME_SCRIPT = `try{var t=localStorage.getItem("mc_theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}try{if(sessionStorage.getItem("mc_splash"))document.documentElement.setAttribute("data-splash","done");else sessionStorage.setItem("mc_splash","1")}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head><body><Splash /><NavProgress /><ScrollEffects /><ScrollVideo />
      <SessionProvider><CartProvider><Header /><main>{children}</main><Footer /></CartProvider></SessionProvider>
    </body></html>
  );
}
