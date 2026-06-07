import type { Locale } from "@/lib/i18n";

/** Official Saudi Riyal sign (Unicode). */
export const SAR_SYMBOL = "\u{20C1}";

/** Strip currency text/symbols and keep the numeric amount only. */
export function extractPriceAmount(value: string | number | null | undefined): string {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value)
    .replace(/\u{20C1}/gu, "")
    .replace(/ر\.س/giu, "")
    .replace(/ريال/gu, "")
    .replace(/sar/giu, "")
    .replace(/[^\d.,]/g, "")
    .trim();
}

/**
 * Formats a price for display: amount + Riyal symbol (no "ر.س" / "ريال" text).
 */
export function formatSarPrice(
  price: string | number | undefined | null,
  locale: Locale,
): string {
  const amount = extractPriceAmount(price);
  if (!amount) {
    return `— ${SAR_SYMBOL}`;
  }

  return `${amount} ${SAR_SYMBOL}`;
}
