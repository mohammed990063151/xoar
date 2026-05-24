import { Achievements } from "@/components/home/Achievements";
import { HeroImageGallery } from "@/components/home/HeroImageGallery";
import { HeroSection } from "@/components/home/HeroSection";
<<<<<<< HEAD
import { WorksShowcase } from "@/components/home/WorksShowcase";
import { getDictionary } from "@/lib/dictionary";
import { getHomeContent } from "@/lib/home-content";
=======
import { ServiceStrip } from "@/components/home/ServiceStrip";
import { getSiteContent } from "@/services/contentService";
>>>>>>> 1adedd39babb7eb012618a5692b6bca1a59642a3
import type { Locale } from "@/lib/i18n";
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
<<<<<<< HEAD
  const home = await getHomeContent(locale);
  const dict = getDictionary(locale);

  return (
    <>
      <HeroSection locale={locale} hero={home.hero} />
      <HeroImageGallery
        locale={locale}
        images={home.galleryImages}
        copy={home.heroGallery}
=======
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
>>>>>>> 1adedd39babb7eb012618a5692b6bca1a59642a3
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
