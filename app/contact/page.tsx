import { PageHero } from "@/components/PageHero";
export const metadata = { title: "Contact · Milsen & Croft" };
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
