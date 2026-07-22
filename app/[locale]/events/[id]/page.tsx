import type { Metadata } from "next";
import { HappeningDetailView } from "@/components/happenings/HappeningDetailView";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo-service";
import { notFound } from "next/navigation";
import { getHappeningBySlug, getSiteContent } from "@/services/contentService";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale: loc, id } = await params;
  if (!isLocale(loc)) return {};
  const item = await getHappeningBySlug(loc, id);
  if (!item) return {};
  return pageMetadata("events.detail", loc, `/${loc}/events/${id}`, {
    title: item.title,
    description: item.description,
  });
}

export default async function HappeningDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc, id } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;

  const [site, dict, item] = await Promise.all([
    getSiteContent(locale),
    Promise.resolve(getDictionary(locale)),
    getHappeningBySlug(locale, id),
  ]);

  if (!item) notFound();

  const title =
    site.pages.happenings?.title ??
    dict.nav.events ??
    (locale === "ar" ? "فعالياتنا" : "Our events");

  return (
    <HappeningDetailView
      locale={locale}
      item={item}
      backLabel={title}
      bookLabel={dict.eventsSection.book}
      relatedLabel={locale === "ar" ? "فعاليات أخرى" : "More events"}
      highlightsLabel={locale === "ar" ? "أبرز التفاصيل" : "Highlights"}
    />
  );
}
