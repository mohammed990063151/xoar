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
    "individual-events",
    loc,
    `/${loc}/individual-events`,
    undefined,
    {
      title: loc === "ar" ? "فعاليات الأفراد | اكزورا" : "Individual events | Xora",
      description:
        loc === "ar"
          ? "اختر نوع المناسبة ثم المناسبة والباقة. الباقات الجاهزة للدفع مباشرة، و«أخرى» لكتابة احتياجاتك وإرسال طلب."
          : "Pick event type, occasion, and package. Ready packages go to payment; Other lets you describe needs and send a request.",
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
  const offerings = await eventOfferingService.list(loc, "individual", 48);

  return (
    <EventConfiguratorForm
      locale={loc}
      audience="individual"
      offerings={offerings}
      copy={dict.pages.requestEvent}
      page={dict.pages.individualEvents}
    />
  );
}
