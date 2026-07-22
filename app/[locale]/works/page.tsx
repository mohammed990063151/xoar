import type { Metadata } from "next";
import { WorksPortfolio } from "@/components/works/WorksPortfolio";
import { getDictionary } from "@/lib/dictionary";
import { getSiteContent } from "@/services/contentService";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo-service";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) return {};
  return pageMetadata("works", loc, `/${loc}/works`);
}

export default async function WorksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const [site, dict] = await Promise.all([
    getSiteContent(loc),
    Promise.resolve(getDictionary(loc)),
  ]);

  const copy = site.pages.works;

  return (
    <WorksPortfolio
      locale={loc}
      title={copy.title}
      intro={copy.intro}
      items={site.eventsGallery}
      viewDetailsLabel={dict.eventsSection.viewDetails}
    />
  );
}
