"use client";

import type { Locale } from "@/lib/i18n";

interface SocialProofData {
  totalBookings?: number;
  bookingsLast24h?: number;
  seatsLeft?: number | null;
  messageAr?: string;
  messageEn?: string;
}

interface ActivitySocialProofProps {
  readonly locale: Locale;
  readonly data?: SocialProofData | null;
  readonly enabled: boolean;
}

export function ActivitySocialProof({
  locale,
  data,
  enabled,
}: ActivitySocialProofProps): React.ReactElement | null {
  if (!enabled || !data) return null;

  const message = locale === "ar" ? data.messageAr : data.messageEn;
  if (!message?.trim()) return null;

  return (
    <div className="flex flex-wrap gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
      <span aria-hidden>✓</span>
      <span>{message}</span>
    </div>
  );
}
