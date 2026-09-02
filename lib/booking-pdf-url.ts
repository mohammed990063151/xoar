import { getApiBaseUrl } from "@/lib/api-base";

export type BookingPdfTheme = "light" | "dark";

export function bookingPdfUrl(code: string, theme: BookingPdfTheme = "dark"): string {
  const base = getApiBaseUrl();
  const params = new URLSearchParams({ theme });
  return `${base}/api/bookings/${encodeURIComponent(code)}/pdf?${params.toString()}`;
}
