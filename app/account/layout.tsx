import type { ReactNode } from "react";
import { noindexMetadata } from "@/lib/seo/metadata";

// Private area: never indexed, links not followed.
export const metadata = noindexMetadata("Your account");
export default function Layout({ children }: { children: ReactNode }) { return children; }
