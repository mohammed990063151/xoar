import { unstable_noStore as noStore } from "next/cache";
import { getDictionary } from "@/lib/dictionary";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { API_PROXY_TARGET } from "@/lib/api-base";
import { normalizeStorageImageUrl } from "@/lib/image-url";
import type { ActivityCardData } from "@/components/ui/ActivityCard";

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

export interface HomeContent {
  hero: HomeHero;
  heroGallery: HeroGalleryCopy;
  galleryImages: string[];
  worksSection: WorksSectionCopy;
  works: HomeWork[];
  ownedActivitiesSection: OwnedActivitiesSectionCopy;
  ownedActivities: ActivityCardData[];
  achievements: Dictionary["achievements"];
}

type HomeApiPayload = {
  hero?: Partial<HomeHero> & Record<string, unknown>;
  worksSection?: Partial<WorksSectionCopy>;
  ownedActivitiesSection?: Partial<OwnedActivitiesSectionCopy>;
  achievements?: Partial<Dictionary["achievements"]>;
  works?: HomeWork[];
  ownedActivities?: ActivityCardData[];
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

function mapOwnedActivities(raw?: ActivityCardData[]): ActivityCardData[] {
  if (!raw?.length) return [];

  return raw.map((item) => ({
    slug: item.slug,
    title: item.title,
    description: item.description,
    image: item.image ? normalizeStorageImageUrl(item.image) : "",
    organizer: item.organizer,
    location: item.location,
    eventDate: item.eventDate,
    price: item.price,
  }));
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
    heroGallery: heroGalleryCopy(dict),
    galleryImages: hero.gallery ?? [],
    worksSection: worksSectionCopy(api, dict),
    works: mapWorks(api.works),
    ownedActivitiesSection: ownedActivitiesSectionCopy(api, dict),
    ownedActivities: mapOwnedActivities(api.ownedActivities),
    achievements: {
      ...dict.achievements,
      ...(api.achievements ?? {}),
    },
  };
}

async function fetchHomeApi(locale: Locale): Promise<HomeApiPayload | null> {
  const base = API_PROXY_TARGET;
  try {
    const res = await fetch(`${base}/api/site/${locale}/home`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      console.error(`[home] API ${res.status} for ${locale}`);
      return null;
    }
    const json = (await res.json()) as { data?: HomeApiPayload };
    return json.data ?? null;
  } catch (error) {
    console.error("[home] API fetch failed:", error);
    return null;
  }
}

export async function getHomeContent(locale: Locale): Promise<HomeContent> {
  noStore();
  const dict = getDictionary(locale);

  const fallback: HomeContent = {
    hero: dict.hero,
    heroGallery: heroGalleryCopy(dict),
    galleryImages: [],
    worksSection: {
      title: dict.pages.events.title,
      subtitle: dict.eventsSection.subtitle,
    },
    works: [],
    ownedActivitiesSection: dict.ownedActivitiesSection as OwnedActivitiesSectionCopy,
    ownedActivities: [],
    achievements: dict.achievements,
  };

  const api = await fetchHomeApi(locale);
  if (!api) return fallback;

  return mergeHome(locale, api);
}
