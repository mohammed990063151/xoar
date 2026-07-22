import { getApiBaseUrl } from "@/lib/api-base";
import type { Locale } from "@/lib/i18n";

export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  code?: string;
  label?: string | null;
  discountType?: "percent" | "fixed";
  discountValue?: number;
  subtotal?: number;
  discount?: number;
  total?: number;
}

export const couponService = {
  async validate(
    locale: Locale,
    slug: string,
    code: string,
    adults: number,
    children: number,
    days = 1,
  ): Promise<CouponValidationResult> {
    const res = await fetch(
      `${getApiBaseUrl()}/api/activities/${locale}/${encodeURIComponent(slug)}/coupons/validate`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, adults, children, days }),
      },
    );

    const json = (await res.json().catch(() => ({}))) as {
      valid?: boolean;
      message?: string;
      data?: Omit<CouponValidationResult, "valid" | "message">;
    };

    if (!res.ok) {
      return {
        valid: false,
        message: json.message ?? "كود الخصم غير صالح.",
      };
    }

    return {
      valid: true,
      message: json.message,
      ...json.data,
    };
  },
};
