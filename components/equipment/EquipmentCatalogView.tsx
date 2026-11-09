"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { EquipmentCustomRequestForm } from "@/components/equipment/EquipmentCustomRequestForm";
import { ACTIVITY_FALLBACK_IMAGE } from "@/lib/activity";
import { formatMoney } from "@/lib/booking";
import { cn } from "@/lib/cn";
import { equipmentCategories, categoryLabel } from "@/lib/equipment-categories";
import type { Dictionary } from "@/lib/dictionary";
import { formatSarPrice } from "@/lib/format-price";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import {
  pageBottom,
  pageEyebrow,
  pageHeroInner,
  pageHeroSection,
  pageIntro,
  pageTitle,
  siteContainer,
} from "@/lib/layout";
import type { EquipmentCategory, EquipmentOffering } from "@/types/equipment-offering";

interface EquipmentCatalogViewProps {
  readonly locale: Locale;
  readonly offerings: EquipmentOffering[];
  readonly copy: Dictionary["pages"]["equipment"];
  readonly embedAudience?: "individual" | "corporate";
}

export function EquipmentCatalogView({
  locale,
  offerings,
  copy,
  embedAudience,
}: EquipmentCatalogViewProps): React.ReactElement {
  const ar = locale === "ar";
  const cats = equipmentCategories(locale);
  const [category, setCategory] = useState<EquipmentCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return offerings.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (!q) return true;
      const hay = `${item.title} ${item.shortLabel ?? ""} ${item.city ?? ""} ${item.specs ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [offerings, category, search]);

  return (
    <div className={pageBottom}>
      <section className={cn(pageHeroSection, "overflow-hidden")}>
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_-10%,rgba(6,182,212,0.18),transparent),radial-gradient(ellipse_60%_45%_at_90%_0%,rgba(244,63,94,0.12),transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-l from-transparent via-cyan-400/40 to-transparent"
          aria-hidden
        />
        <div className={pageHeroInner}>
          <div className="mx-auto max-w-3xl text-center">
            <p className={pageEyebrow}>{copy.eyebrow}</p>
            <h1 className={pageTitle}>{copy.title}</h1>
            <p className={`${pageIntro} text-slate-400`}>{copy.intro}</p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {(copy.highlights ?? []).map((h) => (
                <span
                  key={h}
                  className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-medium text-cyan-100"
                >
                  {h}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
              <Link
                href={localizedPath(locale, "/individual-events")}
                className="rounded-full border border-white/15 px-4 py-2 text-slate-300 transition hover:border-white/30 hover:text-white"
              >
                {ar ? "فعاليات الأفراد" : "Individual events"}
              </Link>
              <Link
                href={localizedPath(locale, "/corporate-events")}
                className="rounded-full border border-white/15 px-4 py-2 text-slate-300 transition hover:border-white/30 hover:text-white"
              >
                {ar ? "فعاليات الشركات" : "Corporate events"}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto mt-8 max-w-2xl">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={ar ? "ابحث: شاشة LED، مايك، إضاءة…" : "Search: LED screen, mic, lighting…"}
              className="w-full rounded-2xl border border-white/12 bg-slate-950/90 py-3.5 pe-4 ps-11 text-sm text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20"
            />
            <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden>
              ⌕
            </span>
          </div>
        </div>
      </section>

      <div className={cn(siteContainer, "space-y-8")}>
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {cats.map((c) => {
            const active = category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={cn(
                  "shrink-0 rounded-2xl border px-3.5 py-2.5 text-start transition",
                  active
                    ? "border-cyan-400/45 bg-cyan-500/15 text-white shadow-[0_0_24px_rgba(34,211,238,0.12)]"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20",
                )}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span className="text-cyan-300/90" aria-hidden>
                    {c.icon}
                  </span>
                  {c.label}
                </span>
                <span className="mt-0.5 block text-[10px] text-slate-500">{c.hint}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="text-sm text-slate-500">
            {ar ? `${filtered.length} معدة متاحة للحجز` : `${filtered.length} items available`}
          </p>
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <i className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
              {ar ? "حجز ودفع فوري" : "Instant book & pay"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="h-1.5 w-1.5 rounded-full bg-cyan-400" aria-hidden />
              {ar ? "توصيل حسب الاتفاق" : "Delivery by arrangement"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden />
              {ar ? "تقويم توفر مباشر" : "Live availability"}
            </span>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item, index) => (
              <EquipmentCard key={item.id} locale={locale} item={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center">
            <p className="text-lg font-medium text-slate-300">
              {offerings.length === 0
                ? ar
                  ? "قريباً — كتالوج المعدات قيد التجهيز"
                  : "Coming soon — equipment catalog is being prepared"
                : ar
                  ? "لا نتائج لهذا البحث"
                  : "No matches for this search"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {ar
                ? "يمكنك إرسال طلب مخصص بالأسفل وسنجهّز العرض لك."
                : "Send a custom request below and we’ll prepare a quote."}
            </p>
          </div>
        )}

        <section className="equipment-strip relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950/40 p-6 sm:p-8">
          <div
            className="pointer-events-none absolute -end-16 -top-16 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl"
            aria-hidden
          />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
                {ar ? "طلب مخصص" : "Custom quote"}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                {ar ? "ما لقيتها في الكتالوج؟" : "Don’t see what you need?"}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {ar
                  ? "اكتب احتياجك بدقة — صوت، شاشات، إضاءة، أو باقة كاملة — ونرجّع لك بتوفر وتسعير خلال وقت قصير."
                  : "Describe exactly what you need — sound, screens, lighting, or a full kit — and we’ll reply with availability and pricing."}
              </p>
              {embedAudience ? (
                <p className="mt-3 text-xs text-amber-200/80">
                  {embedAudience === "corporate"
                    ? ar
                      ? "مرتبط بفعاليات الشركات — يمكنك أيضاً الحجز من صفحة المعدات المستقلة."
                      : "Shown for corporate events — you can also book from the standalone equipment page."
                    : ar
                      ? "مرتبط بفعاليات الأفراد — يمكنك أيضاً الحجز من صفحة المعدات المستقلة."
                      : "Shown for individual events — you can also book from the standalone equipment page."}
                </p>
              ) : null}
            </div>
            <EquipmentCustomRequestForm locale={locale} copy={copy} />
          </div>
        </section>
      </div>
    </div>
  );
}

function EquipmentCard({
  locale,
  item,
  index,
}: {
  locale: Locale;
  item: EquipmentOffering;
  index: number;
}): React.ReactElement {
  const ar = locale === "ar";
  const href = localizedPath(locale, `/equipment/${item.slug}`);
  const image = item.image || ACTIVITY_FALLBACK_IMAGE;
  const price =
    item.basePriceAmount > 0
      ? formatMoney(item.basePriceAmount, locale)
      : item.basePrice
        ? formatSarPrice(item.basePrice, locale)
        : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.24), duration: 0.35 }}
      className="equipment-card group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/70 shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition hover:border-cyan-400/30 hover:shadow-[0_22px_60px_rgba(6,182,212,0.12)]"
    >
      <Link href={href} className="relative block aspect-[16/11] overflow-hidden">
        <Image
          src={image}
          alt={item.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          priority={index < 3}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <span className="absolute start-3 top-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-100 backdrop-blur">
          {categoryLabel(item.category, locale)}
        </span>
        {item.duration ? (
          <span className="absolute end-3 top-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white/90 backdrop-blur">
            {item.duration}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-bold leading-snug text-white">
            <Link href={href} className="hover:text-cyan-100">
              {item.title}
            </Link>
          </h2>
          {item.shortLabel ? (
            <p className="mt-1 text-xs text-slate-500">{item.shortLabel}</p>
          ) : null}
        </div>

        {item.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">{item.description}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-white/8 pt-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {ar ? "من" : "From"}
            </p>
            <p className="text-base font-bold text-white">
              {price ?? (ar ? "حسب الطلب" : "On request")}
            </p>
            {item.comparePrice ? (
              <p className="text-xs text-slate-500 line-through">
                {formatSarPrice(item.comparePrice, locale)}
              </p>
            ) : null}
          </div>
          <Link
            href={href}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-l from-cyan-600 via-sky-500 to-emerald-400 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(6,182,212,0.25)] transition hover:brightness-110"
          >
            {ar ? "احجز الآن" : "Book now"}
            <span aria-hidden>{ar ? "←" : "→"}</span>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
