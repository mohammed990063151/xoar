import type { Metadata } from "next";
import { EventRequestPageView } from "@/components/events/EventRequestPageView";
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
  return pageMetadata("request-event", loc, `/${loc}/request-event`);
}

export default async function RequestEventPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const dict = getDictionary(loc);

  return <EventRequestPageView locale={loc} copy={dict.pages.requestEvent} />;
}
