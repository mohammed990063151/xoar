import { WorksPortfolio } from "@/components/works/WorksPortfolio";
import { getDictionary } from "@/lib/dictionary";
import { getSiteContent } from "@/services/contentService";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

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
