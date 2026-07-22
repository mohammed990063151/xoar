import { getApiBaseUrl } from "@/lib/api-base";
import { customerCache } from "@/lib/customer-cache";
import { parseApiError } from "@/lib/parse-api-error";
import type { Locale } from "@/lib/i18n";
import type {
  Customer,
  CustomerAuthResponse,
  CustomerBooking,
  CustomerGroupBooking,
  CustomerInquiry,
  CustomerNotification,
  CustomerReferral,
  CustomerWallet,
  PartnerApplyStatus,
} from "@/types/customer";

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
    customerCache.clear();
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

async function authFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = getCustomerToken();
  if (!token) {
    throw new Error("UNAUTHENTICATED");
  }
  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...authHeaders(token),
      ...(init?.headers ?? {}),
    },
  });
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
    customerCache.setMe(json.data.customer);
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
    customerCache.setMe(json.data.customer);
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
    const cached = customerCache.getMe();
    if (cached !== undefined) return cached;

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
    customerCache.setMe(json.data);
    return json.data;
  },

  async bookings(): Promise<CustomerBooking[]> {
    const cached = customerCache.getBookings();
    if (cached !== undefined) return cached;

    const token = getCustomerToken();
    if (!token) return [];
    const res = await fetch(`${getApiBaseUrl()}/api/customer/bookings?per_page=40`, {
      headers: authHeaders(token),
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { data: CustomerBooking[] };
    const list = json.data ?? [];
    customerCache.setBookings(list);
    return list;
  },

  async wallet(): Promise<CustomerWallet | null> {
    try {
      const res = await authFetch("/api/customer/wallet");
      if (!res.ok) return null;
      const json = (await res.json()) as { data: CustomerWallet };
      return json.data;
    } catch {
      return null;
    }
  },

  async notifications(): Promise<{
    items: CustomerNotification[];
    unreadCount: number;
  }> {
    try {
      const res = await authFetch("/api/customer/notifications");
      if (!res.ok) return { items: [], unreadCount: 0 };
      const json = (await res.json()) as {
        data: CustomerNotification[];
        unreadCount: number;
      };
      return { items: json.data ?? [], unreadCount: json.unreadCount ?? 0 };
    } catch {
      return { items: [], unreadCount: 0 };
    }
  },

  async markNotificationRead(id: number): Promise<void> {
    try {
      await authFetch(`/api/customer/notifications/${id}/read`, { method: "POST" });
    } catch {
      /* ignore */
    }
  },

  async markAllNotificationsRead(): Promise<void> {
    try {
      await authFetch("/api/customer/notifications/read-all", { method: "POST" });
    } catch {
      /* ignore */
    }
  },

  async partnerStatus(): Promise<PartnerApplyStatus | null> {
    try {
      const res = await authFetch("/api/customer/partner");
      if (!res.ok) return null;
      const json = (await res.json()) as { data: PartnerApplyStatus };
      return json.data;
    } catch {
      return null;
    }
  },

  async applyPartner(
    payload: {
      partner_business_name: string;
      partner_activity_type: string;
      phone: string;
      city: string;
      partner_request_message: string;
    },
    locale: Locale = "ar",
  ): Promise<PartnerApplyStatus> {
    const res = await authFetch("/api/customer/partner/apply", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        parseApiError(
          err,
          "تعذّر إرسال طلب الشراكة",
          "Could not submit partner application",
          locale,
        ),
      );
    }
    const json = (await res.json()) as { data: PartnerApplyStatus };
    return json.data;
  },

  async updateProfile(
    payload: {
      name?: string;
      phone?: string | null;
      city?: string | null;
      birth_date?: string | null;
      locale?: string;
    },
    locale: Locale = "ar",
  ): Promise<Customer> {
    const res = await authFetch("/api/customer/me", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        parseApiError(err, "تعذّر حفظ الملف", "Could not save profile", locale),
      );
    }
    const json = (await res.json()) as { data: Customer };
    customerCache.setMe(json.data);
    return json.data;
  },

  async updatePassword(
    currentPassword: string,
    password: string,
    passwordConfirmation: string,
    locale: Locale = "ar",
  ): Promise<void> {
    const res = await authFetch("/api/customer/password", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
        locale,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        parseApiError(err, "تعذّر تغيير كلمة المرور", "Could not change password", locale),
      );
    }
    const json = (await res.json()) as { data?: { token?: string; customer?: Customer } };
    if (json.data?.token) {
      setCustomerToken(json.data.token);
    }
    if (json.data?.customer) {
      customerCache.setMe(json.data.customer);
    }
  },

  async groupBookings(): Promise<{
    led: CustomerGroupBooking[];
    joined: CustomerGroupBooking[];
  }> {
    try {
      const res = await authFetch("/api/customer/group-bookings");
      if (!res.ok) return { led: [], joined: [] };
      const json = (await res.json()) as {
        data: { led: CustomerGroupBooking[]; joined: CustomerGroupBooking[] };
      };
      return { led: json.data?.led ?? [], joined: json.data?.joined ?? [] };
    } catch {
      return { led: [], joined: [] };
    }
  },

  async referral(): Promise<CustomerReferral | null> {
    try {
      const res = await authFetch("/api/customer/referral");
      if (!res.ok) return null;
      const json = (await res.json()) as { data: CustomerReferral };
      return json.data;
    } catch {
      return null;
    }
  },

  async inquiries(): Promise<CustomerInquiry[]> {
    try {
      const res = await authFetch("/api/customer/inquiries");
      if (!res.ok) return [];
      const json = (await res.json()) as { data: CustomerInquiry[] };
      return json.data ?? [];
    } catch {
      return [];
    }
  },
};
