export function parsePriceAmount(price?: string): number {
  if (!price) return 0;
  const match = price.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number.parseFloat(match[1]) : 0;
}

export function formatMoney(amount: number, locale: "ar" | "en", currency = "SAR"): string {
  const formatted = amount.toLocaleString(locale === "ar" ? "ar-SA" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return locale === "ar" ? `${formatted} ر.س` : `${formatted} ${currency}`;
}

export function calculateBookingTotal(
  unitPrice: number,
  adults: number,
  children: number,
): number {
  if (unitPrice <= 0) return 0;
  return unitPrice * adults + unitPrice * 0.5 * children;
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
