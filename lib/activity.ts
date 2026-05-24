import type { ActivityCardData } from "@/components/ui/ActivityCard";
import type { Activity } from "@/types/api";
import { normalizeStorageImageUrl } from "@/lib/image-url";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1551632811-561732d1e306?w=900&q=80";

export function activityImageUrl(activity: Activity): string {
  const url = activity.image_url ?? (activity as Activity & { image?: string }).image;
  if (!url || url.length === 0) return FALLBACK_IMAGE;
  return normalizeStorageImageUrl(url);
}

export function hasActivityImage(activity: Activity): boolean {
  const url = activity.image_url ?? (activity as Activity & { image?: string }).image;
  return Boolean(url && url.length > 0);
}

export function activityShortLabel(activity: Activity): string {
  return (
    activity.short_label ??
    (activity as Activity & { shortLabel?: string }).shortLabel ??
    ""
  );
}

export function activityGalleryUrls(activity: Activity): string[] {
  const raw =
    activity.gallery_urls ??
    activity.gallery ??
    (activity as Activity & { galleryUrls?: string[] }).galleryUrls ??
    [];
  return raw.map((u) => normalizeStorageImageUrl(u)).filter(Boolean);
}

/** Main cover + gallery images, deduplicated. */
export function activityAllImages(activity: Activity): string[] {
  const main = activityImageUrl(activity);
  const extras = activityGalleryUrls(activity).filter((url) => url !== main);
  return [main, ...extras].filter((url, index, list) => url && list.indexOf(url) === index);
}

export function toActivityCardData(activity: Activity): ActivityCardData {
  return {
    slug: activity.slug,
    title: activity.title,
    description: activityShortLabel(activity) || activity.description,
    image: activityImageUrl(activity),
    organizer: activity.organizer ?? activity.provider?.name ?? "Xora",
    location: activity.location,
    eventDate: activity.event_date ?? (activity as Activity & { eventDate?: string }).eventDate,
    price: activity.price,
  };
}
