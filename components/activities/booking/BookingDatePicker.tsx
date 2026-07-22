"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { toIsoDate, upcomingBookableDays } from "@/lib/booking";
import type { Locale } from "@/lib/i18n";

interface BookingDatePickerProps {
  readonly locale: Locale;
  /** Inclusive range start (YYYY-MM-DD). */
  readonly dateFrom: string;
  /** Inclusive range end (YYYY-MM-DD). Empty while picking end day. */
  readonly dateTo: string;
  readonly onChange: (next: { dateFrom: string; dateTo: string }) => void;
  readonly daysAhead?: number;
  /** When set, only these ISO dates (YYYY-MM-DD) are selectable. */
  readonly bookableIsoSet?: ReadonlySet<string>;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function parseIso(raw: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function BookingDatePicker({
  locale,
  dateFrom,
  dateTo,
  onChange,
  daysAhead = 90,
  bookableIsoSet,
}: BookingDatePickerProps): React.ReactElement {
  const bookable = useMemo(() => {
    if (bookableIsoSet && bookableIsoSet.size > 0) {
      return bookableIsoSet;
    }
    // Fallback only when no activity schedule — still block past days via todayIso.
    return new Set(upcomingBookableDays(daysAhead).map((d) => toIsoDate(d)));
  }, [daysAhead, bookableIsoSet]);

  const sortedBookable = useMemo(
    () => Array.from(bookable).sort((a, b) => a.localeCompare(b)),
    [bookable],
  );

  const fromDate = parseIso(dateFrom);
  const [viewMonth, setViewMonth] = useState<Date | null>(() =>
    fromDate ? startOfMonth(fromDate) : null,
  );
  const [todayIso, setTodayIso] = useState<string | null>(null);
  const [pickingEnd, setPickingEnd] = useState(Boolean(dateFrom && !dateTo));
  const ar = locale === "ar";

  useEffect(() => {
    const now = new Date();
    setTodayIso(toIsoDate(now));
    const parsed = parseIso(dateFrom);
    if (parsed) {
      setViewMonth(startOfMonth(parsed));
      return;
    }
    const firstBookable = sortedBookable[0] ? parseIso(sortedBookable[0]) : null;
    setViewMonth((prev) => prev ?? startOfMonth(firstBookable ?? now));
  }, [dateFrom, sortedBookable]);

  const monthLabel = viewMonth
    ? viewMonth.toLocaleDateString(ar ? "ar-SA" : "en-US", {
        month: "long",
        year: "numeric",
      })
    : "\u00a0";

  const cells = useMemo(() => {
    if (!viewMonth || !todayIso) return [];
    const first = startOfMonth(viewMonth);
    const startPad = first.getDay();
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();

    const items: Array<{ date: Date | null; iso: string; available: boolean }> = [];
    for (let i = 0; i < startPad; i++) items.push({ date: null, iso: "", available: false });
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
      const iso = toIsoDate(date);
      const available = bookable.has(iso) && iso >= todayIso;
      items.push({ date, iso, available });
    }
    return items;
  }, [viewMonth, bookable, todayIso]);

  const weekDays = ar
    ? ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function inRange(iso: string): boolean {
    if (!dateFrom || !bookable.has(iso)) return false;
    const end = dateTo || dateFrom;
    const a = dateFrom <= end ? dateFrom : end;
    const b = dateFrom <= end ? end : dateFrom;
    return iso >= a && iso <= b;
  }

  function pick(iso: string): void {
    if (!bookable.has(iso) || (todayIso && iso < todayIso)) return;

    // Single available day: select a complete one-day range.
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

    if (iso < dateFrom) {
      onChange({ dateFrom: iso, dateTo: dateFrom });
    } else {
      onChange({ dateFrom, dateTo: iso });
    }
    setPickingEnd(false);
  }

  function clear(): void {
    onChange({ dateFrom: "", dateTo: "" });
    setPickingEnd(false);
  }

  const canGoPrev = Boolean(
    viewMonth &&
      sortedBookable.some((iso) => {
        const d = parseIso(iso);
        if (!d || !viewMonth) return false;
        return (
          d.getFullYear() < viewMonth.getFullYear() ||
          (d.getFullYear() === viewMonth.getFullYear() && d.getMonth() < viewMonth.getMonth())
        );
      }),
  );

  const canGoNext = Boolean(
    viewMonth &&
      sortedBookable.some((iso) => {
        const d = parseIso(iso);
        if (!d || !viewMonth) return false;
        return (
          d.getFullYear() > viewMonth.getFullYear() ||
          (d.getFullYear() === viewMonth.getFullYear() && d.getMonth() > viewMonth.getMonth())
        );
      }),
  );

  const summary =
    dateFrom && dateTo
      ? ar
        ? `من ${dateFrom} إلى ${dateTo}`
        : `${dateFrom} → ${dateTo}`
      : dateFrom
        ? ar
          ? `من ${dateFrom} — اختر يوم النهاية (أو نفس اليوم)`
          : `From ${dateFrom} — pick end day (or same day)`
        : ar
          ? "الأيام المتاحة فقط — اختر البداية ثم النهاية"
          : "Available days only — pick start, then end";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-slate-400">
          {ar ? "الأيام المتاحة فقط (غير المتاح محجوب)" : "Available days only (others blocked)"}
        </p>
        {dateFrom || dateTo ? (
          <button
            type="button"
            onClick={clear}
            className="text-[11px] font-medium text-cyan-300/90 hover:text-cyan-100"
          >
            {ar ? "مسح الفترة" : "Clear range"}
          </button>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={!viewMonth || !canGoPrev}
          onClick={() => {
            if (!viewMonth) return;
            setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
          }}
          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-30"
          aria-label={ar ? "الشهر السابق" : "Previous month"}
        >
          ‹
        </button>
        <p className="text-sm font-semibold text-white">{monthLabel}</p>
        <button
          type="button"
          disabled={!viewMonth || !canGoNext}
          onClick={() => {
            if (!viewMonth) return;
            setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));
          }}
          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-slate-400 hover:bg-white/5 hover:text-white disabled:opacity-30"
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
              if (!cell.date) {
                return <span key={`empty-${i}`} className="aspect-square" />;
              }
              const isStart = dateFrom === cell.iso;
              const isEnd = Boolean(dateFrom) && (dateTo || dateFrom) === cell.iso;
              const selectedEdge = isStart || (dateTo !== "" && isEnd);
              const ranged = inRange(cell.iso);

              if (!cell.available) {
                return (
                  <span
                    key={cell.iso}
                    aria-hidden
                    className="flex aspect-square cursor-not-allowed items-center justify-center rounded-lg text-sm text-slate-700/40 line-through"
                  >
                    {cell.date.getDate()}
                  </span>
                );
              }

              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => pick(cell.iso)}
                  className={cn(
                    "aspect-square rounded-lg text-sm font-semibold transition",
                    selectedEdge &&
                      "bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-md",
                    ranged && !selectedEdge && "bg-violet-500/25 text-violet-50",
                    !ranged &&
                      !selectedEdge &&
                      "border border-cyan-400/30 bg-cyan-500/10 text-cyan-50 hover:bg-cyan-500/20",
                  )}
                >
                  {cell.date.getDate()}
                </button>
              );
            })}
      </div>

      {bookable.size === 0 ? (
        <p className="text-center text-xs text-amber-200/90">
          {ar ? "لا توجد أيام متاحة للحجز حالياً." : "No bookable days available right now."}
        </p>
      ) : (
        <p className="border-t border-white/10 pt-2.5 text-center text-[11px] text-slate-400">
          {summary}
        </p>
      )}
    </div>
  );
}
