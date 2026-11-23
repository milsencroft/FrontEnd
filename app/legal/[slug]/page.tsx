import { PageBody } from "@/components/PageBody";
const TITLES: Record<string, string> = { privacy: "Privacy Policy", terms: "Terms of Sale", shipping: "Shipping Policy", returns: "Returns & Refunds" };
export function generateStaticParams() { return Object.keys(TITLES).map((slug) => ({ slug })); }
export default function Legal({ params }: { params: { slug: string } }) {
  // Policy wording is written by the business in the admin Content editor; until it is published a neutral notice shows.
  return <PageBody slug={params.slug} kind="legal" fallbackTitle={TITLES[params.slug]} />;
}
