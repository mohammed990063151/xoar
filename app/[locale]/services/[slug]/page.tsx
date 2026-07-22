import type { Metadata } from "next";
import { ServiceDetailView } from "@/components/services/ServiceDetailView";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo-service";
import { notFound } from "next/navigation";
import { getServiceBySlug, getSiteContent } from "@/services/contentService";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: loc, slug } = await params;
  if (!isLocale(loc)) return {};
  const item = await getServiceBySlug(loc, slug);
  if (!item) return {};
  return pageMetadata("services.detail", loc, `/${loc}/services/${slug}`, {
    title: item.title,
    description: item.description,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc, slug } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;

  const [dict, site, item] = await Promise.all([
    Promise.resolve(getDictionary(locale)),
    getSiteContent(locale),
    getServiceBySlug(locale, slug),
  ]);

  if (!item) notFound();

  return (
    <ServiceDetailView
      locale={locale}
      item={item}
      backLabel={site.pages.services.title}
      bookLabel={site.eventsSection.book}
      relatedLabel={locale === "ar" ? "خدمات أخرى" : "More services"}
      highlightsLabel={locale === "ar" ? "ماذا تشمل" : "What’s included"}
      contactCta={dict.nav.cta}
    />
  );
}
