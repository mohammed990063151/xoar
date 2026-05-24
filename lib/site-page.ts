import { unstable_noStore as noStore } from "next/cache";
import { getDictionary } from "@/lib/dictionary";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { API_PROXY_TARGET } from "@/lib/api-base";
import { normalizeStorageImageUrl } from "@/lib/image-url";

export interface AboutValue {
  title: string;
  description: string;
}

export interface AboutMissionVision {
  title: string;
  text: string;
}

export interface AboutPageContent {
  eyebrow: string;
  title: string;
  intro: string;
  p1: string;
  p2: string;
  mission: AboutMissionVision;
  vision: AboutMissionVision;
  values: AboutValue[];
  images: string[];
}

type AboutApiContent = Record<string, unknown>;

function nonEmpty(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function pickMissionVision(
  raw: AboutApiContent | undefined,
  prefix: "mission" | "vision",
  fallback: AboutMissionVision,
): AboutMissionVision {
  const block = raw?.[prefix];
  if (block && typeof block === "object" && !Array.isArray(block)) {
    const obj = block as Record<string, unknown>;
    return {
      title: nonEmpty(obj.title) ?? fallback.title,
      text: nonEmpty(obj.text) ?? fallback.text,
    };
  }

  return {
    title: nonEmpty(raw?.[`${prefix}.title`]) ?? fallback.title,
    text: nonEmpty(raw?.[`${prefix}.text`]) ?? fallback.text,
  };
}

function normalizeValues(raw: unknown, fallback: AboutValue[]): AboutValue[] {
  if (!raw) return fallback;

  if (Array.isArray(raw)) {
    return raw.map((item, index) => {
      if (typeof item === "string") {
        return { title: item, description: fallback[index]?.description ?? "" };
      }
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        return {
          title: nonEmpty(obj.title) ?? fallback[index]?.title ?? "",
          description:
            nonEmpty(obj.description) ??
            nonEmpty(obj.desc) ??
            fallback[index]?.description ??
            "",
        };
      }
      return fallback[index] ?? { title: "", description: "" };
    });
  }

  if (typeof raw === "object") {
    const entries = Object.entries(raw as Record<string, unknown>).sort(([a], [b]) =>
      Number(a) - Number(b),
    );

    return entries.map(([key, item], index) => {
      if (typeof item === "string") {
        return { title: item, description: fallback[index]?.description ?? "" };
      }
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        return {
          title: nonEmpty(obj.title) ?? fallback[index]?.title ?? "",
          description:
            nonEmpty(obj.description) ??
            nonEmpty(obj.desc) ??
            fallback[index]?.description ??
            "",
        };
      }
      return fallback[index] ?? { title: "", description: "" };
    });
  }

  return fallback;
}

function mapImages(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => (typeof item === "string" ? normalizeStorageImageUrl(item) : ""))
    .filter(Boolean);
}

function fallbackAbout(dict: Dictionary): AboutPageContent {
  const about = dict.pages.about as AboutPageContent;

  return {
    eyebrow: about.eyebrow ?? "",
    title: about.title,
    intro: about.intro ?? "",
    p1: about.p1,
    p2: about.p2,
    mission: about.mission,
    vision: about.vision,
    values: normalizeValues(about.values, about.values),
    images: [],
  };
}

function mergeAbout(apiContent: AboutApiContent, dict: Dictionary): AboutPageContent {
  const fallback = fallbackAbout(dict);

  return {
    eyebrow: nonEmpty(apiContent.eyebrow) ?? fallback.eyebrow,
    title: nonEmpty(apiContent.title) ?? fallback.title,
    intro: nonEmpty(apiContent.intro) ?? fallback.intro,
    p1: nonEmpty(apiContent.p1) ?? fallback.p1,
    p2: nonEmpty(apiContent.p2) ?? fallback.p2,
    mission: pickMissionVision(apiContent, "mission", fallback.mission),
    vision: pickMissionVision(apiContent, "vision", fallback.vision),
    values: normalizeValues(apiContent.values, fallback.values),
    images: mapImages(apiContent.images).length
      ? mapImages(apiContent.images)
      : fallback.images,
  };
}

type PageApiContent = Record<string, unknown>;

