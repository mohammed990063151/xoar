import type { Metadata } from "next";
import { normalizeStorageImageUrl } from "@/lib/image-url";

const FALLBACK_ICON = "/favicon.png?v=20260813";
const FALLBACK_APPLE = "/apple-icon.png?v=20260813";

export function resolveSiteIconUrl(url?: string | null, fallback = FALLBACK_ICON): string {
  const normalized = url?.trim() ? normalizeStorageImageUrl(url.trim()) : "";
  return normalized || fallback;
}

function iconType(url: string): string | undefined {
  const lower = url.toLowerCase();
  if (lower.includes(".svg")) return "image/svg+xml";
  if (lower.includes(".ico")) return "image/x-icon";
  if (lower.includes(".webp")) return "image/webp";
  return "image/png";
}

export function siteIconMetadata(favicon?: string | null, logo?: string | null): NonNullable<Metadata["icons"]> {
  const small = resolveSiteIconUrl(favicon || logo, FALLBACK_ICON);
  const large = resolveSiteIconUrl(logo || favicon, FALLBACK_APPLE);

  return {
    icon: [
      { url: small, type: iconType(small) },
      { url: large, type: iconType(large), sizes: "32x32" },
    ],
    shortcut: [{ url: small, type: iconType(small) }],
    apple: [{ url: large, type: iconType(large), sizes: "180x180" }],
  };
}
