import { Achievements } from "@/components/home/Achievements";
import { EntertainmentShowcase } from "@/components/home/EntertainmentShowcase";
import { HeroSection } from "@/components/home/HeroSection";
import { ServiceStrip } from "@/components/home/ServiceStrip";
import { getSiteContent } from "@/services/contentService";
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
  const dict = await getSiteContent(locale);

  return (
    <>
      <HeroSection locale={locale} hero={dict.hero} />
      <ServiceStrip data={dict.servicesStrip} />
      <EntertainmentShowcase
        section={dict.entertainmentSection}
        activityCards={dict.activityCards}
        bookCta={dict.eventsSection.book}
        formTitle={dict.inquiryForm.defaultTitle}
      />
      <Achievements data={dict.achievements} />
    </>
  );
}
