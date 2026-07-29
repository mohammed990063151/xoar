import type { Metadata } from "next";
import { NationalDayPageView } from "@/components/national-day/NationalDayPageView";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import { getNationalDayPageContent } from "@/lib/site-page";
import { pageMetadata } from "@/lib/seo-service";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) return {};
  const dict = getDictionary(loc);
  return pageMetadata("national-day", loc, `/${loc}/national-day`, undefined, {
    title: dict.pages.nationalDay.title,
    description: dict.pages.nationalDay.intro,
  });
}

export default async function NationalDayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();

  const [content, dict] = await Promise.all([
    getNationalDayPageContent(loc),
    Promise.resolve(getDictionary(loc)),
  ]);

  return (
    <NationalDayPageView
      locale={loc}
      content={content}
      brandName={dict.brand.name}
    />
  );
}
