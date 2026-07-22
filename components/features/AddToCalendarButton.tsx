"use client";

import { buildActivityIcs, downloadIcsFile } from "@/lib/calendar-ics";
import { localizedPath, type Locale } from "@/lib/i18n";
import type { Activity } from "@/types/api";

interface AddToCalendarButtonProps {
  readonly activity: Activity;
  readonly locale: Locale;
  readonly enabled: boolean;
}

function parseStart(activity: Activity): Date | null {
  const raw = activity.endsAt ?? activity.event_date ?? activity.eventDate;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function AddToCalendarButton({
  activity,
  locale,
  enabled,
}: AddToCalendarButtonProps): React.ReactElement | null {
  const ar = locale === "ar";
  const start = parseStart(activity);
  if (!enabled || !start) return null;

  const eventStart = start;
  const path = localizedPath(locale, `/activities/${activity.slug}`);

  function googleUrl(): string {
    const end = new Date(eventStart.getTime() + 2 * 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const q = new URLSearchParams({
      action: "TEMPLATE",
      text: activity.title,
      dates: `${fmt(eventStart)}/${fmt(end)}`,
      details: activity.description?.slice(0, 200) ?? "",
      location: activity.location ?? "",
    });
    return `https://calendar.google.com/calendar/render?${q.toString()}`;
  }

  function downloadApple(): void {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const ics = buildActivityIcs({
      title: activity.title,
      description: activity.description,
      location: activity.location,
      start: eventStart,
      url: origin ? `${origin}${path}` : path,
    });
    downloadIcsFile(`${activity.slug}.ics`, ics);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <p className="w-full text-xs font-medium uppercase tracking-wider text-slate-500">
        {ar ? "أضف إلى التقويم" : "Add to calendar"}
      </p>
      <a
        href={googleUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
      >
        Google
      </a>
      <button
        type="button"
        onClick={downloadApple}
        className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-200 hover:bg-white/10"
      >
        {ar ? "Apple / Outlook (.ics)" : "Apple / Outlook (.ics)"}
      </button>
    </div>
  );
}
