"use client";

import Image from "next/image";
import { useEffect } from "react";
import { ACTIVITY_FALLBACK_IMAGE } from "@/lib/activity";
import { formatMoney } from "@/lib/booking";
import { cn } from "@/lib/cn";
import { formatSarPrice } from "@/lib/format-price";
import type { Locale } from "@/lib/i18n";
/** Shared shape for event / equipment add-on package modals */
export interface PackageDetailsContent {
  id: number;
  title: string;
  description?: string | null;
  details?: string | null;
  features?: string[];
  works?: Array<{
    title: string;
    description?: string | null;
    image?: string | null;
  }>;
  image?: string | null;
  price?: string | null;
  priceAmount: number;
  badge?: string | null;
}

interface PackageDetailsModalProps {
  readonly locale: Locale;
  readonly pkg: PackageDetailsContent | null;
  readonly selected: boolean;
  readonly onClose: () => void;
  readonly onToggleSelect: () => void;
}

export function PackageDetailsModal({
  locale,
  pkg,
  selected,
  onClose,
  onToggleSelect,
}: PackageDetailsModalProps): React.ReactElement | null {
  const ar = locale === "ar";

  useEffect(() => {
    if (!pkg) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [pkg, onClose]);

  if (!pkg) return null;

  const priceLabel =
    pkg.priceAmount > 0
      ? `+${formatMoney(pkg.priceAmount, locale)}`
      : pkg.price
        ? `+${formatSarPrice(pkg.price, locale)}`
        : null;
  const features = (pkg.features ?? []).filter((f) => f.trim());
  const works = (pkg.works ?? []).filter((w) => w.title?.trim());
  const details = pkg.details?.trim() || pkg.description?.trim() || "";

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="package-details-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
        aria-label={ar ? "إغلاق" : "Close"}
        onClick={onClose}
      />

      <div className="relative z-[1] flex max-h-[min(92vh,880px)] w-full max-w-2xl flex-col overflow-hidden rounded-[1.5rem] border border-white/12 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-slate-900">
          <Image
            src={pkg.image || ACTIVITY_FALLBACK_IMAGE}
            alt={pkg.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute end-3 top-3 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/70"
          >
            {ar ? "إغلاق" : "Close"}
          </button>
          {pkg.badge ? (
            <span className="absolute start-3 top-3 rounded-full border border-amber-300/30 bg-amber-400/20 px-2.5 py-1 text-[10px] font-semibold text-amber-100 backdrop-blur">
              {pkg.badge}
            </span>
          ) : null}
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/80">
              {ar ? "تفاصيل الباقة" : "Package details"}
            </p>
            <h2 id="package-details-title" className="mt-1 text-xl font-bold text-white sm:text-2xl">
              {pkg.title}
            </h2>
            {priceLabel ? (
              <p className="mt-1 text-sm font-semibold text-emerald-200">{priceLabel}</p>
            ) : null}
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          {pkg.description ? (
            <p className="text-sm leading-relaxed text-slate-300">{pkg.description}</p>
          ) : null}

          {details && details !== pkg.description ? (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {ar ? "المحتوى والتفاصيل" : "What’s included"}
              </h3>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                {details}
              </p>
            </section>
          ) : details && !pkg.description ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">{details}</p>
          ) : null}

          {features.length > 0 ? (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {ar ? "ميزات تحسّن تجربتك" : "Experience boosters"}
              </h3>
              <ul className="mt-2.5 grid gap-2 sm:grid-cols-2">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-50"
                  >
                    <span className="mt-0.5 text-emerald-300" aria-hidden>
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {works.length > 0 ? (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {ar ? "أعمال نُفّذت بهذه الباقة" : "Past work with this package"}
              </h3>
              <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
                {works.map((work, i) => (
                  <article
                    key={`${work.title}-${i}`}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                  >
                    <div className="relative aspect-[16/10] bg-slate-900">
                      <Image
                        src={work.image || ACTIVITY_FALLBACK_IMAGE}
                        alt={work.title}
                        fill
                        className="object-cover"
                        sizes="280px"
                      />
                    </div>
                    <div className="space-y-1 p-3">
                      <p className="text-sm font-semibold text-white">{work.title}</p>
                      {work.description ? (
                        <p className="text-xs leading-relaxed text-slate-400">{work.description}</p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {!details && features.length === 0 && works.length === 0 && !pkg.description ? (
            <p className="text-sm text-slate-500">
              {ar
                ? "لا توجد تفاصيل إضافية لهذه الباقة حالياً."
                : "No extra details for this package yet."}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-slate-950/90 px-4 py-3.5 sm:px-5">
          <p className="text-xs text-slate-500">
            {selected
              ? ar
                ? "مضافة لطلبك حالياً"
                : "Currently in your booking"
              : ar
                ? "لم تُضف بعد — يمكنك إضافتها من هنا"
                : "Not selected yet — add it from here"}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 hover:border-white/30 hover:text-white"
            >
              {ar ? "رجوع" : "Back"}
            </button>
            <button
              type="button"
              onClick={() => {
                onToggleSelect();
                if (!selected) onClose();
              }}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold text-white transition",
                selected
                  ? "border border-rose-400/35 bg-rose-500/15 text-rose-100 hover:bg-rose-500/25"
                  : "bg-gradient-to-l from-violet-600 via-blue-500 to-cyan-400 shadow-[0_8px_24px_rgba(99,102,241,0.3)] hover:brightness-110",
              )}
            >
              {selected
                ? ar
                  ? "إزالة من الحجز"
                  : "Remove from booking"
                : ar
                  ? "إضافة للباقات"
                  : "Add to booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
