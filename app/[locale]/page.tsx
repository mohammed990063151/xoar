import { Achievements } from "@/components/home/Achievements";
import { HeroImageGallery } from "@/components/home/HeroImageGallery";
import { HeroSection } from "@/components/home/HeroSection";
import { WorksShowcase } from "@/components/home/WorksShowcase";
import { getHomeContent } from "@/lib/home-content";
import { getSiteContent } from "@/services/contentService";
import { isLocale } from "@/lib/i18n";
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
  const locale = loc;
  const [home, dict] = await Promise.all([
    getHomeContent(locale),
    getSiteContent(locale),
  ]);

  return (
    <>
      <HeroSection locale={locale} hero={home.hero} />
      <HeroImageGallery
        locale={locale}
        images={home.galleryImages}
        copy={home.heroGallery}
      />
      <WorksShowcase
        locale={locale}
        section={home.worksSection}
        works={home.works}
        ownedActivitiesSection={home.ownedActivitiesSection}
        ownedActivities={home.ownedActivities}
        viewDetailsLabel={dict.eventsSection.viewDetails}
        viewAllWorksLabel={locale === "ar" ? "عرض كل الأعمال" : "View all works"}
        bookCta={dict.eventsSection.book}
        viewAllActivitiesLabel={locale === "ar" ? "عرض كل الأنشطة" : "View all activities"}
      />
      <Achievements data={home.achievements} />
    </>
  );
}
