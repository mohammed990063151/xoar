import { getApiBaseUrl } from "@/lib/api-base";
import type { Locale } from "@/lib/i18n";
import { saveFormProfile } from "@/lib/form-profile-cookie";
import type { BookingCheckoutResult, PaymentConfig } from "@/types/payment";
import type { InquiryPayload } from "@/types/api";
import { getCustomerToken } from "@/services/customerService";
import { parseApiError } from "@/lib/parse-api-error";

async function parseJson<T>(res: Response, locale: Locale = "ar"): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const fallback =
      locale === "ar" ? "تعذّر إتمام الحجز. حاول مرة أخرى." : "Booking failed. Please try again.";
    throw new Error(parseApiError(err, fallback, fallback, locale));
  }
  return res.json() as Promise<T>;
}

export const paymentService = {
  async getConfig(locale: Locale): Promise<PaymentConfig> {
    const res = await fetch(`${getApiBaseUrl()}/api/payments/${locale}/config`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await parseJson<{ data: PaymentConfig }>(res, locale);
    return json.data;
  },

  /** Pre-checkout eligibility — grey out Tamara when false; timeout defaults to eligible. */
  async checkTamaraEligibility(input: {
    amount: number;
    currency?: string;
    phone?: string;
    email?: string;
  }): Promise<boolean> {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/payments/tamara/eligibility`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
        cache: "no-store",
      });
      if (!res.ok) return true;
      const json = (await res.json()) as { data?: { eligible?: boolean } };
      return json.data?.eligible !== false;
    } catch {
      return true;
    }
  },

  async submitBooking(payload: InquiryPayload): Promise<BookingCheckoutResult> {
    const token = getCustomerToken();
    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${getApiBaseUrl()}/api/inquiries`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...payload, type: "booking" }),
    });

    const locale = (payload.locale === "en" ? "en" : "ar") as Locale;
    const json = await parseJson<{ data: BookingCheckoutResult }>(res, locale);

    saveFormProfile({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
    });

    return json.data;
  },

  async submitEventBooking(payload: InquiryPayload): Promise<BookingCheckoutResult> {
    const token = getCustomerToken();
    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${getApiBaseUrl()}/api/inquiries`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...payload, type: "event_booking" }),
    });

    const locale = (payload.locale === "en" ? "en" : "ar") as Locale;
    const json = await parseJson<{ data: BookingCheckoutResult }>(res, locale);

    saveFormProfile({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
    });

    return json.data;
  },

  async submitEquipmentBooking(payload: InquiryPayload): Promise<BookingCheckoutResult> {
    const token = getCustomerToken();
    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${getApiBaseUrl()}/api/inquiries`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...payload, type: "equipment_booking" }),
    });

    const locale = (payload.locale === "en" ? "en" : "ar") as Locale;
    const json = await parseJson<{ data: BookingCheckoutResult }>(res, locale);

    saveFormProfile({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
    });

    return json.data;
  },

  async getBookingStatus(code: string): Promise<BookingCheckoutResult> {
    const res = await fetch(
      `${getApiBaseUrl()}/api/bookings/${encodeURIComponent(code)}`,
      { headers: { Accept: "application/json" }, cache: "no-store" },
    );
    const json = await parseJson<{ data: BookingCheckoutResult }>(res);
    return json.data;
  },
};
