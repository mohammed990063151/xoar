import { getApiBaseUrl } from "@/lib/api-base";
import {
  defaultPlatformFeatures,
  resolveFeatureEnabled,
} from "@/lib/platform-features";
import type { Locale } from "@/lib/i18n";

export type PlatformFeature = {
  key: string;
  enabled: boolean;
  name: string;
  group: string;
  config: Record<string, unknown>;
};

export const featureService = {
  async list(locale: Locale): Promise<{ features: PlatformFeature[]; fromApi: boolean }> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/site/${locale}/features`, {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
      });
      if (!res.ok) {
        return { features: defaultPlatformFeatures(), fromApi: false };
      }
      const json = (await res.json()) as { data?: PlatformFeature[] };
      const features = json.data ?? [];
      if (features.length === 0) {
        return { features: defaultPlatformFeatures(), fromApi: false };
      }
      return { features, fromApi: true };
    } catch {
      return { features: defaultPlatformFeatures(), fromApi: false };
    }
  },

  isEnabled(
    features: PlatformFeature[],
    key: string,
    options?: { fromApi?: boolean },
  ): boolean {
    return resolveFeatureEnabled(features, key, {
      apiLoaded: options?.fromApi ?? features.length > 0,
    });
  },
};
