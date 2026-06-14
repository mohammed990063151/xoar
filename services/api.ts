import { getApiBaseUrl } from "@/lib/api-base";
import { skipApiDuringBuild } from "@/lib/skip-api-during-build";
import type {
  Activity,
  ApiResponse,
  BookingConfirmation,
  InquiryPayload,
  PaginatedResponse,
  SiteSettings,
} from "@/types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      body.message ?? `Request failed (${res.status})`,
      res.status,
      body.errors,
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const siteApi = {
  settings: (locale: string) =>
    api<ApiResponse<SiteSettings>>(`/api/site/${locale}/settings`),

  home: (locale: string) =>
    api<ApiResponse<Record<string, unknown>>>(`/api/site/${locale}/home`),

  page: (locale: string, page: string) =>
    api<ApiResponse<Record<string, unknown>>>(`/api/site/${locale}/pages/${page}`),

  event: (locale: string, slug: string) =>
    api<ApiResponse<Record<string, unknown>>>(`/api/site/${locale}/events/${slug}`),

  submitInquiry: (payload: InquiryPayload) =>
    api<ApiResponse<BookingConfirmation>>("/api/inquiries", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  bookingPdfUrl: (confirmationCode: string) =>
    `/api/bookings/${encodeURIComponent(confirmationCode)}/pdf`,
};

export const activitiesApi = {
  list: (locale: string, params?: { search?: string; location?: string; per_page?: number; page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.location) qs.set("location", params.location);
    if (params?.per_page) qs.set("per_page", String(params.per_page));
    if (params?.page) qs.set("page", String(params.page));
    const query = qs.toString();
    return api<PaginatedResponse<Activity>>(
      `/api/activities/${locale}${query ? `?${query}` : ""}`,
    );
  },

  get: (locale: string, slug: string) =>
    api<ApiResponse<Activity>>(`/api/activities/${locale}/${slug}`),
};

export async function serverFetch<T>(
  path: string,
  options?: { cache?: RequestCache; revalidate?: number },
): Promise<T | null> {
  if (skipApiDuringBuild()) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);

  try {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
      headers: { Accept: "application/json" },
      cache: options?.cache === "no-store" ? "no-store" : "default",
      signal: controller.signal,
      next:
        options?.cache === "no-store"
          ? undefined
          : { revalidate: options?.revalidate ?? 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
