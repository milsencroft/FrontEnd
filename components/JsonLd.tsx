import { serializeLd } from "@/lib/seo/jsonld";

/** Structured data for search engines. Renders in the server HTML. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeLd(data) }} />;
}
