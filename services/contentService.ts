import type { Dictionary } from "@/lib/dictionary";
import { getDictionary } from "@/lib/dictionary";
import { getApiBaseUrl } from "@/lib/api-base";
import { eventGallery } from "@/lib/event-gallery";
import type { Locale } from "@/lib/i18n";
import { skipApiDuringBuild } from "@/lib/skip-api-during-build";
const REVALIDATE_SECONDS = 60;
const API_FETCH_TIMEOUT_MS = 8_000;

async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export type EventGalleryItem = {
  id: string;
  filter: "individual" | "exhibitions" | "entertainment";
  title: string;
  description: string;
  bodyExtra?: string | null;
  image: string;
};

export type SiteSettings = {
  companyName?: string;
  tagline?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  supportPhone?: string;
  email?: string;
  whatsapp?: string;
  social?: Record<string, string>;
};

export type SiteContent = Dictionary & {
  eventsGallery: EventGalleryItem[];
  settings?: SiteSettings;
};

function fallbackEvents(locale: Locale): EventGalleryItem[] {
  return eventGallery.map((event) => ({
    id: event.id,
    filter: event.filter,
    title: locale === "ar" ? event.titleAr : event.titleEn,
    description: locale === "ar" ? event.descAr : event.descEn,
    image: event.image,
  }));
}

function mergePages(
  dictPages: Dictionary["pages"],
  apiPages?: Partial<Dictionary["pages"]>,
): Dictionary["pages"] {
  if (!apiPages) return dictPages;

  return {
    about: { ...dictPages.about, ...apiPages.about },
    services: { ...dictPages.services, ...apiPages.services },
    events: { ...dictPages.events, ...apiPages.events },
    activities: { ...dictPages.activities, ...apiPages.activities },
    partners: { ...dictPages.partners, ...apiPages.partners },
    careers: { ...dictPages.careers, ...apiPages.careers },
    blog: { ...dictPages.blog, ...apiPages.blog },
    requestEvent: { ...dictPages.requestEvent, ...apiPages.requestEvent },
    contact: { ...dictPages.contact, ...apiPages.contact },
  };
}

function mergeSiteContent(
  dict: Dictionary,
  api: Partial<SiteContent>,
  locale: Locale,
): SiteContent {
  const eventsGallery =
    api.eventsGallery && api.eventsGallery.length > 0
      ? api.eventsGallery
      : fallbackEvents(locale);

  return {
    ...dict,
    ...api,
    pages: mergePages(dict.pages, api.pages),
    hero: { ...dict.hero, ...api.hero },
    heroGallery: { ...dict.heroGallery, ...api.heroGallery },
    eventsSection: { ...dict.eventsSection, ...api.eventsSection },
    activitiesSection: { ...dict.activitiesSection, ...api.activitiesSection },
    ownedActivitiesSection: {
      ...dict.ownedActivitiesSection,
      ...api.ownedActivitiesSection,
    },
    partnersSection: { ...dict.partnersSection, ...api.partnersSection },
    homeContact: { ...dict.homeContact, ...api.homeContact },
    achievements: { ...dict.achievements, ...api.achievements },
    footer: { ...dict.footer, ...api.footer },
    nav: { ...dict.nav, ...api.nav },
    inquiryForm: { ...dict.inquiryForm, ...api.inquiryForm },
    inquiryFab: { ...dict.inquiryFab, ...api.inquiryFab },
    eventsGallery,
  };
}

export async function getSiteContent(locale: Locale): Promise<SiteContent> {
  const dict = getDictionary(locale);

  if (skipApiDuringBuild()) {
    return { ...dict, eventsGallery: fallbackEvents(locale) };
  }

  try {
    const response = await apiFetch(`${getApiBaseUrl()}/api/site/${locale}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (response.ok) {
      const json = (await response.json()) as { data?: SiteContent };
      if (json.data) {
        return mergeSiteContent(dict, json.data, locale);
      }
    }
  } catch {
    // API unavailable — static fallback below
  }

  return { ...dict, eventsGallery: fallbackEvents(locale) };
}

export async function getEventBySlug(
  locale: Locale,
  slug: string,
): Promise<EventGalleryItem | null> {
  if (skipApiDuringBuild()) {
    return fallbackEvents(locale).find((event) => event.id === slug) ?? null;
  }

  try {
    const response = await apiFetch(`${getApiBaseUrl()}/api/site/${locale}/events/${slug}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (response.ok) {
      const json = (await response.json()) as { data?: EventGalleryItem };
      if (json.data) {
        return json.data;
      }
    }
  } catch {
    // fallback below
  }

  return fallbackEvents(locale).find((event) => event.id === slug) ?? null;
}
