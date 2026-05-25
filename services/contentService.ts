import type { Dictionary } from "@/lib/dictionary";
import { getDictionary } from "@/lib/dictionary";
import { eventGallery } from "@/lib/event-gallery";
import type { Locale } from "@/lib/i18n";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const REVALIDATE_SECONDS = 60;

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
  phone?: string;
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

export async function getSiteContent(locale: Locale): Promise<SiteContent> {
  const dict = getDictionary(locale);

  try {
    const response = await fetch(`${API_BASE}/api/site/${locale}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (response.ok) {
      const json = (await response.json()) as { data?: SiteContent };
      if (json.data) {
        const eventsGallery =
          json.data.eventsGallery?.length > 0
            ? json.data.eventsGallery
            : fallbackEvents(locale);
        return { ...dict, ...json.data, eventsGallery };
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
  try {
    const response = await fetch(
      `${API_BASE}/api/site/${locale}/events/${slug}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: REVALIDATE_SECONDS },
      },
    );
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
