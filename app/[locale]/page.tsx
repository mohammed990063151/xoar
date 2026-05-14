import { Achievements } from "@/components/home/Achievements";
import { EntertainmentShowcase } from "@/components/home/EntertainmentShowcase";
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
      <ServiceStrip locale={locale} data={dict.servicesStrip} />
      <EntertainmentShowcase
        locale={locale}
        section={dict.entertainmentSection}
        bookCta={dict.eventsSection.book}
      />
      <Achievements data={dict.achievements} />
    </>
  );
}
