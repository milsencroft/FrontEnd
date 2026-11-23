import Link from "next/link";
import { noindexMetadata } from "@/lib/seo/metadata";

export const metadata = noindexMetadata("Access denied");
export default function AccessDenied() {
  return <div className="wrap py-24"><h1 className="text-4xl">Access denied</h1><p className="mt-4">We could not sign you in, or you do not have permission to view that page.</p><Link className="btn mt-8" href="/">Back home</Link></div>;
}
