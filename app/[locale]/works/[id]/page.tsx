import { EventDetailView } from "@/components/events/EventDetailView";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { getEventBySlug, getSiteContent } from "@/services/contentService";

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc, id } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;
  const [dict, item] = await Promise.all([
    getSiteContent(locale),
    getEventBySlug(locale, id),
  ]);
  if (!item) notFound();

  const worksCopy = dict.pages.works ?? dict.pages.events;

  return (
    <EventDetailView
      locale={locale}
      item={item}
      backLabel={worksCopy.title}
      backHref="/works"
      bookLabel={dict.eventsSection.book}
      relatedLabel={locale === "ar" ? "أعمال مشابهة" : "Related work"}
      highlightsLabel={locale === "ar" ? "أبرز ما قُدّم" : "Highlights"}
      galleryLabel={locale === "ar" ? "صورة" : "Image"}
      relatedBase="/works"
    />
  );
}
