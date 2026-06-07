import { getApiBaseUrl } from "@/lib/api-base";
import { parseApiError } from "@/lib/parse-api-error";
import type { Locale } from "@/lib/i18n";
import type { Customer, CustomerAuthResponse, CustomerBooking } from "@/types/customer";

const TOKEN_KEY = "xoar_customer_token";

function authHeaders(token: string): HeadersInit {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  return token && token.length > 20 ? token : null;
}

export function setCustomerToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

export const customerService = {
  async register(payload: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    password_confirmation: string;
    locale?: string;
  }): Promise<CustomerAuthResponse> {
    const res = await fetch(`${getApiBaseUrl()}/api/customer/register`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const locale = (payload.locale === "en" ? "en" : "ar") as Locale;
      throw new Error(
        parseApiError(err, "تعذّر إنشاء الحساب", "Registration failed", locale),
      );
    }
    const json = (await res.json()) as { data: CustomerAuthResponse };
    setCustomerToken(json.data.token);
    return json.data;
  },

  async login(
    email: string,
    password: string,
    locale: Locale = "ar",
  ): Promise<CustomerAuthResponse> {
    const res = await fetch(`${getApiBaseUrl()}/api/customer/login`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, locale }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        parseApiError(
          err,
          "البريد الإلكتروني أو كلمة المرور غير صحيحة",
          "Invalid email or password",
          locale,
        ),
      );
    }
    const json = (await res.json()) as { data: CustomerAuthResponse };
    setCustomerToken(json.data.token);
    return json.data;
  },

  logout(): void {
    const token = getCustomerToken();
    if (token) {
      void fetch(`${getApiBaseUrl()}/api/customer/logout`, {
        method: "POST",
        headers: authHeaders(token),
      });
    }
    setCustomerToken(null);
  },

  async me(): Promise<Customer | null> {
    const token = getCustomerToken();
    if (!token) return null;
    const res = await fetch(`${getApiBaseUrl()}/api/customer/me`, {
      headers: authHeaders(token),
    });
    if (!res.ok) {
      setCustomerToken(null);
      return null;
    }
    const json = (await res.json()) as { data: Customer };
    return json.data;
  },

  async bookings(): Promise<CustomerBooking[]> {
    const token = getCustomerToken();
    if (!token) return [];
    const res = await fetch(`${getApiBaseUrl()}/api/customer/bookings`, {
      headers: authHeaders(token),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: CustomerBooking[] };
    return json.data ?? [];
  },
};
