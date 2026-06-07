"use client";

import { useEffect, useState } from "react";
import {
  recommendationShortLabel,
  type RecommendationHighlightVariant,
} from "@/components/ui/RecommendationHighlightBadge";
import { getApiBaseUrl } from "@/lib/api-base";
import type { Locale } from "@/lib/i18n";

export type ActivityHighlightMeta = {
  label: string;
  variant: RecommendationHighlightVariant;
  hint?: string;
};

export function useActivityRecommendations(
  locale: Locale,
  enabled: boolean,
): {
  highlightedSlugs: Set<string>;
  getHighlight: (slug: string) => ActivityHighlightMeta | undefined;
} {
  const [slugSet, setSlugSet] = useState<Set<string>>(new Set());
  const [meta, setMeta] = useState<ActivityHighlightMeta | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSlugSet(new Set());
      setMeta(null);
      return;
    }
    fetch(`${getApiBaseUrl()}/api/activities/${locale}/recommendations`, {
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json())
      .then(
        (json: {
          data?: { reason?: string; activities?: { slug: string }[] };
        }) => {
          const slugs = (json.data?.activities ?? []).map((a) => a.slug);
          setSlugSet(new Set(slugs));
          const reason = json.data?.reason ?? "";
          setMeta(recommendationShortLabel(reason, locale));
        },
      )
      .catch(() => {
        setSlugSet(new Set());
        setMeta(null);
      });
  }, [locale, enabled]);

  return {
    highlightedSlugs: slugSet,
    getHighlight: (slug) => (slugSet.has(slug) && meta ? meta : undefined),
  };
}
