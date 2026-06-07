import type { Locale } from "@/lib/i18n";

export type ActivityBadgeId =
  | "exclusive"
  | "bestseller"
  | "special_offer"
  | "new"
  | "limited";

const LABELS: Record<ActivityBadgeId, { ar: string; en: string }> = {
  exclusive: { ar: "حصري", en: "Exclusive" },
  bestseller: { ar: "الأفضل مبيعاً", en: "Bestseller" },
  special_offer: { ar: "عرض خاص", en: "Special offer" },
  new: { ar: "جديد", en: "New" },
  limited: { ar: "محدود", en: "Limited" },
};

const STRIP_COLORS: Record<ActivityBadgeId, string> = {
  exclusive: "from-violet-600 to-purple-800",
  bestseller: "from-amber-500 to-orange-600",
  special_offer: "from-rose-500 to-pink-700",
  new: "from-cyan-500 to-blue-600",
  limited: "from-slate-500 to-slate-700",
};

export function activityBadgeLabel(
  badge: string | undefined | null,
  locale: Locale,
  fallbackLabel?: string,
): string | null {
  if (fallbackLabel?.trim()) return fallbackLabel.trim();
  if (!badge) return null;
  const entry = LABELS[badge as ActivityBadgeId];
  if (!entry) return null;
  return locale === "ar" ? entry.ar : entry.en;
}

export function activityBadgeStripClass(badge: string | undefined | null): string {
  if (!badge) return "from-violet-600 to-purple-800";
  return STRIP_COLORS[badge as ActivityBadgeId] ?? STRIP_COLORS.exclusive;
}
