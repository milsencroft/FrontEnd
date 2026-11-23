import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SessionProvider } from "@/lib/session";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollEffects } from "@/components/ScrollEffects";

export const metadata: Metadata = { title: "Milsen & Croft", description: "A sense of place. A lasting impression." };
export const viewport: Viewport = { width: "device-width", initialScale: 1, colorScheme: "light dark" };
const THEME_SCRIPT = `try{var t=localStorage.getItem("mc_theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head><body><ScrollEffects />
      <SessionProvider><CartProvider><Header /><main>{children}</main><Footer /></CartProvider></SessionProvider>
    </body></html>
  );
}
