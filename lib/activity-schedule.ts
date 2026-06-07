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

export function parseActivityEventDate(activity: Activity): Date | null {
  const raw = activity.event_date ?? (activity as Activity & { eventDate?: string }).eventDate;
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parsed = new Date(`${trimmed}T12:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

/** Dates the customer can pick in the booking calendar. */
export function resolveBookableDays(activity: Activity, daysAhead = 60): Date[] {
  const upcoming = upcomingBookableDays(daysAhead);
  const weekdays = activityRecurringWeekdays(activity);
  const eventDate = parseActivityEventDate(activity);

  if (weekdays.length > 0) {
    return upcoming.filter((d) => weekdays.includes(d.getDay()));
  }

  if (eventDate) {
    const iso = toIsoDate(eventDate);
    return upcoming.filter((d) => toIsoDate(d) === iso);
  }

  return upcoming;
}

export function resolveBookableIsoSet(activity: Activity, daysAhead = 60): Set<string> {
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
