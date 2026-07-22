import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { HeroSection } from "@/components/home/HeroSection";
import { EntertainmentActivitiesSection } from "@/components/home/EntertainmentActivitiesSection";
import { getDictionary } from "@/lib/dictionary";
import { getHomeContent } from "@/lib/home-content";
import { isLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo-service";
import { getSiteContent } from "@/services/contentService";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) return {};
  return pageMetadata("home", loc, `/${loc}`);
}

const HomeAmbientMotion = dynamic(
  () =>
    import("@/components/home/HomeAmbientMotion").then((m) => ({
      default: m.HomeAmbientMotion,
    })),
  { loading: () => null },
);

const HomePromoBanner = dynamic(
  () =>
    import("@/components/home/HomePromoBanner").then((m) => ({
      default: m.HomePromoBanner,
    })),
  { loading: () => null },
);

const HeroImageGallery = dynamic(
  () =>
    import("@/components/home/HeroImageGallery").then((m) => ({
      default: m.HeroImageGallery,
    })),
  { loading: () => null },
);

const WorksShowcase = dynamic(
  () =>
    import("@/components/home/WorksShowcase").then((m) => ({
      default: m.WorksShowcase,
    })),
  { loading: () => null },
);

const PartnersMarquee = dynamic(
  () =>
    import("@/components/home/PartnersMarquee").then((m) => ({
      default: m.PartnersMarquee,
    })),
  { loading: () => null },
);

const HomeContactSection = dynamic(
  () =>
    import("@/components/home/HomeContactSection").then((m) => ({
      default: m.HomeContactSection,
    })),
  { loading: () => null },
);

const Achievements = dynamic(
  () =>
    import("@/components/home/Achievements").then((m) => ({
      default: m.Achievements,
    })),
  { loading: () => null },
);

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
        activities={home.entertainmentActivities}
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
