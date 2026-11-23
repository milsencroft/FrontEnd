import { PageHero } from "@/components/PageHero";
export const metadata = { title: "FAQ · Milsen & Croft" };
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
