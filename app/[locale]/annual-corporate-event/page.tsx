import type { Metadata } from "next";
import { AnnualCorporateLandingView } from "@/components/landing/AnnualCorporateLandingView";
import { getDictionary } from "@/lib/dictionary";
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

  const dict = getDictionary(loc);
  const copy = dict.pages.annualCorporateEvent;

  return pageMetadata(
    "annual-corporate-event",
    loc,
    `/${loc}/annual-corporate-event`,
    undefined,
    {
      title: `${copy.title} | ${copy.brand}`,
      description: copy.intro,
    },
  );
}

export default async function AnnualCorporateEventPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();

  const dict = getDictionary(loc);

  return (
    <AnnualCorporateLandingView
      locale={loc}
      copy={dict.pages.annualCorporateEvent}
    />
  );
}
