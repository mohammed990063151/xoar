import { unstable_noStore as noStore } from "next/cache";
import { getDictionary } from "@/lib/dictionary";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { API_PROXY_TARGET } from "@/lib/api-base";
import { skipApiDuringBuild } from "@/lib/skip-api-during-build";
import { normalizeStorageImageUrl } from "@/lib/image-url";

export interface AboutValue {
  title: string;
  description: string;
}

export interface AboutMissionVision {
  title: string;
  text: string;
}

export interface AboutTeamMember {
  name: string;
  role: string;
  description: string;
  image: string;
}

export interface AboutTeamSection {
  eyebrow: string;
  title: string;
  subtitle: string;
  members: AboutTeamMember[];
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
  team: AboutTeamSection;
}

export interface PageStat {
  value: string;
  label: string;
}

export interface PageBenefit {
  title: string;
  text: string;
}

export interface PageClosing {
  title: string;
  text: string;
}

export interface PartnerItem {
  id: number | string;
  name: string;
  logo: string;
  website: string;
}

export interface PartnersPageContent {
  eyebrow: string;
  title: string;
  intro: string;
  stats: PageStat[];
  closing: PageClosing;
  partners: PartnerItem[];
}

export interface JobPostingItem {
  id: number | string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  employmentTypeLabel: string;
  summary: string;
  description: string;
  requirements: string;
  applyEmail: string;
  applyUrl: string;
}

export interface CareersPageContent {
  eyebrow: string;
  title: string;
  intro: string;
  culture: { title: string; text: string };
  benefits: PageBenefit[];
  closing: PageClosing;
  applyCta: string;
  openRoles: string;
  noJobs: string;
  jobs: JobPostingItem[];
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

function normalizeTeamMembers(raw: unknown, fallback: AboutTeamMember[]): AboutTeamMember[] {
  if (!Array.isArray(raw)) return fallback;

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const obj = item as Record<string, unknown>;
      const name = nonEmpty(obj.name) ?? "";
      const role = nonEmpty(obj.role) ?? "";
      const description = nonEmpty(obj.description) ?? "";
      const imageRaw = nonEmpty(obj.image) ?? "";
      const image = imageRaw ? normalizeStorageImageUrl(imageRaw) : "";
      if (!name || !image) return null;
      return { name, role, description, image };
    })
    .filter((item): item is AboutTeamMember => item !== null);
}

function pickTeam(raw: AboutApiContent | undefined, fallback: AboutTeamSection): AboutTeamSection {
  const block = raw?.team;
  if (!block || typeof block !== "object" || Array.isArray(block)) {
    return fallback;
  }

  const obj = block as Record<string, unknown>;

  return {
    eyebrow: nonEmpty(obj.eyebrow) ?? fallback.eyebrow,
    title: nonEmpty(obj.title) ?? fallback.title,
    subtitle: nonEmpty(obj.subtitle) ?? fallback.subtitle,
    members: normalizeTeamMembers(obj.members, fallback.members),
  };
}

function fallbackAbout(dict: Dictionary): AboutPageContent {
  const about = dict.pages.about as AboutPageContent & AboutApiContent;
  const defaultTeam: AboutTeamSection = {
    eyebrow: "",
    title: "",
    subtitle: "",
    members: [],
  };

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
    team: pickTeam(about, about.team ?? defaultTeam),
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
    team: pickTeam(apiContent, fallback.team),
  };
}

type PageApiContent = Record<string, unknown>;

interface PageApiBundle {
  content: PageApiContent;
  items: unknown[];
}

