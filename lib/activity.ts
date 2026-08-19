import type { ActivityCardData } from "@/components/ui/ActivityCard";
import type { ActivityCardMediaSlide } from "@/components/ui/ActivityCardMediaSlider";
import type { Activity, FaqItem, TicketHighlight } from "@/types/api";
import {
  normalizeStorageImageUrl,
  sanitizeExternalImageUrl,
} from "@/lib/image-url";

export const ACTIVITY_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1551632811-561732d1e306?w=900&q=80";

function isValidMediaUrl(url: string | null | undefined): url is string {
  return typeof url === "string" && url.trim() !== "";
}

/** Unify API snake_case / camelCase for product-page fields from Laravel admin. */
export function normalizeActivityFromApi(raw: Activity): Activity {
  const ext = raw as Activity & {
    ticketHighlights?: TicketHighlight[];
    termsConditions?: string;
    organizerBio?: string;
    whatsIncluded?: string;
    availableTimes?: string[];
    recurringWeekdays?: number[];
    promoVideoUrl?: string;
    promoVideoMobileUrl?: string;
    comparePrice?: string;
    displayPrice?: string;
    originalPrice?: string;
    activeCoupon?: Activity["activeCoupon"];
    galleryUrls?: string[];
  };

  const ticket =
    raw.ticket_highlights ?? ext.ticketHighlights ?? [];
  const faq = (raw.faq ?? []) as FaqItem[];

  return {
    ...raw,
    ticket_highlights: ticket,
    ticketHighlights: ticket,
    terms_conditions: raw.terms_conditions ?? ext.termsConditions ?? raw.policies,
    termsConditions: raw.terms_conditions ?? ext.termsConditions ?? raw.policies,
    organizer_bio: raw.organizer_bio ?? ext.organizerBio,
    organizerBio: raw.organizer_bio ?? ext.organizerBio,
    whats_included: raw.whats_included ?? ext.whatsIncluded,
    faq,
    available_times: raw.available_times ?? ext.availableTimes ?? [],
    availableTimes: raw.available_times ?? ext.availableTimes ?? [],
    recurring_weekdays: raw.recurring_weekdays ?? ext.recurringWeekdays ?? [],
    recurringWeekdays: raw.recurring_weekdays ?? ext.recurringWeekdays ?? [],
    promo_video_url: raw.promo_video_url ?? ext.promoVideoUrl,
    promoVideoUrl: raw.promo_video_url ?? ext.promoVideoUrl,
    promo_video_mobile_url: raw.promo_video_mobile_url ?? ext.promoVideoMobileUrl,
    promoVideoMobileUrl: raw.promo_video_mobile_url ?? ext.promoVideoMobileUrl,
    compare_price: raw.activeCoupon ? (raw.compare_price ?? ext.comparePrice ?? '') : '',
    comparePrice: raw.activeCoupon ? (raw.compare_price ?? ext.comparePrice ?? '') : '',
    displayPrice: ext.displayPrice ?? raw.displayPrice ?? raw.price,
    price: raw.activeCoupon
      ? (ext.displayPrice ?? raw.displayPrice ?? raw.price)
      : (raw.originalPrice ?? raw.original_price ?? ext.displayPrice ?? raw.displayPrice ?? raw.price),
    originalPrice: ext.originalPrice ?? raw.originalPrice ?? raw.original_price ?? raw.price,
    original_price: raw.original_price ?? ext.originalPrice ?? raw.originalPrice ?? raw.price,
    activeCoupon: raw.activeCoupon ?? (raw as Activity & { active_coupon?: Activity["activeCoupon"] }).active_coupon,
    countdown: raw.countdown ?? undefined,
    offerPeriod: raw.offerPeriod ?? undefined,
    offerPeriodActive: raw.offerPeriodActive ?? undefined,
    gallery_urls: raw.gallery_urls ?? raw.gallery ?? ext.galleryUrls,
    gallery: raw.gallery ?? raw.gallery_urls ?? ext.galleryUrls,
    schedule_mode: raw.schedule_mode ?? raw.scheduleMode ?? raw.schedule?.schedule_mode ?? raw.schedule?.scheduleMode,
    scheduleMode: raw.scheduleMode ?? raw.schedule_mode ?? raw.schedule?.scheduleMode ?? raw.schedule?.schedule_mode,
    duration_minutes: raw.duration_minutes ?? raw.durationMinutes ?? raw.schedule?.duration_minutes ?? raw.schedule?.durationMinutes,
    durationMinutes: raw.durationMinutes ?? raw.duration_minutes ?? raw.schedule?.durationMinutes ?? raw.schedule?.duration_minutes,
    buffer_minutes: raw.buffer_minutes ?? raw.bufferMinutes ?? raw.schedule?.buffer_minutes ?? raw.schedule?.bufferMinutes,
    bufferMinutes: raw.bufferMinutes ?? raw.buffer_minutes ?? raw.schedule?.bufferMinutes ?? raw.schedule?.buffer_minutes,
    day_window_start: raw.day_window_start ?? raw.dayWindowStart ?? raw.schedule?.day_window_start ?? raw.schedule?.dayWindowStart,
    dayWindowStart: raw.dayWindowStart ?? raw.day_window_start ?? raw.schedule?.dayWindowStart ?? raw.schedule?.day_window_start,
    day_window_end: raw.day_window_end ?? raw.dayWindowEnd ?? raw.schedule?.day_window_end ?? raw.schedule?.dayWindowEnd,
    dayWindowEnd: raw.dayWindowEnd ?? raw.day_window_end ?? raw.schedule?.dayWindowEnd ?? raw.schedule?.day_window_end,
    slot_capacity: raw.slot_capacity ?? raw.slotCapacity ?? raw.schedule?.slot_capacity ?? raw.schedule?.slotCapacity,
    slotCapacity: raw.slotCapacity ?? raw.slot_capacity ?? raw.schedule?.slotCapacity ?? raw.schedule?.slot_capacity,
    availability_starts_on: raw.availability_starts_on ?? raw.availabilityStartsOn ?? raw.schedule?.availability_starts_on ?? raw.schedule?.availabilityStartsOn,
    availabilityStartsOn: raw.availabilityStartsOn ?? raw.availability_starts_on ?? raw.schedule?.availabilityStartsOn ?? raw.schedule?.availability_starts_on,
    availability_ends_on: raw.availability_ends_on ?? raw.availabilityEndsOn ?? raw.schedule?.availability_ends_on ?? raw.schedule?.availabilityEndsOn,
    availabilityEndsOn: raw.availabilityEndsOn ?? raw.availability_ends_on ?? raw.schedule?.availabilityEndsOn ?? raw.schedule?.availability_ends_on,
    adult_price: raw.adult_price ?? raw.adultPrice ?? raw.schedule?.adult_price ?? raw.schedule?.adultPrice,
    adultPrice: raw.adultPrice ?? raw.adult_price ?? raw.schedule?.adultPrice ?? raw.schedule?.adult_price,
    child_price: raw.child_price ?? raw.childPrice ?? raw.schedule?.child_price ?? raw.schedule?.childPrice,
    childPrice: raw.childPrice ?? raw.child_price ?? raw.schedule?.childPrice ?? raw.schedule?.child_price,
    weekday_prices: raw.weekday_prices ?? raw.weekdayPrices ?? raw.schedule?.weekday_prices ?? raw.schedule?.weekdayPrices,
    weekdayPrices: raw.weekdayPrices ?? raw.weekday_prices ?? raw.schedule?.weekdayPrices ?? raw.schedule?.weekday_prices,
    schedule: raw.schedule,
  };
}

