"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { toIsoDate, upcomingBookableDays } from "@/lib/booking";
import type { Locale } from "@/lib/i18n";

interface BookingDatePickerProps {
  readonly locale: Locale;
  readonly selected: Date;
  readonly onSelect: (date: Date) => void;
  readonly daysAhead?: number;
  /** When set, only these ISO dates (YYYY-MM-DD) are selectable. */
  readonly bookableIsoSet?: ReadonlySet<string>;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function BookingDatePicker({
  locale,
  selected,
  onSelect,
  daysAhead = 60,
  bookableIsoSet,
}: BookingDatePickerProps): React.ReactElement {
  const bookable = useMemo(() => {
    if (bookableIsoSet && bookableIsoSet.size > 0) {
      return bookableIsoSet;
    }
    return new Set(upcomingBookableDays(daysAhead).map((d) => toIsoDate(d)));
  }, [daysAhead, bookableIsoSet]);

  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selected));
  const ar = locale === "ar";

  const monthLabel = viewMonth.toLocaleDateString(ar ? "ar-SA" : "en-US", {
    month: "long",
    year: "numeric",
  });

  const cells = useMemo(() => {
    const first = startOfMonth(viewMonth);
    const startPad = first.getDay();
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const todayIso = toIsoDate(new Date());

    const items: Array<{ date: Date | null; iso: string; disabled: boolean }> = [];
    for (let i = 0; i < startPad; i++) items.push({ date: null, iso: "", disabled: true });
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
      const iso = toIsoDate(date);
      const disabled = !bookable.has(iso) || iso < todayIso;
      items.push({ date, iso, disabled });
    }
    return items;
  }, [viewMonth, bookable]);

  const weekDays = ar
    ? ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() =>
            setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
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
            setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
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

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell.date) {
            return <span key={`empty-${i}`} className="aspect-square" />;
          }
          const isSelected = toIsoDate(selected) === cell.iso;
          return (
            <button
              key={cell.iso}
              type="button"
              disabled={cell.disabled}
              onClick={() => onSelect(cell.date!)}
              className={cn(
                "aspect-square rounded-lg text-sm font-medium transition",
                isSelected && "bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-md",
                !isSelected &&
                  !cell.disabled &&
                  "text-slate-200 hover:bg-white/10",
                cell.disabled && "cursor-not-allowed text-slate-700",
              )}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
