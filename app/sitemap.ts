import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

const locales = ["ar", "en"] as const;

const staticPaths = [
  "",
  "/about",
  "/services",
  "/works",
  "/events",
  "/activities",
  "/partners",
  "/blog",
  "/careers",
  "/contact",
  "/request-event",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: absoluteUrl(`/${locale}${path}`),
        lastModified: now,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1 : 0.8,
        alternates: {
          languages: {
            ar: absoluteUrl(`/ar${path}`),
            en: absoluteUrl(`/en${path}`),
          },
        },
      });
    }
  }

  return entries;
}
