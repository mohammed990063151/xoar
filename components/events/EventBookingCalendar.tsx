"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { toIsoDate } from "@/lib/booking";
import type { Locale } from "@/lib/i18n";
interface CalendarAvailability {
  maxBookingsPerDay: number;
  bookingDaysAhead: number;
  blockedDates: string[];
  bookableDates: string[];
  dayStatuses: Record<
    string,
    { status: string; bookings: number; remaining: number }
  >;
}

interface EventBookingCalendarProps {
  readonly locale: Locale;
  readonly dateFrom: string;
  readonly dateTo: string;
  readonly onChange: (next: { dateFrom: string; dateTo: string }) => void;
  readonly availability?: CalendarAvailability | null;
  readonly daysAhead?: number;
  /** Override heading — e.g. equipment rental */
  readonly heading?: string;
  readonly subheading?: string;
}

type DayStatus = "available" | "blocked" | "full" | "past";

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function parseIso(raw: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function addDays(iso: string, n: number): string {
  const d = parseIso(iso);
  if (!d) return iso;
  d.setDate(d.getDate() + n);
  return toIsoDate(d);
}

export function EventBookingCalendar({
  locale,
  dateFrom,
  dateTo,
  onChange,
  availability,
  daysAhead = 180,
  heading,
  subheading,
}: EventBookingCalendarProps): React.ReactElement {
  const ar = locale === "ar";
  const bookable = useMemo(() => new Set(availability?.bookableDates ?? []), [availability]);
  const statuses = availability?.dayStatuses ?? {};
  const maxPerDay = availability?.maxBookingsPerDay ?? 1;

  const [todayIso, setTodayIso] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState<Date | null>(null);
  const [pickingEnd, setPickingEnd] = useState(Boolean(dateFrom && !dateTo));

  useEffect(() => {
    const now = new Date();
    const iso = toIsoDate(now);
    setTodayIso(iso);
    const first = availability?.bookableDates?.[0];
    const anchor = parseIso(dateFrom || first || iso) ?? now;
    setViewMonth((prev) => prev ?? startOfMonth(anchor));
  }, [availability, dateFrom]);

  const horizonEnd = todayIso ? addDays(todayIso, daysAhead) : null;

  const cells = useMemo(() => {
    if (!viewMonth || !todayIso) return [];
    const first = startOfMonth(viewMonth);
    const startPad = first.getDay();
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const items: Array<{ date: Date | null; iso: string; status: DayStatus; bookings: number; remaining: number }> =
      [];
    for (let i = 0; i < startPad; i++) {
      items.push({ date: null, iso: "", status: "past", bookings: 0, remaining: 0 });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
      const iso = toIsoDate(date);
      const meta = statuses[iso];
      let status: DayStatus = (meta?.status as DayStatus) || "past";
      if (iso < todayIso) status = "past";
      else if (horizonEnd && iso > horizonEnd) status = "past";
      else if (bookable.has(iso)) status = "available";
      else if (status !== "blocked" && status !== "full") status = "blocked";
      items.push({
        date,
        iso,
        status,
        bookings: meta?.bookings ?? 0,
        remaining: meta?.remaining ?? 0,
      });
    }
    return items;
  }, [viewMonth, todayIso, bookable, statuses, horizonEnd]);

  const weekDays = ar
    ? ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const monthLabel = viewMonth
    ? viewMonth.toLocaleDateString(ar ? "ar-SA" : "en-US", { month: "long", year: "numeric" })
    : "\u00a0";

  function inRange(iso: string): boolean {
    if (!dateFrom || !bookable.has(iso)) return false;
    const end = dateTo || dateFrom;
    const a = dateFrom <= end ? dateFrom : end;
    const b = dateFrom <= end ? end : dateFrom;
    return iso >= a && iso <= b;
  }

  function pick(iso: string, status: DayStatus): void {
    if (status !== "available") return;
    if (bookable.size === 1) {
      onChange({ dateFrom: iso, dateTo: iso });
      setPickingEnd(false);
      return;
    }
    if (!dateFrom || (dateFrom && dateTo) || !pickingEnd) {
      onChange({ dateFrom: iso, dateTo: "" });
      setPickingEnd(true);
      return;
    }
    if (iso < dateFrom) onChange({ dateFrom: iso, dateTo: dateFrom });
    else onChange({ dateFrom, dateTo: iso });
    setPickingEnd(false);
  }

  const summary =
    dateFrom && dateTo
      ? ar
        ? `من ${dateFrom} إلى ${dateTo}`
        : `${dateFrom} → ${dateTo}`
      : dateFrom
        ? ar
          ? `من ${dateFrom} — اختر يوم النهاية أو نفس اليوم`
          : `From ${dateFrom} — pick end day or same day`
        : ar
          ? "اختر يوم البداية ثم النهاية"
          : "Pick start day, then end day";

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-gradient-to-b from-violet-500/10 via-transparent to-cyan-500/5 p-3.5 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">
            {heading ?? (ar ? "اختر يوم الفعالية" : "Choose event day")}
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">
            {subheading ??
              (ar
                ? `اليوم يستوعب حتى ${maxPerDay} حجز${maxPerDay > 1 ? "ات" : ""} — الأيام المقفلة أو المكتملة غير قابلة للاختيار.`
                : `Up to ${maxPerDay} booking${maxPerDay > 1 ? "s" : ""} per day — locked or full days can’t be selected.`)}
          </p>
        </div>
        {(dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => {
              onChange({ dateFrom: "", dateTo: "" });
              setPickingEnd(false);
            }}
            className="text-[11px] font-medium text-cyan-300/90 hover:text-cyan-100"
          >
            {ar ? "مسح" : "Clear"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2 py-0.5 text-emerald-100">
          <i className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden />
          {ar ? "متاح" : "Open"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-400/25 bg-rose-500/10 px-2 py-0.5 text-rose-100">
          <i className="h-1.5 w-1.5 rounded-full bg-rose-300" aria-hidden />
          {ar ? "مقفل" : "Locked"}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-500/10 px-2 py-0.5 text-amber-100">
          <i className="h-1.5 w-1.5 rounded-full bg-amber-300" aria-hidden />
          {ar ? "مكتمل" : "Full"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() =>
            viewMonth && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
          }
          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
          aria-label={ar ? "الشهر السابق" : "Previous month"}
        >
          ‹
        </button>
        <p className="text-sm font-semibold text-white">{monthLabel}</p>
        <button
          type="button"
          onClick={() =>
            viewMonth && setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
          }
          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
          aria-label={ar ? "الشهر التالي" : "Next month"}
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-500">
        {weekDays.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="grid min-h-[14.5rem] grid-cols-7 gap-1">
        {cells.length === 0
          ? Array.from({ length: 35 }, (_, i) => (
              <span key={`skel-${i}`} className="aspect-square rounded-lg bg-white/[0.03]" />
            ))
          : cells.map((cell, i) => {
              if (!cell.date) return <span key={`empty-${i}`} className="aspect-square" />;

              const isStart = dateFrom === cell.iso;
              const isEnd = Boolean(dateFrom) && (dateTo || dateFrom) === cell.iso;
              const selectedEdge = isStart || (dateTo !== "" && isEnd);
              const ranged = inRange(cell.iso);

              if (cell.status !== "available") {
                return (
                  <span
                    key={cell.iso}
                    title={
                      cell.status === "full"
                        ? ar
                          ? `مكتمل (${cell.bookings}/${maxPerDay})`
                          : `Full (${cell.bookings}/${maxPerDay})`
                        : cell.status === "blocked"
                          ? ar
                            ? "مقفل من الإدارة"
                            : "Locked by admin"
                          : undefined
                    }
                    className={cn(
                      "flex aspect-square flex-col items-center justify-center rounded-lg text-sm",
                      cell.status === "full" &&
                        "border border-amber-400/30 bg-amber-500/10 text-amber-200/70",
                      cell.status === "blocked" &&
                        "border border-rose-400/25 bg-rose-500/10 text-rose-200/60 line-through",
                      cell.status === "past" && "text-slate-700/40 line-through",
                    )}
                  >
                    <span className="font-semibold leading-none">{cell.date.getDate()}</span>
                    {cell.status === "full" || cell.status === "blocked" ? (
                      <span className="mt-0.5 text-[9px] leading-none opacity-80">
                        {cell.status === "full" ? (ar ? "مكتمل" : "Full") : ar ? "مقفل" : "Lock"}
                      </span>
                    ) : null}
                  </span>
                );
              }

              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => pick(cell.iso, cell.status)}
                  title={
                    ar
                      ? `متاح — متبقي ${cell.remaining || maxPerDay}`
                      : `Open — ${cell.remaining || maxPerDay} left`
                  }
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center rounded-lg text-sm font-semibold transition",
                    selectedEdge &&
                      "bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-md",
                    ranged && !selectedEdge && "bg-violet-500/25 text-violet-50",
                    !ranged &&
                      !selectedEdge &&
                      "border border-emerald-400/35 bg-emerald-500/15 text-emerald-50 hover:bg-emerald-500/25",
                  )}
                >
                  <span className="leading-none">{cell.date.getDate()}</span>
                  {maxPerDay > 1 ? (
                    <span className="mt-0.5 text-[9px] font-medium opacity-75">
                      {cell.remaining || maxPerDay}/{maxPerDay}
                    </span>
                  ) : null}
                </button>
              );
            })}
      </div>

      {bookable.size === 0 ? (
        <p className="text-center text-xs text-amber-200/90">
          {ar ? "لا توجد أيام متاحة حالياً." : "No bookable days right now."}
        </p>
      ) : (
        <p className="border-t border-white/10 pt-2.5 text-center text-[11px] text-slate-400">
          {summary}
        </p>
      )}
    </div>
  );
}
