"use client";

import { useEffect, useState } from "react";
import { featureService, type PlatformFeature } from "@/services/featureService";
import type { Locale } from "@/lib/i18n";

export function usePlatformFeatures(
  locale: Locale,
  initialFeatures?: PlatformFeature[],
): {
  features: PlatformFeature[];
  isEnabled: (key: string) => boolean;
  loading: boolean;
} {
  const [features, setFeatures] = useState<PlatformFeature[]>(initialFeatures ?? []);
  const [fromApi, setFromApi] = useState(Boolean(initialFeatures?.length));
  const [loading, setLoading] = useState(!initialFeatures?.length);

  useEffect(() => {
    let active = true;
    featureService
      .list(locale)
      .then(({ features: list, fromApi: loaded }) => {
        if (!active) return;
        setFeatures(list);
        setFromApi(loaded);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [locale]);

  return {
    features,
    loading,
    isEnabled: (key) => featureService.isEnabled(features, key, { fromApi }),
  };
}
