import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { fetchCatalogue, fetchLaunchOpen, fetchPageList } from "@/lib/seo/data";
import { buildSitemap } from "@/lib/seo/sitemap";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalogue, journal, legal, launchOpen] = await Promise.all([fetchCatalogue(), fetchPageList("journal"), fetchPageList("legal"), fetchLaunchOpen(env.currentLaunch)]);
  return buildSitemap({ catalogue, journal, legal, launchOpen });
}
