import { cache } from "react";
import type { Locale } from "@/lib/i18n";
import { laravelFetch } from "@/lib/laravel-fetch";
import type { SeoEntry } from "@/lib/seo";
import { skipApiDuringBuild } from "@/lib/skip-api-during-build";

const REVALIDATE_SECONDS = 60;

export const getSeoForRoute = cache(
  async (
    routeKey: string,
    locale: Locale,
    vars?: Record<string, string>,
  ): Promise<SeoEntry | null> => {
    if (skipApiDuringBuild()) return null;

    const params = new URLSearchParams({ route_key: routeKey });
    if (vars) {
      for (const [key, value] of Object.entries(vars)) {
        if (value) params.set(key, value);
      }
    }

    try {
      const res = await laravelFetch(
        `/api/site/${locale}/seo/resolve?${params.toString()}`,
        { next: { revalidate: REVALIDATE_SECONDS } },
      );
      if (!res.ok) return null;
      const json = (await res.json()) as { data?: SeoEntry };
      return json.data ?? null;
    } catch {
      return null;
    }
  },
);

export async function resolveSeoByPath(
  path: string,
  locale: Locale,
  vars?: Record<string, string>,
): Promise<SeoEntry | null> {
  if (skipApiDuringBuild()) return null;

  const params = new URLSearchParams({ path });
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      if (value) params.set(key, value);
    }
  }

  try {
    const res = await laravelFetch(
      `/api/site/${locale}/seo/resolve?${params.toString()}`,
      { next: { revalidate: REVALIDATE_SECONDS } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: SeoEntry };
    return json.data ?? null;
  } catch {
    return null;
  }
}

export const getAllSeoEntries = cache(
  async (locale: Locale): Promise<SeoEntry[]> => {
    if (skipApiDuringBuild()) return [];

    try {
      const res = await laravelFetch(`/api/site/${locale}/seo`, {
        next: { revalidate: REVALIDATE_SECONDS },
      });
      if (!res.ok) return [];
      const json = (await res.json()) as { data?: SeoEntry[] };
      return json.data ?? [];
    } catch {
      return [];
    }
  },
);

export async function pageMetadata(
  routeKey: string,
  locale: Locale,
  path: string,
  vars?: Record<string, string>,
  fallback?: { title: string; description: string },
) {
  const { buildPageMetadata, fallbackSeo } = await import("@/lib/seo");

  const seo = await getSeoForRoute(routeKey, locale, vars);
  if (seo) {
    return buildPageMetadata(seo, locale, path);
  }

  if (fallback) {
    return fallbackSeo(locale, fallback.title, fallback.description, path);
  }

  return buildPageMetadata(
    {
      meta_title: locale === "ar" ? "اكزورا" : "Xora",
      meta_description:
        locale === "ar"
          ? "تنظيم فعاليات ومؤتمرات في السعودية"
          : "Events and conferences in Saudi Arabia",
    },
    locale,
    path,
  );
}
