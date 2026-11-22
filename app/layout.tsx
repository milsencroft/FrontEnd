import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SessionProvider } from "@/lib/session";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = { title: "Milsen & Croft", description: "A sense of place. A lasting impression." };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en"><body>
      <SessionProvider><CartProvider><Header /><main>{children}</main><Footer /></CartProvider></SessionProvider>
    </body></html>
  );
}
