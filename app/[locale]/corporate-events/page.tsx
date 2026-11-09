import type { Metadata } from "next";
import { EventOfferingsCatalog } from "@/components/events/EventOfferingsCatalog";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo-service";
import { equipmentOfferingService } from "@/services/equipmentOfferingService";
import { eventOfferingService } from "@/services/eventOfferingService";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) return {};
  return pageMetadata(
    "corporate-events",
    loc,
    `/${loc}/corporate-events`,
    undefined,
    {
      title: loc === "ar" ? "فعاليات الشركات | اكزورا" : "Corporate events | Xora",
      description:
        loc === "ar"
          ? "فعاليات شركات جاهزة للحجز — تواريخ وباقات ودفع فوري."
          : "Bookable corporate events — dates, packages, and instant payment.",
    },
  );
}

export default async function CorporateEventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const dict = getDictionary(loc);
  const [offerings, equipmentItems] = await Promise.all([
    eventOfferingService.list(loc, "corporate"),
    equipmentOfferingService.list(loc, "corporate", 8),
  ]);

  return (
    <EventOfferingsCatalog
      locale={loc}
      audience="corporate"
      offerings={offerings}
      copy={dict.pages.corporateEvents}
      equipmentItems={equipmentItems}
    />
  );
}
