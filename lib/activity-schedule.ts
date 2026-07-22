import {
  DEFAULT_BOOKING_TIMES,
  resolveAvailableTimes,
} from "@/lib/activity";
import { toIsoDate, upcomingBookableDays } from "@/lib/booking";
import type { Activity } from "@/types/api";

/** 0 = Sunday … 6 = Saturday (matches JS Date.getDay()). */
export function activityRecurringWeekdays(activity: Activity): number[] {
  const raw =
    activity.recurring_weekdays ??
    (activity as Activity & { recurringWeekdays?: number[] }).recurringWeekdays ??
    [];
  return raw
    .map((d) => Number(d))
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
}

export function isActivityRecurring(activity: Activity): boolean {
  return activityRecurringWeekdays(activity).length > 0;
}

const ARABIC_MONTHS: Record<string, number> = {
  يناير: 1,
  فبراير: 2,
  مارس: 3,
  أبريل: 4,
  ابريل: 4,
  مايو: 5,
  يونيو: 6,
  يوليو: 7,
  أغسطس: 8,
  اغسطس: 8,
  سبتمبر: 9,
  أكتوبر: 10,
  اكتوبر: 10,
  نوفمبر: 11,
  ديسمبر: 12,
};

/** Parse ISO or Arabic Gregorian strings (e.g. "18 يوليو 2026"). */
export function parseLocalizedEventDate(raw?: string | null): Date | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const parsed = new Date(`${trimmed.slice(0, 10)}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const arabic = trimmed.match(/^(\d{1,2})\s+([^\s\d]+)\s+(\d{4})$/u);
  if (arabic) {
    const day = Number(arabic[1]);
    const month = ARABIC_MONTHS[arabic[2]];
    const year = Number(arabic[3]);
    if (month && day >= 1 && day <= 31) {
      const parsed = new Date(year, month - 1, day, 12, 0, 0);
      if (
        !Number.isNaN(parsed.getTime()) &&
        parsed.getFullYear() === year &&
        parsed.getMonth() === month - 1 &&
        parsed.getDate() === day
      ) {
        return parsed;
      }
    }
  }

  const fallback = new Date(trimmed);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export function parseActivityEventDate(activity: Activity): Date | null {
  const raw = activity.event_date ?? (activity as Activity & { eventDate?: string }).eventDate;
  return parseLocalizedEventDate(typeof raw === "string" ? raw : null);
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
}

/** Dates the customer can pick in the booking calendar. */
export function resolveBookableDays(activity: Activity, daysAhead = 90): Date[] {
  const today = startOfLocalDay(new Date());
  const todayIso = toIsoDate(today);
  const weekdays = activityRecurringWeekdays(activity);
  const eventDate = parseActivityEventDate(activity);

  if (weekdays.length > 0) {
    return upcomingBookableDays(daysAhead).filter((d) => weekdays.includes(d.getDay()));
  }

  if (eventDate) {
    const event = startOfLocalDay(eventDate);
    const iso = toIsoDate(event);
    if (iso >= todayIso) {
      return [event];
    }
    return [];
  }

  return upcomingBookableDays(daysAhead);
}

export function resolveBookableIsoSet(activity: Activity, daysAhead = 90): Set<string> {
  return new Set(resolveBookableDays(activity, daysAhead).map((d) => toIsoDate(d)));
}

/** Times shown after the user picks a date. */
export function resolveAvailableTimesForDate(
  activity: Activity,
  date: Date,
): string[] {
  const slots = resolveAvailableTimes(activity);
  const times = slots.length > 0 ? slots : [...DEFAULT_BOOKING_TIMES];
  const weekdays = activityRecurringWeekdays(activity);

  if (weekdays.length > 0) {
    return weekdays.includes(date.getDay()) ? times : [];
  }

  const eventDate = parseActivityEventDate(activity);
  if (eventDate && toIsoDate(date) !== toIsoDate(eventDate)) {
    return [];
  }

  return times;
}
