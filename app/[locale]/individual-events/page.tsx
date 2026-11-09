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
    "individual-events",
    loc,
    `/${loc}/individual-events`,
    undefined,
    {
      title: loc === "ar" ? "فعاليات الأفراد | اكزورا" : "Individual events | Xora",
      description:
        loc === "ar"
          ? "فعاليات أفراد جاهزة للحجز — تواريخ وباقات ودفع فوري."
          : "Bookable individual events — dates, packages, and instant payment.",
    },
  );
}

export default async function IndividualEventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const dict = getDictionary(loc);
  const [offerings, equipmentItems] = await Promise.all([
    eventOfferingService.list(loc, "individual"),
    equipmentOfferingService.list(loc, "individual", 8),
  ]);

  return (
    <EventOfferingsCatalog
      locale={loc}
      audience="individual"
      offerings={offerings}
      copy={dict.pages.individualEvents}
      equipmentItems={equipmentItems}
    />
  );
}
