import {
  DEFAULT_BOOKING_TIMES,
  resolveAvailableTimes,
} from "@/lib/activity";
import { parsePriceAmount, toIsoDate, upcomingBookableDays } from "@/lib/booking";
import type { Activity, ActivityBookingSlot, ActivityWeekdayPrices } from "@/types/api";

/** 0 = Sunday … 6 = Saturday (matches JS Date.getDay()). */
export function activityRecurringWeekdays(activity: Activity): number[] {
  const raw =
    activity.recurring_weekdays ??
    activity.recurringWeekdays ??
    activity.schedule?.recurringWeekdays ??
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
  const raw = activity.event_date ?? activity.eventDate;
  return parseLocalizedEventDate(typeof raw === "string" ? raw : null);
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);
}

function scheduleField<T>(activity: Activity, camel: keyof NonNullable<Activity["schedule"]>, snake: string): T | undefined {
  const schedule = activity.schedule;
  if (schedule && schedule[camel] !== undefined && schedule[camel] !== null) {
    return schedule[camel] as T;
  }
  const ext = activity as Activity & Record<string, unknown>;
  if (ext[snake] !== undefined && ext[snake] !== null) {
    return ext[snake] as T;
  }
  if (ext[camel as string] !== undefined && ext[camel as string] !== null) {
    return ext[camel as string] as T;
  }
  return undefined;
}

export function activityScheduleMode(activity: Activity): "explicit" | "generated" {
  const mode = scheduleField<string>(activity, "scheduleMode", "schedule_mode");
  return mode === "generated" ? "generated" : "explicit";
}

function timeToMinutes(value?: string | null): number | null {
  if (!value) return null;
  const match = String(value).trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function minutesToHhMm(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Generate start times from duration + buffer + day window. */
export function generateStartTimes(activity: Activity): string[] {
  const duration = Number(
    scheduleField<number>(activity, "durationMinutes", "duration_minutes") ?? 0,
  );
  const buffer = Math.max(
    0,
    Number(scheduleField<number>(activity, "bufferMinutes", "buffer_minutes") ?? 0),
  );
  const start = timeToMinutes(
    scheduleField<string>(activity, "dayWindowStart", "day_window_start") ?? null,
  );
  const end = timeToMinutes(
    scheduleField<string>(activity, "dayWindowEnd", "day_window_end") ?? null,
  );
  if (!duration || start === null || end === null || end <= start) return [];

  const times: string[] = [];
  let cursor = start;
  while (cursor + duration <= end) {
    times.push(minutesToHhMm(cursor));
    cursor += duration + buffer;
  }
  return times;
}

export function usesGeneratedSchedule(activity: Activity): boolean {
  return activityScheduleMode(activity) === "generated" && generateStartTimes(activity).length > 0;
}

function withinAvailabilityWindow(activity: Activity, day: Date): boolean {
  const starts = scheduleField<string>(activity, "availabilityStartsOn", "availability_starts_on");
  const ends = scheduleField<string>(activity, "availabilityEndsOn", "availability_ends_on");
  const iso = toIsoDate(day);
  if (starts && iso < starts.slice(0, 10)) return false;
  if (ends && iso > ends.slice(0, 10)) return false;
  return true;
}

export function usesCalendarSchedule(activity: Activity): boolean {
  const schedule = activity.schedule;
  if (schedule?.usesCalendarSchedule === true) return true;
  const bookable = schedule?.bookableDates ?? schedule?.bookable_dates;
  return Array.isArray(bookable) && bookable.length > 0;
}

function calendarBookableIsoDates(activity: Activity): string[] {
  const schedule = activity.schedule;
  const raw = schedule?.bookableDates ?? schedule?.bookable_dates ?? [];
  return raw
    .map((d) => String(d).slice(0, 10))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
}

/** Dates the customer can pick in the booking calendar. */
export function resolveBookableDays(activity: Activity, daysAhead = 90): Date[] {
  if (usesCalendarSchedule(activity)) {
    const todayIso = toIsoDate(startOfLocalDay(new Date()));
    return calendarBookableIsoDates(activity)
      .filter((iso) => iso >= todayIso)
      .slice(0, daysAhead)
      .map((iso) => new Date(`${iso}T12:00:00`));
  }

  const today = startOfLocalDay(new Date());
  const todayIso = toIsoDate(today);
  const weekdays = activityRecurringWeekdays(activity);
  const eventDate = parseActivityEventDate(activity);

  let days: Date[] = [];

  if (weekdays.length > 0) {
    days = upcomingBookableDays(daysAhead).filter((d) => weekdays.includes(d.getDay()));
  } else if (eventDate) {
    const event = startOfLocalDay(eventDate);
    const iso = toIsoDate(event);
    days = iso >= todayIso ? [event] : [];
  } else {
    days = upcomingBookableDays(daysAhead);
  }

  return days.filter((d) => withinAvailabilityWindow(activity, d));
}

export function resolveBookableIsoSet(activity: Activity, daysAhead = 90): Set<string> {
  return new Set(resolveBookableDays(activity, daysAhead).map((d) => toIsoDate(d)));
}

/** Times shown after the user picks a date (local generation / explicit list). */
export function resolveAvailableTimesForDate(activity: Activity, date: Date): string[] {
  const weekdays = activityRecurringWeekdays(activity);
  if (weekdays.length > 0 && !weekdays.includes(date.getDay())) {
    return [];
  }

  const eventDate = parseActivityEventDate(activity);
  if (eventDate && toIsoDate(date) !== toIsoDate(eventDate)) {
    return [];
  }

  if (!withinAvailabilityWindow(activity, date)) {
    return [];
  }

  if (usesGeneratedSchedule(activity)) {
    return generateStartTimes(activity);
  }

  const explicit =
    activity.available_times ??
    activity.availableTimes ??
    [];
  if (explicit.length > 0) {
    return [...explicit];
  }

  // Legacy fallback only for activities without schedule config.
  if (activityScheduleMode(activity) === "generated") {
    return [];
  }

  const slots = resolveAvailableTimes(activity);
  return slots.length > 0 ? slots : [...DEFAULT_BOOKING_TIMES];
}

export function guestUnitPricesForDate(
  activity: Activity,
  date: Date,
): { adult: number; child: number } {
  const weekdayPrices =
    (scheduleField<ActivityWeekdayPrices>(activity, "weekdayPrices", "weekday_prices") ??
      {}) as ActivityWeekdayPrices;
  const override = weekdayPrices[String(date.getDay())] ?? weekdayPrices[date.getDay()];

  let adultRaw =
    (override && (override.adult || override.adult_price)) ||
    scheduleField<string>(activity, "adultPrice", "adult_price") ||
    activity.adult_price ||
    activity.adultPrice ||
    activity.price;
  let childRaw =
    (override && (override.child || override.child_price)) ||
    scheduleField<string>(activity, "childPrice", "child_price") ||
    activity.child_price ||
    activity.childPrice;

  const adult = parsePriceAmount(adultRaw ?? undefined);
  let child = parsePriceAmount(childRaw ?? undefined);
  if (child <= 0 && adult > 0) {
    child = Math.round(adult * 0.5 * 100) / 100;
  }
  return { adult, child };
}

export function calculateGuestBookingTotal(
  adultPrice: number,
  childPrice: number,
  adults: number,
  children: number,
  days = 1,
): number {
  if (adultPrice <= 0) return 0;
  const dayCount = Math.max(1, Math.floor(days));
  return (adultPrice * Math.max(1, adults) + childPrice * Math.max(0, children)) * dayCount;
}

export type LiveBookingSlot = ActivityBookingSlot & {
  time: string;
};
