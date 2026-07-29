"use client";

import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";

interface ActivityOfferPeriodProps {
  readonly locale: Locale;
  readonly offerPeriod?: string | null;
  readonly active?: boolean;
  readonly className?: string;
  readonly variant?: "card" | "detail" | "sidebar";
}

export function ActivityOfferPeriod({
  locale,
  offerPeriod,
  active = false,
  className,
  variant = "detail",
}: ActivityOfferPeriodProps): React.ReactElement | null {
  const label = offerPeriod?.trim();
  if (!label) return null;

  const ar = locale === "ar";

  if (variant === "card") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-amber-100 shadow-sm backdrop-blur-md",
          className,
        )}
      >
        {active ? (
          <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-400" aria-hidden />
        ) : null}
        {label}
      </span>
    );
  }

  if (variant === "sidebar") {
    return (
      <div
        className={cn(
          "rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/15 to-orange-500/5 px-4 py-3",
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-lg"
            aria-hidden
          >
            🏷
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-200/80">
                {ar ? "فترة العرض" : "Offer period"}
              </p>
              {active ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden />
                  {ar ? "ظاهر الآن" : "Live now"}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm font-semibold text-amber-50">{label}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-3 min-[400px]:col-span-2",
        className,
      )}
    >
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-lg"
        aria-hidden
      >
        🏷
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-200/80">
            {ar ? "فترة العرض" : "Offer period"}
          </p>
          {active ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" aria-hidden />
              {ar ? "ظاهر الآن" : "Live now"}
            </span>
          ) : null}
        </div>
        <p className="text-sm font-medium text-amber-50">{label}</p>
      </div>
    </div>
  );
}