async function fetchPageApi(locale: Locale, page: string): Promise<PageApiContent | null> {
  try {
    const res = await fetch(`${API_PROXY_TARGET}/api/site/${locale}/pages/${page}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { content?: PageApiContent } };
    return json.data?.content ?? null;
  } catch {
    return null;
  }
}

export async function getAboutPageContent(locale: Locale): Promise<AboutPageContent> {
  noStore();
  const dict = getDictionary(locale);
  const fallback = fallbackAbout(dict);
  const api = await fetchPageApi(locale, "about");
  if (!api) return fallback;

  return mergeAbout(api, dict);
}

export interface ServiceItem {
  title: string;
  body: string;
}

export interface ServicesPageContent {
  eyebrow: string;
  title: string;
  intro: string;
  items: ServiceItem[];
  closingText: string;
  heroImage: string;
}

function normalizeServiceItems(raw: unknown, fallback: ServiceItem[]): ServiceItem[] {
  if (!raw) return fallback;

  const mapItem = (item: unknown, index: number): ServiceItem => {
    if (typeof item === "string") {
      return { title: item, body: fallback[index]?.body ?? "" };
    }
    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      return {
        title: nonEmpty(obj.title) ?? fallback[index]?.title ?? "",
        body:
          nonEmpty(obj.body) ??
          nonEmpty(obj.description) ??
          nonEmpty(obj.desc) ??
          fallback[index]?.body ??
          "",
      };
    }
    return fallback[index] ?? { title: "", body: "" };
  };

  if (Array.isArray(raw)) {
    return raw.map(mapItem);
  }

  if (typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, item], index) => mapItem(item, index));
  }

  return fallback;
}

function fallbackServices(dict: Dictionary): ServicesPageContent {
  const services = dict.pages.services as ServicesPageContent & {
    closing?: { text?: string };
  };

  return {
    eyebrow: services.eyebrow ?? "",
    title: services.title,
    intro: services.intro,
    items: normalizeServiceItems(services.items, services.items),
    closingText: services.closing?.text ?? "",
    heroImage: "",
  };
}

function mergeServices(apiContent: PageApiContent, dict: Dictionary): ServicesPageContent {
  const fallback = fallbackServices(dict);
  const closing = apiContent.closing;

  let closingText = fallback.closingText;
  if (closing && typeof closing === "object" && !Array.isArray(closing)) {
    closingText = nonEmpty((closing as Record<string, unknown>).text) ?? closingText;
  }

  const images = mapImages(apiContent.images);

  return {
    eyebrow: nonEmpty(apiContent.eyebrow) ?? fallback.eyebrow,
    title: nonEmpty(apiContent.title) ?? fallback.title,
    intro: nonEmpty(apiContent.intro) ?? fallback.intro,
    items: normalizeServiceItems(apiContent.items, fallback.items),
    closingText: closingText,
    heroImage: images[0] ?? "",
  };
}

export async function getServicesPageContent(locale: Locale): Promise<ServicesPageContent> {
  noStore();
  const dict = getDictionary(locale);
  const fallback = fallbackServices(dict);
  const api = await fetchPageApi(locale, "services");
  if (!api) return fallback;

  return mergeServices(api, dict);
}

export interface ActivitiesListingContent {
  eyebrow: string;
  title: string;
  intro: string;
  detailCta: string;
}

function fallbackActivitiesListing(dict: Dictionary): ActivitiesListingContent {
  const page = dict.pages.activities as ActivitiesListingContent & { detailCta: string };

  return {
    eyebrow: page.eyebrow ?? "",
    title: page.title,
    intro: page.intro,
    detailCta: page.detailCta,
  };
}

function mergeActivitiesListing(
  apiContent: PageApiContent,
  dict: Dictionary,
): ActivitiesListingContent {
  const fallback = fallbackActivitiesListing(dict);

  return {
    eyebrow: nonEmpty(apiContent.eyebrow) ?? fallback.eyebrow,
    title: nonEmpty(apiContent.title) ?? fallback.title,
    intro: nonEmpty(apiContent.intro) ?? fallback.intro,
    detailCta: nonEmpty(apiContent.detailCta) ?? fallback.detailCta,
  };
}

export async function getActivitiesListingContent(
  locale: Locale,
): Promise<ActivitiesListingContent> {
  noStore();
  const dict = getDictionary(locale);
  const fallback = fallbackActivitiesListing(dict);
  const api = await fetchPageApi(locale, "activities");
  if (!api) return fallback;

  return mergeActivitiesListing(api, dict);
}