export function activityImageUrl(activity: Activity): string {
  const url = activity.image_url ?? (activity as Activity & { image?: string }).image;
  if (!isValidMediaUrl(url)) return ACTIVITY_FALLBACK_IMAGE;
  return normalizeStorageImageUrl(url);
}

export function hasActivityImage(activity: Activity): boolean {
  const url = activity.image_url ?? (activity as Activity & { image?: string }).image;
  return Boolean(url && url.length > 0);
}

export function activityEndsAt(activity: Activity): string | null {
  const ext = activity as Activity & { ends_at?: string };
  const countdownEnd = activity.countdown?.show ? activity.countdown.endsAt : null;
  if (countdownEnd && String(countdownEnd).trim() !== "") {
    return String(countdownEnd);
  }
  const raw = activity.endsAt ?? ext.ends_at;
  return raw && String(raw).trim() !== "" ? String(raw) : null;
}

export function activityShowCountdown(activity: Activity): boolean {
  return Boolean(activity.countdown?.show && activity.countdown.endsAt);
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
  return raw
    .map((u) => sanitizeExternalImageUrl(u, ACTIVITY_FALLBACK_IMAGE))
    .filter(Boolean);
}

/** Main cover + gallery images, deduplicated. */
export function activityAllImages(activity: Activity): string[] {
  const main = activityImageUrl(activity);
  const extras = activityGalleryUrls(activity).filter((url) => url !== main);
  return [main, ...extras].filter(
    (url, index, list) => isValidMediaUrl(url) && list.indexOf(url) === index,
  );
}

