import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo/metadata";

// Entries set their own metadata in [slug]/page.tsx.
export const metadata = pageMetadata({
  title: "Journal", path: "/journal",
  description: "Stories from the places behind Milsen & Croft fragrances, published as each region is explored.",
});
export default function Layout({ children }: { children: ReactNode }) { return children; }
