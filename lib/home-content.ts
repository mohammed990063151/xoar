import { cache } from "react";
import { getDictionary } from "@/lib/dictionary";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { getApiBaseUrl } from "@/lib/api-base";
import { skipApiDuringBuild } from "@/lib/skip-api-during-build";
import { normalizeStorageImageUrl } from "@/lib/image-url";
import type { ActivityCardData } from "@/components/ui/ActivityCard";
import { normalizeActivityFromApi, toActivityCardData } from "@/lib/activity";
import type { Activity } from "@/types/api";

export type HomeHero = Dictionary["hero"] & {
  videoUrl?: string;
  videoPoster?: string;
  gallery?: string[];
};

export interface HeroGalleryCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export interface HomeWork {
  slug: string;
  title: string;
  description: string;
  image: string;
  filter?: string;
  filterLabel?: string;
}

export interface WorksSectionCopy {
  title: string;
  subtitle: string;
}

export interface OwnedActivitiesSectionCopy {
  title: string;
  subtitle: string;
}

export interface PartnersSectionCopy {
  eyebrow?: string;
  title: string;
  subtitle: string;
}

export interface HomeContactCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export interface HomePartner {
  id: number;
  name: string;
  logo: string;
  website?: string;
}

export type HomePromoLinkType = "activity" | "event" | "service" | "url";

export interface HomePromoSlide {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  linkType: HomePromoLinkType;
  linkTarget: string;
  durationSeconds: number;
  href: string;
}

export interface EntertainmentActivitiesSectionCopy {
  title: string;
  subtitle: string;
  eventRequestCta?: string;
}

export interface HomeContent {
  hero: HomeHero;
  promoSlides: HomePromoSlide[];
  heroGallery: HeroGalleryCopy;
  galleryImages: string[];
  worksSection: WorksSectionCopy;
  works: HomeWork[];
  ownedActivitiesSection: OwnedActivitiesSectionCopy;
  ownedActivities: ActivityCardData[];
  entertainmentActivitiesSection: EntertainmentActivitiesSectionCopy;
  /** Curated from `/api/site/{locale}/home` (most-booked, then platform-owned). */
  entertainmentActivities: Activity[];
  partnersSection: PartnersSectionCopy;
  partners: HomePartner[];
  homeContact: HomeContactCopy;
  achievements: Dictionary["achievements"];
}

type HomeApiPayload = {
  hero?: Partial<HomeHero> & Record<string, unknown>;
  promoSlides?: HomePromoSlide[];
  worksSection?: Partial<WorksSectionCopy>;
  ownedActivitiesSection?: Partial<OwnedActivitiesSectionCopy>;
  achievements?: Partial<Dictionary["achievements"]>;
  works?: HomeWork[];
  ownedActivities?: Activity[];
  entertainmentActivitiesSection?: Partial<EntertainmentActivitiesSectionCopy>;
  entertainmentActivities?: Activity[];
  partnersSection?: Partial<PartnersSectionCopy>;
  partners?: HomePartner[];
  homeContact?: Partial<HomeContactCopy>;
};

function nonEmpty(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function mediaUrl(value: unknown): string | undefined {
  const raw = nonEmpty(value);
  if (!raw) return undefined;
  return normalizeStorageImageUrl(raw);
}

function pickHero(raw?: HomeApiPayload["hero"]): Partial<HomeHero> {
  if (!raw) return {};

  return {
    title: nonEmpty(raw.title),
    titleHighlight: nonEmpty(raw.titleHighlight),
    titleEnd: nonEmpty(raw.titleEnd),
    subtitle: nonEmpty(raw.subtitle),
    primaryCta: nonEmpty(raw.primaryCta),
    secondaryCta: nonEmpty(raw.secondaryCta),
    videoUrl: mediaUrl(raw.videoUrl),
    videoPoster: mediaUrl(raw.videoPoster),
    gallery: mapGalleryImages(raw.gallery),
  };
}

function mapGalleryImages(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => mediaUrl(item))
    .filter((url): url is string => Boolean(url));
}

