import { HappeningsGallery } from "@/components/happenings/HappeningsGallery";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { getSiteContent } from "@/services/contentService";

export default async function EventsPage({
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

  const copy = site.pages.happenings ?? {
    title: dict.nav.events,
    intro:
      loc === "ar"
        ? "استكشف فعالياتنا القادمة والحالية."
        : "Explore our upcoming and current events.",
  };

  return (
    <HappeningsGallery
      locale={loc}
      title={copy.title}
      intro={copy.intro}
      items={site.happeningsGallery ?? []}
      viewDetailsLabel={dict.eventsSection.viewDetails}
    />
  );
}
