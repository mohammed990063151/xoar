import { cache } from "react";
import type { Dictionary } from "@/lib/dictionary";
import { getDictionary } from "@/lib/dictionary";
import { laravelFetch } from "@/lib/laravel-fetch";
import { eventGallery } from "@/lib/event-gallery";
import { fallbackServiceBySlug, fallbackServices } from "@/lib/service-catalog";
import { fallbackHappeningBySlug, fallbackHappenings } from "@/lib/happening-catalog";
import type { Locale } from "@/lib/i18n";
import { skipApiDuringBuild } from "@/lib/skip-api-during-build";
const REVALIDATE_SECONDS = 10;
const API_FETCH_TIMEOUT_MS = 8_000;

async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_FETCH_TIMEOUT_MS);
  try {
    return await laravelFetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export type EventGalleryItem = {
  id: string;
  filter: string;
  filterLabel?: string;
  title: string;
  description: string;
  bodyExtra?: string | null;
  clientName?: string | null;
  location?: string | null;
  eventDate?: string | null;
  highlights?: string[];
  image: string;
  gallery?: string[];
  related?: EventGalleryItem[];
};

export type ServiceListItem = {
  id: string;
  slug: string;
  title: string;
  shortLabel?: string | null;
  description: string;
  body?: string | null;
  highlights?: string[];
  iconKey?: string | null;
  image: string;
  gallery?: string[];
};

export type ServiceDetail = ServiceListItem & {
  related?: ServiceListItem[];
};

export type SiteSettings = {
  companyName?: string;
  tagline?: string;
  logo?: string;
  favicon?: string;
  website?: string;
  address?: string;
  city?: string;
  country?: string;
  mapLatitude?: string;
  mapLongitude?: string;
  mapLabel?: string;
  phone?: string;
  supportPhone?: string;
  email?: string;
  whatsapp?: string;
  social?: Record<string, string>;
};

export type HappeningItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  body?: string | null;
  category?: string | null;
  categoryLabel?: string | null;
  location?: string | null;
  eventDate?: string | null;
  highlights?: string[];
  image: string;
  gallery?: string[];
  related?: HappeningItem[];
};

export type SiteContent = Dictionary & {
  eventsGallery: EventGalleryItem[];
  happeningsGallery?: HappeningItem[];
  servicesGallery?: ServiceListItem[];
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
    works: { ...dictPages.works, ...apiPages.works },
    happenings: { ...dictPages.happenings, ...apiPages.happenings },
    activities: { ...dictPages.activities, ...apiPages.activities },
    partners: { ...dictPages.partners, ...apiPages.partners },
    careers: { ...dictPages.careers, ...apiPages.careers },
    blog: { ...dictPages.blog, ...apiPages.blog },
    requestEvent: { ...dictPages.requestEvent, ...apiPages.requestEvent },
    nationalDay: { ...dictPages.nationalDay, ...apiPages.nationalDay },
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
    nav: {
      ...dict.nav,
      ...api.nav,
      // Keep أعمالنا / فعالياتنا split — never let stale CMS override
      works: dict.nav.works,
      events: dict.nav.events,
    },
    inquiryForm: { ...dict.inquiryForm, ...api.inquiryForm },
    inquiryFab: { ...dict.inquiryFab, ...api.inquiryFab },
    eventsGallery,
    happeningsGallery:
      api.happeningsGallery && api.happeningsGallery.length > 0
        ? api.happeningsGallery
        : fallbackHappenings(locale),
    servicesGallery:
      api.servicesGallery && api.servicesGallery.length > 0
        ? api.servicesGallery
        : fallbackServices(locale),
  };
}

async function fetchSiteContent(locale: Locale): Promise<SiteContent> {
  const dict = getDictionary(locale);

  if (skipApiDuringBuild()) {
    return {
      ...dict,
      eventsGallery: fallbackEvents(locale),
      happeningsGallery: fallbackHappenings(locale),
      servicesGallery: fallbackServices(locale),
    };
  }

  try {
    const response = await apiFetch(`/api/site/${locale}`, {
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

  return {
    ...dict,
    eventsGallery: fallbackEvents(locale),
    happeningsGallery: fallbackHappenings(locale),
    servicesGallery: fallbackServices(locale),
  };
}

/** Deduped per request (layout + page + metadata share one fetch). */
export const getSiteContent = cache(fetchSiteContent);

export async function getEventBySlug(
  locale: Locale,
  slug: string,
): Promise<EventGalleryItem | null> {
  if (skipApiDuringBuild()) {
    return fallbackEvents(locale).find((event) => event.id === slug) ?? null;
  }

  try {
    const response = await apiFetch(`/api/site/${locale}/events/${slug}`, {
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

export async function getServiceBySlug(
  locale: Locale,
  slug: string,
): Promise<ServiceDetail | null> {
  if (skipApiDuringBuild()) {
    return fallbackServiceBySlug(locale, slug);
  }

  try {
    const response = await apiFetch(`/api/site/${locale}/services/${slug}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (response.ok) {
      const json = (await response.json()) as { data?: ServiceDetail };
      if (json.data) {
        return json.data;
      }
    }
  } catch {
    // unavailable
  }

  return fallbackServiceBySlug(locale, slug);
}

export async function getHappeningBySlug(
  locale: Locale,
  slug: string,
): Promise<HappeningItem | null> {
  if (skipApiDuringBuild()) {
    return fallbackHappeningBySlug(locale, slug);
  }

  try {
    const response = await apiFetch(`/api/site/${locale}/happenings/${slug}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (response.ok) {
      const json = (await response.json()) as { data?: HappeningItem };
      if (json.data) {
        return json.data;
      }
    }
  } catch {
    // unavailable
  }

  return fallbackHappeningBySlug(locale, slug);
}