export const DEFAULT_BOOKING_TIMES = [
  "08:00",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
] as const;

export function resolveAvailableTimes(activity: Activity): string[] {
  const raw =
    activity.available_times ??
    (activity as Activity & { availableTimes?: string[] }).availableTimes ??
    [];
  return raw.length > 0 ? [...raw] : [...DEFAULT_BOOKING_TIMES];
}

export function activityPromoVideoUrl(activity: Activity): string | null {
  const raw =
    activity.promo_video_url ??
    (activity as Activity & { promoVideoUrl?: string }).promoVideoUrl;
  return raw && String(raw).trim() !== "" ? String(raw).trim() : null;
}

export function activityPromoVideoMobileUrl(activity: Activity): string | null {
  const raw =
    activity.promo_video_mobile_url ??
    (activity as Activity & { promoVideoMobileUrl?: string }).promoVideoMobileUrl;
  return raw && String(raw).trim() !== "" ? String(raw).trim() : null;
}

/** Slides for activity card carousel (images + optional desktop/mobile video). */
export function activityCardMediaSlides(activity: Activity): ActivityCardMediaSlide[] {
  const slides: ActivityCardMediaSlide[] = activityAllImages(activity).map((url) => ({
    type: "image" as const,
    url,
  }));
  const desktopVideo = activityPromoVideoUrl(activity);
  if (desktopVideo) {
    slides.push({ type: "video", url: desktopVideo, device: "desktop" });
  }
  const mobileVideo = activityPromoVideoMobileUrl(activity);
  if (mobileVideo) {
    slides.push({ type: "video", url: mobileVideo, device: "mobile" });
  }
  return slides.filter((s) => isValidMediaUrl(s.url));
}

export function toActivityCardData(activity: Activity): ActivityCardData {
  const ext = activity as Activity & {
    shortLabel?: string;
    badgeLabel?: string;
    eventDate?: string;
    reviewsCount?: number;
  };

  return {
    slug: activity.slug,
    title: activity.title,
    description: activityShortLabel(activity) || activity.description,
    image: activityImageUrl(activity),
    organizer: activity.organizer ?? activity.provider?.name ?? "Xora",
    location: activity.location,
    eventDate: activity.event_date ?? ext.eventDate,
    price: activity.activeCoupon
      ? (activity.displayPrice ?? activity.price)
      : (activity.originalPrice ?? activity.original_price ?? activity.displayPrice ?? activity.price),
    comparePrice: activity.activeCoupon
      ? (activity.comparePrice ?? activity.compare_price ?? activity.originalPrice ?? activity.original_price)
      : undefined,
    originalPrice: activity.originalPrice ?? activity.original_price ?? activity.price,
    activeCoupon: activity.activeCoupon ?? undefined,
    shortLabel: activityShortLabel(activity) || ext.shortLabel,
    badge: activity.badge,
    badgeLabel: ext.badgeLabel,
    rating: activity.rating,
    reviewsCount: activity.reviews_count ?? ext.reviewsCount,
    socialProofCard: activity.socialProofCard ?? undefined,
    offerPeriod: activity.offerPeriod ?? activity.socialProofCard?.offerPeriod ?? undefined,
    offerPeriodActive: activity.offerPeriodActive ?? undefined,
    showWishlist: activity.showWishlist ?? activity.socialProofCard?.wishlistEnabled ?? true,
    cardHighlight: activity.cardHighlight
      ? {
          label: activity.cardHighlight.label,
          hint: activity.cardHighlight.hint,
          variant:
            activity.cardHighlight.variant === "personal" ? "personal" : "trending",
        }
      : activity.socialProofCard?.highlight
        ? {
            label: activity.socialProofCard.highlight.label,
            hint: activity.socialProofCard.highlight.hint,
            variant:
              activity.socialProofCard.highlight.variant === "personal"
                ? "personal"
                : "trending",
          }
        : undefined,
    endsAt: activityEndsAt(activity) ?? undefined,
    showCountdown: activityShowCountdown(activity),
    mediaSlides: activityCardMediaSlides(activity),
    promoVideoUrl: activityPromoVideoUrl(activity) ?? undefined,
  };
}
