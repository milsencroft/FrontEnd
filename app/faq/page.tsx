import { NOINDEX_FOLLOW, pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/PageHero";
// Answers are not published yet, so the page is thin: keep it out of the index until they are.
export const metadata = pageMetadata({
  title: "FAQ", path: "/faq", robots: NOINDEX_FOLLOW,
  description: "Frequently asked questions about Milsen & Croft fragrances, orders and delivery.",
});
export default function Faq() {
  return (
    <>
    <PageHero title="FAQ" tone="japan" />
    <section className="wrap py-20">
      <p className="mt-8 text-lg text-charcoal/80">Answers will be published here before we open for sales. In the meantime, write to <a className="underline underline-offset-4" href="mailto:milsencroft@gmail.com">milsencroft@gmail.com</a>.</p>
    </section>
    </>
  );
}
