import type { ReactNode } from "react";
import { noindexMetadata } from "@/lib/seo/metadata";
import { AdminShell } from "@/components/admin/AdminShell";

// Private area: never indexed, links not followed.
export const metadata = noindexMetadata("Admin");
export default function Layout({ children }: { children: ReactNode }) { return <AdminShell>{children}</AdminShell>; }
