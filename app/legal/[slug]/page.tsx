import { notFound } from "next/navigation";
const TITLES: Record<string, string> = { privacy: "Privacy Policy", terms: "Terms of Sale", shipping: "Shipping Policy", returns: "Returns & Refunds" };
export function generateStaticParams() { return Object.keys(TITLES).map((slug) => ({ slug })); }
export default function Legal({ params }: { params: { slug: string } }) {
  const title = TITLES[params.slug]; if (!title) notFound();
  // Policy wording must be supplied and approved by the business (and legal advice); none is invented here.
  return <article className="wrap max-w-2xl py-16"><h1 className="text-4xl">{title}</h1><p className="mt-6 text-charcoal/70">This policy will be published here before we open for sales.</p></article>;
}
