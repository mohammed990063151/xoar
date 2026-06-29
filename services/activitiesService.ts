import { getApiBaseUrl } from "@/lib/api-base";
import type { Locale } from "@/lib/i18n";
import type { Activity, PaginatedResponse } from "@/types/api";

export interface ActivityFilters {
  search?: string;
  location?: string;
  city?: string;
  category?: string;
  date?: string;
  badge?: string;
  per_page?: number;
}

export interface ActivityFilterOptions {
  cities: string[];
  categories: string[];
  dates: string[];
  badges: string[];
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`API ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const activitiesService = {
  async list(
    locale: Locale,
    filters: ActivityFilters = {},
  ): Promise<PaginatedResponse<Activity>> {
    const qs = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        qs.set(key, String(value));
      }
    });
    const res = await fetch(
      `${getApiBaseUrl()}/api/activities/${locale}?${qs}`,
      { headers: { Accept: "application/json" }, next: { revalidate: 60 } },
    );
    return parseJson(res);
  },

  async filterOptions(locale: Locale): Promise<ActivityFilterOptions> {
    const res = await fetch(
      `${getApiBaseUrl()}/api/activities/${locale}/filters`,
      { headers: { Accept: "application/json" }, next: { revalidate: 300 } },
    );
    const json = await parseJson<{ data: ActivityFilterOptions }>(res);
    return json.data;
  },
};
