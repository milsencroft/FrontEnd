import { PageBody } from "@/components/PageBody";
export const dynamicParams = true;
export function generateStaticParams() { return []; }
export default function Entry({ params }: { params: { slug: string } }) { return <PageBody slug={params.slug} kind="journal" />; }
