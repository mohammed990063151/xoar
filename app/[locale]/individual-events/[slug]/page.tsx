import type { Metadata } from "next";
import { EventOfferingDetailView } from "@/components/events/EventOfferingDetailView";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo-service";
import { eventOfferingService } from "@/services/eventOfferingService";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: loc, slug } = await params;
  if (!isLocale(loc)) return {};
  const offering = await eventOfferingService.get(loc, slug, "individual");
  if (!offering) return {};
  return pageMetadata("individual-events.detail", loc, `/${loc}/individual-events/${slug}`, {
    title: offering.title,
    description: offering.description ?? "",
  });
}

export default async function IndividualEventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc, slug } = await params;
  if (!isLocale(loc)) notFound();
  const offering = await eventOfferingService.get(loc, slug, "individual");
  if (!offering) notFound();

  return (
    <EventOfferingDetailView locale={loc} audience="individual" offering={offering} />
  );
}
