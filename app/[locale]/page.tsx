import { Achievements } from "@/components/home/Achievements";
import { HeroImageGallery } from "@/components/home/HeroImageGallery";
import { HeroSection } from "@/components/home/HeroSection";
import { HomePromoBanner } from "@/components/home/HomePromoBanner";
import { HomeAmbientMotion } from "@/components/home/HomeAmbientMotion";
import { HomeContactSection } from "@/components/home/HomeContactSection";
import { PartnersMarquee } from "@/components/home/PartnersMarquee";
import { EntertainmentActivitiesSection } from "@/components/home/EntertainmentActivitiesSection";
import { WorksShowcase } from "@/components/home/WorksShowcase";
import { getDictionary } from "@/lib/dictionary";
import { getHomeContent } from "@/lib/home-content";
import { normalizeActivityFromApi } from "@/lib/activity";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { getSiteContent } from "@/services/contentService";
import { serverFetch } from "@/services/api";
import type { Activity } from "@/types/api";
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
  const [home, site] = await Promise.all([
    getHomeContent(locale),
    getSiteContent(locale),
  ]);

  let entertainmentActivities = home.entertainmentActivities;

  if (entertainmentActivities.length === 0) {
    const activitiesRes = await serverFetch<{ data: Activity[] }>(
      `/api/activities/${locale}?per_page=6`,
      { cache: "no-store" },
    );
    entertainmentActivities = (activitiesRes?.data ?? []).map(normalizeActivityFromApi);
  }

  return (
    <div className="relative overflow-x-hidden">
      <HomeAmbientMotion locale={locale} />
      <HeroSection locale={locale} hero={home.hero} />
      <HomePromoBanner locale={locale} slides={home.promoSlides} />
      <HeroImageGallery
        locale={locale}
        images={home.galleryImages}
        copy={home.heroGallery}
      />
      <EntertainmentActivitiesSection
        locale={locale}
        section={home.entertainmentActivitiesSection}
        activities={entertainmentActivities}
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
