import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Launch Pre-order", path: "/launch",
  description: "Reserve a place in the Milsen & Croft launch. One combined limited allocation, one place per customer, with live progress on how many remain.",
});
export default function Layout({ children }: { children: ReactNode }) { return children; }
