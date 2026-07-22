"use client";

import { useEffect, useMemo, useState } from "react";
import { activitiesService, type ActivityFilterOptions } from "@/services/activitiesService";
import { bookingLabels } from "@/lib/booking-labels";
import { cn } from "@/lib/cn";
import { toIsoDate } from "@/lib/booking";
import type { Locale } from "@/lib/i18n";

export interface ActivitiesFilterState {
  city: string;
  dateFrom: string;
  dateTo: string;
  category: string;
}

interface ActivitiesFiltersProps {
  readonly locale: Locale;
  readonly value: ActivitiesFilterState;
  readonly onChange: (next: ActivitiesFilterState) => void;
  readonly fallbackCategories?: string[];
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function parseIso(raw: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const d = new Date(`${raw}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function FilterSelect({
  label,
  value,
  options,
  placeholder,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly options: string[];
  readonly placeholder: string;
  readonly onChange: (v: string) => void;
}): React.ReactElement {
  const listId = `${label.replace(/\s/g, "-")}-suggestions`;

  return (
    <label className="block text-sm text-slate-400">
      {label}
      <input
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400/50"
        autoComplete="off"
      />
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </label>
  );
}

function FilterDateRangeCalendar({
  locale,
  dateFrom,
  dateTo,
  availableDates,
  onChange,
}: {
  readonly locale: Locale;
  readonly dateFrom: string;
  readonly dateTo: string;
  readonly availableDates: string[];
  readonly onChange: (next: { dateFrom: string; dateTo: string }) => void;
}): React.ReactElement {
  const ar = locale === "ar";
  const bookable = useMemo(() => new Set(availableDates.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))), [availableDates]);

  const fromDate = parseIso(dateFrom);
  const toDate = parseIso(dateTo);
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(fromDate ?? toDate ?? new Date()),
  );
  /** First click sets start; second click sets end. */
  const [pickingEnd, setPickingEnd] = useState(Boolean(dateFrom && !dateTo));

  useEffect(() => {
    if (fromDate) setViewMonth(startOfMonth(fromDate));
  }, [dateFrom]);

  const monthLabel = viewMonth.toLocaleDateString(ar ? "ar-SA" : "en-US", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ar
    ? ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const cells = useMemo(() => {
    const first = startOfMonth(viewMonth);
    const startPad = first.getDay();
    const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
    const todayIso = toIsoDate(new Date());
    const items: Array<{ date: Date | null; iso: string; disabled: boolean; hasEvent: boolean }> = [];

    for (let i = 0; i < startPad; i++) {
      items.push({ date: null, iso: "", disabled: true, hasEvent: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
      const iso = toIsoDate(date);
      items.push({
        date,
        iso,
        disabled: iso < todayIso,
        hasEvent: bookable.has(iso),
      });
    }
    return items;
  }, [viewMonth, bookable]);

  function inRange(iso: string): boolean {
    if (!dateFrom) return false;
    const end = dateTo || dateFrom;
    const a = dateFrom <= end ? dateFrom : end;
    const b = dateFrom <= end ? end : dateFrom;
    return iso >= a && iso <= b;
  }

  function pick(iso: string): void {
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

  const summary =
    dateFrom && dateTo
      ? ar
        ? `من ${dateFrom} إلى ${dateTo}`
        : `${dateFrom} → ${dateTo}`
      : dateFrom
        ? ar
          ? `من ${dateFrom} — اختر يوم النهاية`
          : `From ${dateFrom} — pick end day`
        : ar
          ? "اختر يوم البداية ثم يوم النهاية"
          : "Pick start day, then end day";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-400">{ar ? "الفترة" : "Date range"}</p>
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

      <div className="rounded-2xl border border-white/10 bg-black/40 p-3 sm:p-3.5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() =>
              setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
            }
            className="rounded-lg border border-white/10 px-2.5 py-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
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
            className="rounded-lg border border-white/10 px-2.5 py-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
            aria-label={ar ? "الشهر التالي" : "Next month"}
          >
            ›
          </button>
        </div>

        <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-500">
          {weekDays.map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell.date) {
              return <span key={`empty-${i}`} className="aspect-square" />;
            }
            const isStart = dateFrom === cell.iso;
            const isEnd = (dateTo || dateFrom) === cell.iso && Boolean(dateFrom);
            const selectedEdge = isStart || (dateTo !== "" && isEnd);
            const ranged = inRange(cell.iso);

            return (
              <button
                key={cell.iso}
                type="button"
                disabled={cell.disabled}
                onClick={() => pick(cell.iso)}
                className={cn(
                  "relative aspect-square rounded-lg text-sm font-medium transition",
                  selectedEdge &&
                    "bg-gradient-to-br from-cyan-500 to-teal-400 text-slate-950 shadow-md",
                  ranged && !selectedEdge && "bg-cyan-500/20 text-cyan-50",
                  !ranged &&
                    !selectedEdge &&
                    !cell.disabled &&
                    "text-slate-200 hover:bg-white/10",
                  cell.disabled && "cursor-not-allowed text-slate-700",
                )}
              >
                {cell.date.getDate()}
                {cell.hasEvent && !selectedEdge ? (
                  <span className="absolute bottom-1 start-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-400/80" />
                ) : null}
              </button>
            );
          })}
        </div>

        <p className="mt-3 border-t border-white/10 pt-2.5 text-center text-[11px] text-slate-400">
          {summary}
        </p>
      </div>
    </div>
  );
}

export function ActivitiesFilters({
  locale,
  value,
  onChange,
  fallbackCategories = [],
}: ActivitiesFiltersProps): React.ReactElement {
  const labels = bookingLabels(locale);
  const ar = locale === "ar";
  const [options, setOptions] = useState<ActivityFilterOptions>({
    cities: [],
    categories: fallbackCategories,
    dates: [],
    badges: [],
  });

  useEffect(() => {
    activitiesService
      .filterOptions(locale)
      .then(setOptions)
      .catch(() => undefined);
  }, [locale]);

  const categories =
    options.categories.length > 0 ? options.categories : fallbackCategories;

  return (
    <div className="space-y-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-300">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path d="M3 5h14M5 5V3h10v2M6 9h2M6 13h2M12 9h2M12 13h2" />
          </svg>
        </span>
        {ar ? "تصفية" : "Filters"}
      </p>

      <FilterSelect
        label={ar ? "المدينة" : "City"}
        value={value.city}
        options={options.cities}
        placeholder={ar ? "اختر أو اكتب المدينة" : "Select or type city"}
        onChange={(city) => onChange({ ...value, city })}
      />

      <FilterDateRangeCalendar
        locale={locale}
        dateFrom={value.dateFrom}
        dateTo={value.dateTo}
        availableDates={options.dates}
        onChange={({ dateFrom, dateTo }) => onChange({ ...value, dateFrom, dateTo })}
      />

      <div>
        <p className="text-sm text-slate-400">{labels.filterCategory}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...value, category: "" })}
            className={
              !value.category
                ? "rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-medium text-cyan-100"
                : "rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            }
          >
            {labels.all}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => onChange({ ...value, category: cat })}
              className={
                value.category === cat
                  ? "rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-medium text-cyan-100"
                  : "rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              }
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
