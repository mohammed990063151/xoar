import { getApiBaseUrl } from "@/lib/api-base";
import type { Locale } from "@/lib/i18n";
import type { BookingCheckoutResult, PaymentConfig } from "@/types/payment";
import type { InquiryPayload } from "@/types/api";
import { getCustomerToken } from "@/services/customerService";

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ?? `Request failed (${res.status})`,
    );
  }
  return res.json() as Promise<T>;
}

export const paymentService = {
  async getConfig(locale: Locale): Promise<PaymentConfig> {
    const res = await fetch(`${getApiBaseUrl()}/api/payments/${locale}/config`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const json = await parseJson<{ data: PaymentConfig }>(res);
    return json.data;
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

    const json = await parseJson<{ data: BookingCheckoutResult }>(res);
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
