export function parsePriceAmount(price?: string): number {
  if (!price) return 0;
  const match = price.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number.parseFloat(match[1]) : 0;
}

import { SAR_SYMBOL } from "@/lib/format-price";

export function formatMoney(amount: number, locale: "ar" | "en", currency = "SAR"): string {
  const formatted = amount.toLocaleString(locale === "ar" ? "ar-SA" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return locale === "ar" ? `${formatted} ${SAR_SYMBOL}` : `${formatted} ${currency}`;
}

export function calculateBookingTotal(
  unitPrice: number,
  adults: number,
  children: number,
  days = 1,
): number {
  if (unitPrice <= 0) return 0;
  const dayCount = Math.max(1, Math.floor(days));
  return (unitPrice * adults + unitPrice * 0.5 * children) * dayCount;
}

/** Inclusive ISO date list from dateFrom to dateTo (calendar days). */
export function isoDaysInInclusiveRange(dateFrom: string, dateTo: string): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) return [];
  const end = /^\d{4}-\d{2}-\d{2}$/.test(dateTo) ? dateTo : dateFrom;
  const start = dateFrom <= end ? dateFrom : end;
  const stop = dateFrom <= end ? end : dateFrom;
  const out: string[] = [];
  const cursor = new Date(`${start}T12:00:00`);
  const last = new Date(`${stop}T12:00:00`);
  while (cursor <= last) {
    out.push(toIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

/** Bookable ISO dates inside an inclusive range. */
export function bookableIsoDaysInRange(
  dateFrom: string,
  dateTo: string,
  bookableIsoSet: ReadonlySet<string>,
): string[] {
  return isoDaysInInclusiveRange(dateFrom, dateTo || dateFrom).filter((iso) =>
    bookableIsoSet.has(iso),
  );
}

export function applyCouponDiscount(
  subtotal: number,
  discountType: "percent" | "fixed",
  discountValue: number,
): number {
  if (subtotal <= 0) return 0;
  if (discountType === "fixed") {
    return Math.max(0, subtotal - Math.min(subtotal, discountValue));
  }
  const percent = Math.max(0, Math.min(100, discountValue));
  return Math.max(0, subtotal - subtotal * (percent / 100));
}

export function upcomingBookableDays(count = 42): Date[] {
  const days: Date[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

export function formatDisplayDate(date: Date, locale: "ar" | "en"): string {
  return date.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
