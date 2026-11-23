import type { MetadataRoute } from "next";
import { fetchCatalogue, fetchPageList } from "@/lib/seo/data";
import { buildSitemap } from "@/lib/seo/sitemap";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalogue, journal, legal] = await Promise.all([fetchCatalogue(), fetchPageList("journal"), fetchPageList("legal")]);
  return buildSitemap({ catalogue, journal, legal });
}
