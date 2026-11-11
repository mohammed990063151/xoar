"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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
  /** Extra gallery images (offering gallery, etc.) */
  gallery?: string[];
  price?: string | null;
  priceAmount?: number;
  badge?: string | null;
}

interface PackageDetailsModalProps {
  readonly locale: Locale;
  readonly pkg: PackageDetailsContent | null;
  readonly selected: boolean;
  readonly onClose: () => void;
  readonly onToggleSelect: () => void;
  /** Hide prices for public event request flows. */
  readonly showPrice?: boolean;
}

export function PackageDetailsModal({
  locale,
  pkg,
  selected,
  onClose,
  onToggleSelect,
  showPrice = true,
}: PackageDetailsModalProps): React.ReactElement | null {
  const ar = locale === "ar";
  const [activeImage, setActiveImage] = useState(0);

  const images = useMemo(() => {
    if (!pkg) return [] as Array<{ src: string; label: string }>;
    const rows: Array<{ src: string; label: string }> = [];
    const push = (src: string | null | undefined, label: string) => {
      const value = src?.trim();
      if (!value) return;
      if (rows.some((row) => row.src === value)) return;
      rows.push({ src: value, label });
    };

    push(pkg.image, pkg.title);
    for (const url of pkg.gallery ?? []) {
      push(url, pkg.title);
    }
    for (const work of pkg.works ?? []) {
      push(work.image, work.title || pkg.title);
    }
    if (rows.length === 0) {
      rows.push({ src: ACTIVITY_FALLBACK_IMAGE, label: pkg.title });
    }
    return rows;
  }, [pkg]);

  useEffect(() => {
    setActiveImage(0);
  }, [pkg?.id]);

  useEffect(() => {
    if (!pkg) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        setActiveImage((i) => (i <= 0 ? images.length - 1 : i - 1));
      }
      if (e.key === "ArrowRight") {
        setActiveImage((i) => (i >= images.length - 1 ? 0 : i + 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [pkg, onClose, images.length]);

  if (!pkg) return null;

  const priceLabel = showPrice
    ? (pkg.priceAmount ?? 0) > 0
      ? formatMoney(pkg.priceAmount ?? 0, locale)
      : pkg.price
        ? formatSarPrice(pkg.price, locale)
        : ar
          ? "حسب الاتفاق"
          : "On request"
    : null;
  const features = (pkg.features ?? []).filter((f) => f.trim());
  const works = (pkg.works ?? []).filter((w) => w.title?.trim());
  const details = pkg.details?.trim() || "";
  const current = images[Math.min(activeImage, images.length - 1)] ?? images[0];

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="package-details-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        aria-label={ar ? "إغلاق" : "Close"}
        onClick={onClose}
      />

      <div className="package-details-modal relative z-[1] flex max-h-[min(94vh,920px)] w-full max-w-4xl flex-col overflow-hidden rounded-[1.5rem] border border-white/12 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
        <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
          <div className="relative flex min-h-[240px] flex-col bg-slate-900 sm:min-h-[320px]">
            <div className="relative aspect-[16/11] w-full flex-1 lg:aspect-auto lg:min-h-[420px]">
              <Image
                src={current.src}
                alt={current.label}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />
              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImage((i) => (i <= 0 ? images.length - 1 : i - 1))
                    }
                    className="absolute start-3 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/45 px-3 py-2 text-white backdrop-blur hover:bg-black/65"
                    aria-label={ar ? "السابق" : "Previous"}
                  >
                    {ar ? "→" : "←"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImage((i) => (i >= images.length - 1 ? 0 : i + 1))
                    }
                    className="absolute end-3 top-1/2 -translate-y-1/2 rounded-full border border-white/25 bg-black/45 px-3 py-2 text-white backdrop-blur hover:bg-black/65"
                    aria-label={ar ? "التالي" : "Next"}
                  >
                    {ar ? "←" : "→"}
                  </button>
                  <p className="absolute bottom-3 start-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[11px] text-white backdrop-blur">
                    {activeImage + 1} / {images.length}
                  </p>
                </>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                className="absolute end-3 top-3 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/70"
              >
                {ar ? "إغلاق" : "Close"}
              </button>
            </div>

            {images.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto border-t border-white/10 bg-black/30 p-3">
                {images.map((img, index) => (
                  <button
                    key={`${img.src}-${index}`}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={cn(
                      "relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border transition",
                      index === activeImage
                        ? "border-emerald-400 ring-1 ring-emerald-400/50"
                        : "border-white/15 opacity-75 hover:opacity-100",
                    )}
                  >
                    <Image src={img.src} alt="" fill className="object-cover" sizes="96px" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-col">
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              {pkg.badge ? (
                <span className="inline-flex rounded-full border border-amber-300/30 bg-amber-400/15 px-2.5 py-1 text-[10px] font-semibold text-amber-100">
                  {pkg.badge}
                </span>
              ) : null}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/80">
                  {ar ? "تفاصيل الباقة" : "Package details"}
                </p>
                <h2 id="package-details-title" className="mt-1 text-2xl font-bold text-white">
                  {pkg.title}
                </h2>
                {priceLabel ? (
                  <p className="mt-2 text-lg font-bold text-emerald-300">{priceLabel}</p>
                ) : null}
              </div>

              {pkg.description ? (
                <p className="text-sm leading-relaxed text-slate-300">{pkg.description}</p>
              ) : null}

              {details ? (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {ar ? "المحتوى والتفاصيل" : "What’s included"}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-300">
                    {details}
                  </p>
                </section>
              ) : null}

              {features.length > 0 ? (
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {ar ? "المميزات" : "Features"}
                  </h3>
                  <ul className="mt-2.5 grid gap-2 sm:grid-cols-1">
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
                    {ar ? "أعمال مرتبطة بهذه الباقة" : "Related work"}
                  </h3>
                  <div className="mt-2.5 space-y-3">
                    {works.map((work, i) => (
                      <article
                        key={`${work.title}-${i}`}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                      >
                        {work.image ? (
                          <button
                            type="button"
                            className="relative block aspect-[16/10] w-full"
                            onClick={() => {
                              const idx = images.findIndex((img) => img.src === work.image);
                              if (idx >= 0) setActiveImage(idx);
                            }}
                          >
                            <Image
                              src={work.image}
                              alt={work.title}
                              fill
                              className="object-cover"
                              sizes="360px"
                            />
                          </button>
                        ) : null}
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
              <p className="text-xs text-slate-400">
                {selected
                  ? ar
                    ? "مضافة لطلبك حالياً"
                    : "Currently in your request"
                  : ar
                    ? "اضغط للإضافة إلى طلبك"
                    : "Add this package to your request"}
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
                      ? "إزالة من الطلب"
                      : "Remove from request"
                    : ar
                      ? "إضافة للطلب"
                      : "Add to request"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
