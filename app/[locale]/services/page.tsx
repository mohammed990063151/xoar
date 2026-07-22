import type { Metadata } from "next";
import { ServicesPageView } from "@/components/services/ServicesPageView";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import { getServicesPageContent } from "@/lib/site-page";
import { pageMetadata } from "@/lib/seo-service";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) return {};
  return pageMetadata("services", loc, `/${loc}/services`);
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();

  const [content, dict] = await Promise.all([
    getServicesPageContent(loc),
    Promise.resolve(getDictionary(loc)),
  ]);

  return (
    <ServicesPageView locale={loc} content={content} contactCta={dict.nav.cta} />
  );
}
