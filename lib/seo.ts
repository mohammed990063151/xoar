import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n";

export type SeoEntry = {
  route_key?: string;
  meta_title: string;
  meta_description: string;
  meta_keywords?: string | null;
  og_title?: string;
  og_description?: string;
  og_image?: string | null;
  twitter_card?: string;
  noindex?: boolean;
  nofollow?: boolean;
  path_pattern?: string;
  is_dynamic?: boolean;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://xoraevents.com";
const SITE_NAME = "Xora";

export function siteBaseUrl(): string {
  return SITE_URL.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteBaseUrl()}${normalized}`;
}

export function buildPageMetadata(
  seo: SeoEntry,
  locale: Locale,
  path: string,
): Metadata {
  const canonical = absoluteUrl(path);
  const title = seo.meta_title;
  const description = seo.meta_description;
  const ogTitle = seo.og_title || title;
  const ogDescription = seo.og_description || description;
  const ogImage = seo.og_image ? absoluteUrl(seo.og_image.startsWith("http") ? seo.og_image : seo.og_image) : absoluteUrl("/icon.png");

  const robots = {
    index: !seo.noindex,
    follow: !seo.nofollow,
    googleBot: {
      index: !seo.noindex,
      follow: !seo.nofollow,
    },
  };

  const alternateLocale = locale === "ar" ? "en" : "ar";
  const alternatePath = path.replace(/^\/(ar|en)/, `/${alternateLocale}`);

  return {
    title,
    description,
    keywords: seo.meta_keywords ?? undefined,
    alternates: {
      canonical,
      languages: {
        [locale]: canonical,
        [alternateLocale]: absoluteUrl(alternatePath),
      },
    },
    robots,
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      url: canonical,
      siteName: SITE_NAME,
      title: ogTitle,
      description: ogDescription,
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: (seo.twitter_card as "summary" | "summary_large_image") ?? "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
  };
}

export function fallbackSeo(
  locale: Locale,
  title: string,
  description: string,
  path: string,
): Metadata {
  return buildPageMetadata(
    {
      meta_title: title,
      meta_description: description,
    },
    locale,
    path,
  );
}
