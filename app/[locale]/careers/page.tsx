import type { Metadata } from "next";
import { CareersPageView } from "@/components/careers/CareersPageView";
import { isLocale } from "@/lib/i18n";
import { getCareersPageContent } from "@/lib/site-page";
import { pageMetadata } from "@/lib/seo-service";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) return {};
  return pageMetadata("careers", loc, `/${loc}/careers`);
}

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();

  const content = await getCareersPageContent(loc);

  return <CareersPageView locale={loc} content={content} />;
}