function heroGalleryCopy(dict: Dictionary): HeroGalleryCopy {
  return dict.heroGallery as HeroGalleryCopy;
}

function worksSectionCopy(api: HomeApiPayload, dict: Dictionary): WorksSectionCopy {
  return {
    title: nonEmpty(api.worksSection?.title) ?? dict.pages.events.title,
    subtitle: nonEmpty(api.worksSection?.subtitle) ?? dict.eventsSection.subtitle,
  };
}

function ownedActivitiesSectionCopy(
  api: HomeApiPayload,
  dict: Dictionary,
): OwnedActivitiesSectionCopy {
  const fallback = dict.ownedActivitiesSection as OwnedActivitiesSectionCopy;

  return {
    title: nonEmpty(api.ownedActivitiesSection?.title) ?? fallback.title,
    subtitle: nonEmpty(api.ownedActivitiesSection?.subtitle) ?? fallback.subtitle,
  };
}

function entertainmentActivitiesSectionCopy(
  api: HomeApiPayload,
  locale: Locale,
): EntertainmentActivitiesSectionCopy {
  const ar = locale === "ar";
  const fallback = getDictionary(locale).entertainmentActivitiesSection;
  return {
    title:
      nonEmpty(api.entertainmentActivitiesSection?.title) ??
      (ar ? "الأنشطة الترفيهية" : "Entertainment activities"),
    subtitle:
      nonEmpty(api.entertainmentActivitiesSection?.subtitle) ??
      (ar
        ? "اكتشف تجارب حصرية واحجز مكانك خلال ثوانٍ"
        : "Discover exclusive experiences and book in seconds"),
    eventRequestCta:
      nonEmpty(
        (api.entertainmentActivitiesSection as { eventRequestCta?: string } | undefined)
          ?.eventRequestCta,
      ) ?? fallback.eventRequestCta,
  };
}

function partnersSectionCopy(api: HomeApiPayload, dict: Dictionary): PartnersSectionCopy {
  const fallback = dict.partnersSection as PartnersSectionCopy;

  return {
    eyebrow: nonEmpty(api.partnersSection?.eyebrow) ?? fallback.eyebrow,
    title: nonEmpty(api.partnersSection?.title) ?? fallback.title,
    subtitle: nonEmpty(api.partnersSection?.subtitle) ?? fallback.subtitle,
  };
}

function homeContactCopy(api: HomeApiPayload, dict: Dictionary): HomeContactCopy {
  const fallback = dict.homeContact as HomeContactCopy;

  return {
    eyebrow: nonEmpty(api.homeContact?.eyebrow) ?? fallback.eyebrow,
    title: nonEmpty(api.homeContact?.title) ?? fallback.title,
    subtitle: nonEmpty(api.homeContact?.subtitle) ?? fallback.subtitle,
  };
}

function mapPartners(raw?: HomePartner[]): HomePartner[] {
  if (!raw?.length) return [];

  return raw.map((p) => ({
    id: p.id,
    name: p.name,
    logo: p.logo ? normalizeStorageImageUrl(p.logo) : "",
    website: p.website,
  }));
}

function mapActivityCards(raw?: Activity[]): ActivityCardData[] {
  if (!raw?.length) return [];

  return raw.map((item) => toActivityCardData(normalizeActivityFromApi(item)));
}

function mapActivities(raw?: Activity[]): Activity[] {
  if (!raw?.length) return [];

  return raw.map((item) => normalizeActivityFromApi(item));
}

