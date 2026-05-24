"use client";

import { useState } from "react";
import Link from "next/link";
import { ActivityBookingModal } from "@/components/activities/ActivityBookingModal";
import type { Activity } from "@/types/api";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

interface ActivityDetailActionsProps {
  readonly activity: Activity;
  readonly locale: Locale;
  readonly bookLabel: string;
}

export function ActivityDetailActions({
  activity,
  locale,
  bookLabel,
}: ActivityDetailActionsProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-10 flex flex-wrap gap-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex rounded-full bg-gradient-to-l from-violet-600 to-cyan-500 px-8 py-3 font-semibold text-white"
        >
          {bookLabel}
        </button>
        <Link
          href={localizedPath(locale, "/activities")}
          className="inline-flex rounded-full border border-white/15 px-8 py-3 text-slate-300 hover:text-white"
        >
          {locale === "ar" ? "← العودة" : "← Back"}
        </Link>
      </div>
      {open ? (
        <ActivityBookingModal
          activity={activity}
          locale={locale}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
