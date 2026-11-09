"use client";

import Image from "next/image";
import Link from "next/link";
import { ACTIVITY_FALLBACK_IMAGE } from "@/lib/activity";
import { formatMoney } from "@/lib/booking";
import { categoryLabel } from "@/lib/equipment-categories";
import { formatSarPrice } from "@/lib/format-price";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import type { EquipmentOffering } from "@/types/equipment-offering";

interface EquipmentStripProps {
  readonly locale: Locale;
  readonly audience: "individual" | "corporate";
  readonly items: EquipmentOffering[];
}

export function EquipmentStrip({
  locale,
  audience,
  items,
}: EquipmentStripProps): React.ReactElement | null {
  if (items.length === 0) return null;
  const ar = locale === "ar";

  return (
    <section className="mt-12 overflow-hidden rounded-[1.75rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-950/40 via-slate-950 to-slate-950 p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/80">
            {ar ? "معدات للفعالية" : "Event equipment"}
          </p>
          <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
            {audience === "corporate"
              ? ar
                ? "جهّز فعالية شركتك بالمعدات"
                : "Kit your corporate event"
              : ar
                ? "أضف معدات لفعاليتك"
                : "Add gear to your event"}
          </h2>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            {ar
              ? "صوت، إضاءة، شاشات ومنصات — حجز مستقل أو مع فعاليتك. التوفر يظهر مباشرة في التقويم."
              : "Sound, lighting, screens, and staging — book standalone or alongside your event. Availability is live on the calendar."}
          </p>
        </div>
        <Link
          href={localizedPath(locale, "/equipment")}
          className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
        >
          {ar ? "كل المعدات" : "All equipment"}
        </Link>
      </div>

      <div className="mt-5 flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.slice(0, 8).map((item) => {
          const href = localizedPath(locale, `/equipment/${item.slug}`);
          const price =
            item.basePriceAmount > 0
              ? formatMoney(item.basePriceAmount, locale)
              : item.basePrice
                ? formatSarPrice(item.basePrice, locale)
                : null;
          return (
            <Link
              key={item.id}
              href={href}
              className="group w-[220px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/30 transition hover:border-cyan-400/35"
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src={item.image || ACTIVITY_FALLBACK_IMAGE}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-400 group-hover:scale-[1.03]"
                  sizes="220px"
                />
                <span className="absolute start-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-cyan-100 backdrop-blur">
                  {categoryLabel(item.category, locale)}
                </span>
              </div>
              <div className="space-y-1 p-3">
                <p className="line-clamp-2 text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-cyan-100/90">
                  {price ? (ar ? `من ${price}` : `From ${price}`) : ar ? "حسب الطلب" : "On request"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
