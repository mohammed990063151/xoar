import { getApiBaseUrl } from "@/lib/api-base";
import type { Locale } from "@/lib/i18n";

export type PlatformFeature = {
  key: string;
  enabled: boolean;
  name: string;
  group: string;
  config: Record<string, unknown>;
};

export const featureService = {
  async list(locale: Locale): Promise<PlatformFeature[]> {
    const res = await fetch(`${getApiBaseUrl()}/api/site/${locale}/features`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: PlatformFeature[] };
    return json.data ?? [];
  },

  isEnabled(features: PlatformFeature[], key: string): boolean {
    return features.find((f) => f.key === key)?.enabled ?? false;
  },
};
