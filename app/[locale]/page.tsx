import { Achievements } from "@/components/home/Achievements";
import { HeroImageGallery } from "@/components/home/HeroImageGallery";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeAmbientMotion } from "@/components/home/HomeAmbientMotion";
import { HomeContactSection } from "@/components/home/HomeContactSection";
import { PartnersMarquee } from "@/components/home/PartnersMarquee";
import { EntertainmentActivitiesSection } from "@/components/home/EntertainmentActivitiesSection";
import { WorksShowcase } from "@/components/home/WorksShowcase";
import { getDictionary } from "@/lib/dictionary";
import { getHomeContent } from "@/lib/home-content";
import { getSiteContent } from "@/services/contentService";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";

/** Always read CMS from Laravel — never cache a static snapshot from build time. */
export const dynamic = "force-dynamic";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const locale = loc as Locale;
  const dict = getDictionary(locale);
  const [home, site] = await Promise.all([getHomeContent(locale), getSiteContent(locale)]);

  return (
    <div className="relative overflow-x-hidden">
      <HomeAmbientMotion locale={locale} />
      <HeroSection locale={locale} hero={home.hero} />
      <HeroImageGallery
        locale={locale}
        images={home.galleryImages}
        copy={home.heroGallery}
      />
      <EntertainmentActivitiesSection
        locale={locale}
        section={home.entertainmentActivitiesSection}
        activities={home.entertainmentActivities}
        bookCta={dict.eventsSection.book}
      />
      <WorksShowcase
        locale={locale}
        section={home.worksSection}
        works={home.works}
        viewDetailsLabel={dict.eventsSection.viewDetails}
        viewAllWorksLabel={locale === "ar" ? "عرض كل الأعمال" : "View all works"}
      />
      <PartnersMarquee
        locale={locale}
        section={home.partnersSection}
        partners={home.partners}
      />
      <HomeContactSection
        locale={locale}
        eyebrow={home.homeContact.eyebrow}
        title={home.homeContact.title}
        subtitle={home.homeContact.subtitle}
        formCopy={site.pages?.contact ?? dict.pages.contact}
        whatsapp={site.settings?.whatsapp}
      />
      <Achievements data={home.achievements} />
    </div>
  );
}
