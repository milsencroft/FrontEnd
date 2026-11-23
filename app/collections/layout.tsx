import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Collections", path: "/collections",
  description: "Milsen & Croft fragrances grouped by the place that inspired them. The first collection pairs Kerala and Japan.",
});
export default function Layout({ children }: { children: ReactNode }) { return children; }
