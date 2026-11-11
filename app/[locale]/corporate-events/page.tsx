import type { Metadata } from "next";
import { EventConfiguratorForm } from "@/components/events/EventConfiguratorForm";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo-service";
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
          ? "جهّز فعالية شركتك: اختر الفكرة والباقات وأرسل طلبك ليتواصل معك فريق إكزورا."
          : "Prepare your company event: pick a theme and packages, then send your request so Xora can follow up.",
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
  const offerings = await eventOfferingService.list(loc, "corporate", 48);

  return (
    <EventConfiguratorForm
      locale={loc}
      audience="corporate"
      offerings={offerings}
      copy={dict.pages.requestEvent}
      page={dict.pages.corporateEvents}
    />
  );
}
