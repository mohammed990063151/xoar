import { laravelFetch } from "@/lib/laravel-fetch";
import type { Locale } from "@/lib/i18n";
import type {
  EventOffering,
  EventOfferingAudience,
} from "@/types/event-offering";

export const eventOfferingService = {
  async list(
    locale: Locale,
    audience: EventOfferingAudience,
    perPage = 24,
  ): Promise<EventOffering[]> {
    const params = new URLSearchParams({
      audience,
      per_page: String(perPage),
    });
    const res = await laravelFetch(
      `/api/event-offerings/${locale}?${params}`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: EventOffering[] };
    return json.data ?? [];
  },

  async get(
    locale: Locale,
    slug: string,
    audience?: EventOfferingAudience,
  ): Promise<EventOffering | null> {
    const params = audience ? `?audience=${audience}` : "";
    const res = await laravelFetch(
      `/api/event-offerings/${locale}/${encodeURIComponent(slug)}${params}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: EventOffering };
    return json.data ?? null;
  },
};