async function fetchPageBundle(locale: Locale, page: string): Promise<PageApiBundle | null> {
  if (skipApiDuringBuild()) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const res = await fetch(`${API_PROXY_TARGET}/api/site/${locale}/pages/${page}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      next: { revalidate: 0 },
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { content?: PageApiContent; items?: unknown[] };
    };
    if (!json.data?.content) return null;

    return {
      content: json.data.content,
      items: Array.isArray(json.data.items) ? json.data.items : [],
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPageApi(locale: Locale, page: string): Promise<PageApiContent | null> {
  const bundle = await fetchPageBundle(locale, page);
  return bundle?.content ?? null;
}

function normalizeStatItems(raw: unknown, fallback: PageStat[]): PageStat[] {
  if (!Array.isArray(raw)) return fallback;

  return raw.map((item, index) => {
    if (!item || typeof item !== "object") {
      return fallback[index] ?? { value: "", label: "" };
    }
    const obj = item as Record<string, unknown>;
    return {
      value: nonEmpty(obj.value) ?? fallback[index]?.value ?? "",
      label: nonEmpty(obj.label) ?? fallback[index]?.label ?? "",
    };
  });
}

function normalizeBenefitItems(raw: unknown, fallback: PageBenefit[]): PageBenefit[] {
  if (!Array.isArray(raw)) return fallback;

  return raw.map((item, index) => {
    if (!item || typeof item !== "object") {
      return fallback[index] ?? { title: "", text: "" };
    }
    const obj = item as Record<string, unknown>;
    return {
      title: nonEmpty(obj.title) ?? fallback[index]?.title ?? "",
      text: nonEmpty(obj.text) ?? fallback[index]?.text ?? "",
    };
  });
}

function pickClosingBlock(
  raw: PageApiContent,
  fallback: { title: string; text: string },
): { title: string; text: string } {
  const closing = raw.closing;
  if (closing && typeof closing === "object" && !Array.isArray(closing)) {
    const obj = closing as Record<string, unknown>;
    return {
      title: nonEmpty(obj.title) ?? fallback.title,
      text: nonEmpty(obj.text) ?? fallback.text,
    };
  }

  return {
    title: nonEmpty(raw["closing.title"]) ?? fallback.title,
    text: nonEmpty(raw["closing.text"]) ?? fallback.text,
  };
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

function normalizePartnerItems(raw: unknown): PartnerItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const name = nonEmpty(obj.name) ?? "";
      const logoRaw = nonEmpty(obj.logo) ?? "";
      if (!name) return null;

      return {
        id: (obj.id as number | string) ?? name,
        name,
        logo: logoRaw ? normalizeStorageImageUrl(logoRaw) : "",
        website: nonEmpty(obj.website) ?? "",
      };
    })
    .filter((item): item is PartnerItem => item !== null);
}

function fallbackPartners(dict: Dictionary): PartnersPageContent {
  const page = dict.pages.partners as PartnersPageContent;

  return {
    eyebrow: page.eyebrow ?? "",
    title: page.title,
    intro: page.intro,
    stats: normalizeStatItems(page.stats, page.stats ?? []),
    closing: page.closing ?? { title: "", text: "" },
    partners: [],
  };
}

function mergePartners(
  apiContent: PageApiContent,
  items: unknown[],
  dict: Dictionary,
): PartnersPageContent {
  const fallback = fallbackPartners(dict);

  return {
    eyebrow: nonEmpty(apiContent.eyebrow) ?? fallback.eyebrow,
    title: nonEmpty(apiContent.title) ?? fallback.title,
    intro: nonEmpty(apiContent.intro) ?? fallback.intro,
    stats: normalizeStatItems(apiContent.stats, fallback.stats),
    closing: pickClosingBlock(apiContent, fallback.closing),
    partners: normalizePartnerItems(items),
  };
}

export async function getPartnersPageContent(locale: Locale): Promise<PartnersPageContent> {
  noStore();
  const dict = getDictionary(locale);
  const fallback = fallbackPartners(dict);
  const bundle = await fetchPageBundle(locale, "partners");
  if (!bundle) return fallback;

  return mergePartners(bundle.content, bundle.items, dict);
}

function normalizeJobItems(raw: unknown): JobPostingItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const title = nonEmpty(obj.title) ?? "";
      if (!title) return null;

      return {
        id: (obj.id as number | string) ?? title,
        title,
        department: nonEmpty(obj.department) ?? "",
        location: nonEmpty(obj.location) ?? "",
        employmentType: nonEmpty(obj.employmentType) ?? "",
        employmentTypeLabel: nonEmpty(obj.employmentTypeLabel) ?? "",
        summary: nonEmpty(obj.summary) ?? "",
        description: nonEmpty(obj.description) ?? "",
        requirements: nonEmpty(obj.requirements) ?? "",
        applyEmail: nonEmpty(obj.applyEmail) ?? "",
        applyUrl: nonEmpty(obj.applyUrl) ?? "",
      };
    })
    .filter((item): item is JobPostingItem => item !== null);
}

function fallbackCareers(dict: Dictionary): CareersPageContent {
  const page = dict.pages.careers as CareersPageContent;

  return {
    eyebrow: page.eyebrow ?? "",
    title: page.title,
    intro: page.intro,
    culture: page.culture ?? { title: "", text: "" },
    benefits: normalizeBenefitItems(page.benefits, page.benefits ?? []),
    closing: page.closing ?? { title: "", text: "" },
    applyCta: page.applyCta ?? "",
    openRoles: page.openRoles ?? "",
    noJobs: page.noJobs ?? "",
    jobs: [],
  };
}

function mergeCareers(
  apiContent: PageApiContent,
  items: unknown[],
  dict: Dictionary,
): CareersPageContent {
  const fallback = fallbackCareers(dict);
  const culture = apiContent.culture;

  let cultureBlock = fallback.culture;
  if (culture && typeof culture === "object" && !Array.isArray(culture)) {
    const obj = culture as Record<string, unknown>;
    cultureBlock = {
      title: nonEmpty(obj.title) ?? fallback.culture.title,
      text: nonEmpty(obj.text) ?? fallback.culture.text,
    };
  }

  return {
    eyebrow: nonEmpty(apiContent.eyebrow) ?? fallback.eyebrow,
    title: nonEmpty(apiContent.title) ?? fallback.title,
    intro: nonEmpty(apiContent.intro) ?? fallback.intro,
    culture: cultureBlock,
    benefits: normalizeBenefitItems(apiContent.benefits, fallback.benefits),
    closing: pickClosingBlock(apiContent, fallback.closing),
    applyCta: fallback.applyCta,
    openRoles: fallback.openRoles,
    noJobs: fallback.noJobs,
    jobs: normalizeJobItems(items),
  };
}

export async function getCareersPageContent(locale: Locale): Promise<CareersPageContent> {
  noStore();
  const dict = getDictionary(locale);
  const fallback = fallbackCareers(dict);
  const bundle = await fetchPageBundle(locale, "careers");
  if (!bundle) return fallback;

  return mergeCareers(bundle.content, bundle.items, dict);
}
