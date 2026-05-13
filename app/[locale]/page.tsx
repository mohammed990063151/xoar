import { Achievements } from "@/components/home/Achievements";
import { BookingBand } from "@/components/home/BookingBand";
import { EventsShowcase } from "@/components/home/EventsShowcase";
import { HeroSection } from "@/components/home/HeroSection";
import { ServiceStrip } from "@/components/home/ServiceStrip";
import { getDictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc;
  const dict = getDictionary(locale);

  return (
    <>
      <HeroSection locale={locale} hero={dict.hero} />
      <ServiceStrip data={dict.servicesStrip} />
      <EventsShowcase locale={locale} section={dict.eventsSection} />
      <div className="px-4 sm:px-6 lg:px-8">
        <BookingBand locale={locale} booking={dict.booking} />
      </div>
      <Achievements data={dict.achievements} />
    </>
  );
}
