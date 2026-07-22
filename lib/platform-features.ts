import type { PlatformFeature } from "@/services/featureService";

/**
 * Mirrors `default_enabled` in xoar_laravel/config/platform_features.php.
 * Used when the features API is unreachable (common on misconfigured production hosts).
 */
export const DEFAULT_PLATFORM_FEATURE_FLAGS: Readonly<Record<string, boolean>> = {
  ai_recommendations: true,
  group_booking: true,
  waitlist: true,
  map_discovery: true,
  bundles: true,
  referrals: true,
  wallet: true,
  gift_cards: false,
  booking_gift: true,
  social_proof: true,
  countdown: true,
  calendar_export: true,
  points_rewards: true,
  membership_plus: false,
  ai_assistant: false,
  ticket_resale: false,
  post_event_photos: false,
  live_now: false,
  vip_tiers: false,
};

export function defaultPlatformFeatures(): PlatformFeature[] {
  return Object.entries(DEFAULT_PLATFORM_FEATURE_FLAGS).map(([key, enabled]) => ({
    key,
    enabled,
    name: key,
    group: "default",
    config: {},
  }));
}

export function resolveFeatureEnabled(
  features: readonly PlatformFeature[],
  key: string,
  options?: { apiLoaded?: boolean },
): boolean {
  const row = features.find((f) => f.key === key);
  if (row !== undefined) return row.enabled;

  // Unknown / missing keys: use product defaults (never hide core booking UX on partial APIs).
  return DEFAULT_PLATFORM_FEATURE_FLAGS[key] ?? false;
}
