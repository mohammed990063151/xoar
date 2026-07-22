import type { Metadata } from "next";
import { PartnersPageView } from "@/components/partners/PartnersPageView";
import { isLocale } from "@/lib/i18n";
import { getPartnersPageContent } from "@/lib/site-page";
import { pageMetadata } from "@/lib/seo-service";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) return {};
  return pageMetadata("partners", loc, `/${loc}/partners`);
}

export default async function PartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();

  const content = await getPartnersPageContent(loc);

  return <PartnersPageView locale={loc} content={content} />;
}
