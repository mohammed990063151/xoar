"use client";

import { useEffect, useState } from "react";
import { featureService, type PlatformFeature } from "@/services/featureService";
import type { Locale } from "@/lib/i18n";

export function usePlatformFeatures(locale: Locale): {
  features: PlatformFeature[];
  isEnabled: (key: string) => boolean;
  loading: boolean;
} {
  const [features, setFeatures] = useState<PlatformFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    featureService
      .list(locale)
      .then((list) => {
        if (active) setFeatures(list);
      })
      .catch(() => {
        if (active) setFeatures([]);
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
    isEnabled: (key) => featureService.isEnabled(features, key),
  };
}
