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

export type LiveBookingSlot = ActivityBookingSlot & {
  time: string;
};

/** Display HH:MM as 12-hour clock with AM/PM. */
export function formatTime12h(value?: string | null): string {
  const minutes = timeToMinutes(value ?? null);
  if (minutes === null) return value || "—";
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatTimeRange12h(start?: string | null, end?: string | null): string {
  if (start && end) return `${formatTime12h(start)} – ${formatTime12h(end)}`;
  return formatTime12h(start || end || "");
}

export type DayWindow = {
  start: string;
  end: string;
  adult_price?: string;
  child_price?: string;
};

export type BookingShiftGroup = {
  id: string;
  labelKey: "morning" | "afternoon" | "evening" | "shift";
  labelIndex: number;
  start: string;
  end: string;
  adultPriceAmount?: number;
  childPriceAmount?: number;
  slots: LiveBookingSlot[];
};

function normalizeDayWindows(raw: unknown): DayWindow[] {
  if (!Array.isArray(raw)) return [];
  const windows: DayWindow[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const start = String((row as { start?: string; from?: string }).start
      ?? (row as { from?: string }).from
      ?? "").trim();
    const end = String((row as { end?: string; to?: string }).end
      ?? (row as { to?: string }).to
      ?? "").trim();
    const startMin = timeToMinutes(start);
    const endMin = timeToMinutes(end);
    if (startMin === null || endMin === null || endMin <= startMin) continue;
    const window: DayWindow = {
      start: minutesToHhMm(startMin),
      end: minutesToHhMm(endMin),
    };
    const adult = String((row as { adult_price?: string; adult?: string }).adult_price
      ?? (row as { adult?: string }).adult
      ?? "").trim();
    const child = String((row as { child_price?: string; child?: string }).child_price
      ?? (row as { child?: string }).child
      ?? "").trim();
    if (adult) window.adult_price = adult;
    if (child) window.child_price = child;
    windows.push(window);
  }
  windows.sort((a, b) => a.start.localeCompare(b.start));
  return windows;
}

export function resolveDayWindows(activity: Activity, extraWindows?: unknown): DayWindow[] {
  const fromExtra = normalizeDayWindows(extraWindows);
  if (fromExtra.length > 0) return fromExtra;

  const fromSchedule = scheduleField<DayWindow[]>(activity, "dayWindows", "day_windows");
  const normalized = normalizeDayWindows(fromSchedule);
  if (normalized.length > 0) return normalized;

  const ext = activity as Activity & { dayWindows?: DayWindow[] | null; day_windows?: DayWindow[] | null };
  const fromActivity = normalizeDayWindows(ext.dayWindows ?? ext.day_windows);
  if (fromActivity.length > 0) return fromActivity;

  const start = scheduleField<string>(activity, "dayWindowStart", "day_window_start");
  const end = scheduleField<string>(activity, "dayWindowEnd", "day_window_end");
  return normalizeDayWindows([{ start: start ?? "", end: end ?? "" }]);
}

function shiftLabelKey(start: string): BookingShiftGroup["labelKey"] {
  const minutes = timeToMinutes(start);
  if (minutes === null) return "shift";
  if (minutes < 12 * 60) return "morning";
  if (minutes < 17 * 60) return "afternoon";
  return "evening";
}

function parseOptionalAmount(value?: string | null): number | undefined {
  if (!value) return undefined;
  const amount = parsePriceAmount(value);
  return amount > 0 ? amount : undefined;
}

function inferWindowsFromSlotGaps(slots: LiveBookingSlot[], gapMinutes = 180): DayWindow[] {
  if (slots.length < 2) return [];
  const sorted = [...slots].sort((a, b) => a.time.localeCompare(b.time));
  const groups: string[][] = [[sorted[0].time]];
  for (let i = 1; i < sorted.length; i++) {
    const prev = timeToMinutes(sorted[i - 1].time);
    const curr = timeToMinutes(sorted[i].time);
    if (prev === null || curr === null || curr - prev >= gapMinutes) {
      groups.push([sorted[i].time]);
    } else {
      groups[groups.length - 1].push(sorted[i].time);
    }
  }
  if (groups.length < 2) return [];
  return groups.map((times) => ({
    start: times[0],
    end: minutesToHhMm((timeToMinutes(times[times.length - 1]) ?? 0) + 60),
  }));
}

/** Prefer the narrowest matching window so overlapping shifts never duplicate a slot. */
function bestWindowIndexForTime(time: string, windows: DayWindow[]): number {
  const minutes = timeToMinutes(time);
  if (minutes === null) return -1;

  let best = -1;
  let bestWidth = Number.POSITIVE_INFINITY;
  windows.forEach((window, index) => {
    const start = timeToMinutes(window.start);
    const end = timeToMinutes(window.end);
    if (start === null || end === null || end <= start) return;
    if (minutes < start || minutes >= end) return;
    const width = end - start;
    if (width < bestWidth || (width === bestWidth && (best < 0 || index < best))) {
      bestWidth = width;
      best = index;
    }
  });
  return best;
}

function windowsOverlap(windows: DayWindow[]): boolean {
  for (let i = 0; i < windows.length; i++) {
    const aStart = timeToMinutes(windows[i].start);
    const aEnd = timeToMinutes(windows[i].end);
    if (aStart === null || aEnd === null) continue;
    for (let j = i + 1; j < windows.length; j++) {
      const bStart = timeToMinutes(windows[j].start);
      const bEnd = timeToMinutes(windows[j].end);
      if (bStart === null || bEnd === null) continue;
      if (aStart < bEnd && bStart < aEnd) return true;
    }
  }
  return false;
}

/** Group booking slots into morning/evening (or custom) shifts for a tidy live UI. */
export function groupSlotsByShifts(
  slots: LiveBookingSlot[],
  windowsInput?: unknown,
): BookingShiftGroup[] {
  const sorted = [...slots].sort((a, b) => a.time.localeCompare(b.time));
  if (sorted.length === 0) return [];

  let windows = normalizeDayWindows(windowsInput);
  if (windows.length < 2 || windowsOverlap(windows)) {
    const inferred = inferWindowsFromSlotGaps(sorted);
    if (inferred.length >= 2) {
      windows = inferred;
    } else if (windows.length < 2) {
      windows = [];
    }
  }
  if (windows.length < 2) {
    return [{
      id: "all",
      labelKey: "shift",
      labelIndex: 1,
      start: sorted[0].time,
      end: sorted[sorted.length - 1].time,
      slots: sorted,
    }];
  }

  const buckets: LiveBookingSlot[][] = windows.map(() => []);
  const leftover: LiveBookingSlot[] = [];

  sorted.forEach((slot) => {
    const index = bestWindowIndexForTime(slot.time, windows);
    if (index >= 0) buckets[index].push(slot);
    else leftover.push(slot);
  });

  const groups: BookingShiftGroup[] = windows.map((window, index) => {
    const groupSlots = buckets[index];
    const pricedSlot = groupSlots.find((slot) => typeof slot.adultPriceAmount === "number");
    const labelKey =
      windows.length === 2
        ? (index === 0 ? "morning" : "evening")
        : shiftLabelKey(window.start);
    return {
      id: `shift-${index + 1}-${window.start}`,
      labelKey,
      labelIndex: index + 1,
      start: window.start,
      end: window.end,
      adultPriceAmount: pricedSlot?.adultPriceAmount
        ?? parseOptionalAmount(window.adult_price),
      childPriceAmount: pricedSlot?.childPriceAmount
        ?? parseOptionalAmount(window.child_price),
      slots: groupSlots,
    };
  }).filter((group) => group.slots.length > 0);

  if (leftover.length > 0) {
    groups.push({
      id: "other",
      labelKey: "shift",
      labelIndex: groups.length + 1,
      start: leftover[0].time,
      end: leftover[leftover.length - 1].time,
      slots: leftover,
    });
  }

  return groups;
}

function generateTimesForWindow(duration: number, buffer: number, start: number, end: number): string[] {
  const times: string[] = [];
  let cursor = start;
  while (cursor + duration <= end) {
    times.push(minutesToHhMm(cursor));
    cursor += duration + buffer;
  }
  return times;
}

/** Generate start times from duration + buffer + day window(s)/shifts. */
export function generateStartTimes(activity: Activity): string[] {
  const duration = Number(
    scheduleField<number>(activity, "durationMinutes", "duration_minutes") ?? 0,
  );
  const buffer = Math.max(
    0,
    Number(scheduleField<number>(activity, "bufferMinutes", "buffer_minutes") ?? 0),
  );
  if (!duration) return [];

  const fromApi = scheduleField<string[]>(activity, "generatedTimes", "generated_times");
  if (Array.isArray(fromApi) && fromApi.length > 0) {
    return [...fromApi];
  }

  const windows = resolveDayWindows(activity);
  if (windows.length === 0) return [];

  const times = new Set<string>();
  for (const window of windows) {
    const start = timeToMinutes(window.start);
    const end = timeToMinutes(window.end);
    if (start === null || end === null) continue;
    for (const time of generateTimesForWindow(duration, buffer, start, end)) {
      times.add(time);
    }
  }
  return Array.from(times).sort();
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

function soldOutIsoSet(activity: Activity): Set<string> {
  const schedule = activity.schedule;
  const raw = schedule?.soldOutDates ?? schedule?.sold_out_dates ?? [];
  return new Set(raw.map((d) => String(d).slice(0, 10)));
}

/** Dates the customer can pick in the booking calendar (fully booked days excluded). */
export function resolveBookableDays(activity: Activity, daysAhead = 90): Date[] {
  const soldOut = soldOutIsoSet(activity);
  return resolveScheduledDays(activity, daysAhead).filter((d) => !soldOut.has(toIsoDate(d)));
}

function resolveScheduledDays(activity: Activity, daysAhead: number): Date[] {
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
