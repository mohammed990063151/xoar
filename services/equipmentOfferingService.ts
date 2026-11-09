import { getApiBaseUrl } from "@/lib/api-base";
import type { Locale } from "@/lib/i18n";
import type {
  EquipmentAudience,
  EquipmentOffering,
  EquipmentQuote,
} from "@/types/equipment-offering";

export const equipmentOfferingService = {
  async list(
    locale: Locale,
    audience: EquipmentAudience | "all" = "all",
    perPage = 24,
  ): Promise<EquipmentOffering[]> {
    const params = new URLSearchParams({
      audience,
      per_page: String(perPage),
    });
    const res = await fetch(
      `${getApiBaseUrl()}/api/equipment-offerings/${locale}?${params}`,
      { headers: { Accept: "application/json" }, cache: "no-store" },
    );
    if (!res.ok) return [];
    const json = (await res.json()) as { data?: EquipmentOffering[] };
    return json.data ?? [];
  },

  async get(locale: Locale, slug: string, audience?: EquipmentAudience): Promise<EquipmentOffering | null> {
    const params = audience && audience !== "both" ? `?audience=${audience}` : "";
    const res = await fetch(
      `${getApiBaseUrl()}/api/equipment-offerings/${locale}/${encodeURIComponent(slug)}${params}`,
      { headers: { Accept: "application/json" }, cache: "no-store" },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: EquipmentOffering };
    return json.data ?? null;
  },

  async quote(
    locale: Locale,
    slug: string,
    packageIds: number[],
    audience?: EquipmentAudience,
  ): Promise<EquipmentQuote | null> {
    const params = new URLSearchParams();
    if (packageIds.length) params.set("package_ids", packageIds.join(","));
    if (audience) params.set("audience", audience);
    const qs = params.toString();
    const res = await fetch(
      `${getApiBaseUrl()}/api/equipment-offerings/${locale}/${encodeURIComponent(slug)}/quote${qs ? `?${qs}` : ""}`,
      { headers: { Accept: "application/json" }, cache: "no-store" },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: EquipmentQuote };
    return json.data ?? null;
  },
};