function mapPromoSlides(raw?: HomePromoSlide[]): HomePromoSlide[] {
  if (!raw?.length) return [];

  return raw
    .map((slide) => {
      const image = mediaUrl(slide.image) ?? "";
      const title = nonEmpty(slide.title) ?? "";
      if (!image || !title) return null;

      const duration = typeof slide.durationSeconds === "number" ? slide.durationSeconds : 6;

      return {
        id: typeof slide.id === "number" ? slide.id : 0,
        title,
        subtitle: nonEmpty(slide.subtitle) ?? "",
        image,
        linkType: (slide.linkType as HomePromoLinkType) ?? "url",
        linkTarget: nonEmpty(slide.linkTarget) ?? "",
        durationSeconds: Math.min(30, Math.max(3, duration)),
        href: nonEmpty(slide.href) ?? "",
      };
    })
    .filter((slide): slide is HomePromoSlide => slide !== null && Boolean(slide.href));
}

function mapWorks(raw?: HomeWork[]): HomeWork[] {
  if (!raw?.length) return [];

  return raw.map((item) => ({
    slug: item.slug,
    title: item.title,
    description: item.description,
    image: item.image ? normalizeStorageImageUrl(item.image) : "",
    filter: item.filter,
    filterLabel: item.filterLabel,
  }));
}

function mergeHome(locale: Locale, api: HomeApiPayload): HomeContent {
  const dict = getDictionary(locale);

  const hero = { ...dict.hero, ...pickHero(api.hero) };

  return {
    hero,
    promoSlides: mapPromoSlides(api.promoSlides),
    heroGallery: heroGalleryCopy(dict),
    galleryImages: hero.gallery ?? [],
    worksSection: worksSectionCopy(api, dict),
    works: mapWorks(api.works),
    ownedActivitiesSection: ownedActivitiesSectionCopy(api, dict),
    ownedActivities: mapActivityCards(api.ownedActivities),
    entertainmentActivitiesSection: entertainmentActivitiesSectionCopy(api, locale),
    entertainmentActivities: mapActivities(
      api.entertainmentActivities?.length
        ? api.entertainmentActivities
        : api.ownedActivities,
    ),
    partnersSection: partnersSectionCopy(api, dict),
    partners: mapPartners(api.partners),
    homeContact: homeContactCopy(api, dict),
    achievements: {
      ...dict.achievements,
      ...(api.achievements ?? {}),
    },
  };
}

const HOME_API_TIMEOUT_MS = 8_000;
const HOME_REVALIDATE_SECONDS = 60;

async function fetchHomeApi(locale: Locale): Promise<HomeApiPayload | null> {
  if (skipApiDuringBuild()) {
    return null;
  }

  const base = getApiBaseUrl();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HOME_API_TIMEOUT_MS);
  try {
    const res = await fetch(`${base}/api/site/${locale}/home`, {
      headers: { Accept: "application/json" },
      next: { revalidate: HOME_REVALIDATE_SECONDS },
      signal: controller.signal,
    });
    if (!res.ok) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[home] API ${res.status} for ${locale}`);
      }
      return null;
    }
    const json = (await res.json()) as { data?: HomeApiPayload };
    return json.data ?? null;
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    if (process.env.NODE_ENV === "development" && !aborted) {
      console.warn("[home] API fetch failed:", error);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHomeContent(locale: Locale): Promise<HomeContent> {
  const dict = getDictionary(locale);

  const fallback: HomeContent = {
    hero: dict.hero,
    promoSlides: [],
    heroGallery: heroGalleryCopy(dict),
    galleryImages: [],
    worksSection: {
      title: dict.pages.events.title,
      subtitle: dict.eventsSection.subtitle,
    },
    works: [],
    ownedActivitiesSection: dict.ownedActivitiesSection as OwnedActivitiesSectionCopy,
    ownedActivities: [],
    entertainmentActivitiesSection: entertainmentActivitiesSectionCopy({}, locale),
    entertainmentActivities: [],
    partnersSection: dict.partnersSection as PartnersSectionCopy,
    partners: [],
    homeContact: dict.homeContact as HomeContactCopy,
    achievements: dict.achievements,
  };

  const api = await fetchHomeApi(locale);
  if (!api) return fallback;

  return mergeHome(locale, api);
}

export const getHomeContent = cache(fetchHomeContent);
