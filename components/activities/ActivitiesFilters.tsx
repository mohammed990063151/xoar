"use client";

import { useEffect, useState } from "react";
import { activitiesService, type ActivityFilterOptions } from "@/services/activitiesService";
import { bookingLabels } from "@/lib/booking-labels";
import type { Locale } from "@/lib/i18n";

export interface ActivitiesFilterState {
  city: string;
  date: string;
  category: string;
}

interface ActivitiesFiltersProps {
  readonly locale: Locale;
  readonly value: ActivitiesFilterState;
  readonly onChange: (next: ActivitiesFilterState) => void;
  readonly fallbackCategories?: string[];
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
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
          <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M3 5h14M5 5V3h10v2M6 9h2M6 13h2M12 9h2M12 13h2" />
          </svg>
        </span>
        {ar ? "تصفية جغرافية" : "Geo filters"}
      </p>

      <FilterSelect
        label={ar ? "المدينة" : "City"}
        value={value.city}
        options={options.cities}
        placeholder={ar ? "اختر أو اكتب المدينة" : "Select or type city"}
        onChange={(city) => onChange({ ...value, city })}
      />

      <FilterSelect
        label={ar ? "التاريخ" : "Date"}
        value={value.date}
        options={options.dates}
        placeholder={ar ? "اختر التاريخ" : "Select date"}
        onChange={(date) => onChange({ ...value, date })}
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
