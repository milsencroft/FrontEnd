import { pageMetadata } from "@/lib/seo/metadata";
import { PageHero } from "@/components/PageHero";
export const metadata = pageMetadata({
  title: "Contact", path: "/contact",
  description: "Write to Milsen & Croft, an independent fragrance house in Kerala, India. We read every message.",
});
export default function Contact() {
  return (
    <>
    <PageHero title="Contact" tone="noir" />
    <section className="wrap py-20">
      <p className="mt-8 text-lg">Write to us at <a className="underline underline-offset-4" href="mailto:milsencroft@gmail.com">milsencroft@gmail.com</a>.</p>
      <p className="mt-3 text-charcoal/70">Milsen &amp; Croft, Kerala, India.</p>
    </section>
    </>
  );
}
