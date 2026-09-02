"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CustomerSpace } from "@/components/account/CustomerSpace";
import { cn } from "@/lib/cn";
import { customerCache } from "@/lib/customer-cache";
import { isStorageImage, normalizeStorageImageUrl } from "@/lib/image-url";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { customerService } from "@/services/customerService";
import type { CustomerBooking } from "@/types/customer";
import { bookingPdfUrl } from "@/lib/booking-pdf-url";
import { useDocumentTheme } from "@/hooks/useDocumentTheme";

type FilterKey = "all" | "upcoming" | "past" | "gift";

function todayIso(): string {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function isUpcoming(b: CustomerBooking): boolean {
  if (!b.bookingDate) return false;
  return b.bookingDate >= todayIso();
}

function statusMeta(b: CustomerBooking, ar: boolean): { label: string; className: string } {
  const paid = b.paymentStatus === "paid";
  const upcoming = isUpcoming(b);
  if (paid && upcoming) {
    return {
      label: ar ? "قادمة" : "Upcoming",
      className: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30",
    };
  }
  if (paid) {
    return {
      label: ar ? "منتهية" : "Past",
      className: "bg-slate-500/15 text-slate-300 border-white/10",
    };
  }
  return {
    label: ar ? "بانتظار الدفع" : "Pending pay",
    className: "bg-amber-500/15 text-amber-100 border-amber-400/30",
  };
}

function BookingSkeleton(): React.ReactElement {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-44 animate-pulse rounded-[1.35rem] border border-white/5 bg-white/[0.04]"
        />
      ))}
    </div>
  );
}

function TicketCard({
  booking,
  locale,
  index,
  reduceMotion,
}: {
  readonly booking: CustomerBooking;
  readonly locale: Locale;
  readonly index: number;
  readonly reduceMotion: boolean | null;
}): React.ReactElement {
  const ar = locale === "ar";
  const theme = useDocumentTheme();
  const status = statusMeta(booking, ar);
  const rawImage = booking.activity?.image?.trim() ?? "";
  const image = rawImage ? normalizeStorageImageUrl(rawImage) : "";
  const guests = (booking.adults ?? 0) + (booking.children ?? 0);

  return (
    <motion.article
      className="group relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#071525] content-visibility-auto"
      style={{ contentVisibility: "auto", containIntrinsicSize: "280px" }}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index, 8) * 0.04 }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
    >
      <div className="pointer-events-none absolute inset-y-4 start-0 w-px bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent" />
      <div className="pointer-events-none absolute start-[-6px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#020617] ring-1 ring-white/10" />
      <div className="pointer-events-none absolute end-[-6px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#020617] ring-1 ring-white/10" />

      <div className="flex min-h-[11.5rem]">
        <div className="relative hidden w-[7.5rem] shrink-0 overflow-hidden sm:block">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              sizes="120px"
              className="object-cover transition duration-500 group-hover:scale-105"
              unoptimized={isStorageImage(image)}
              priority={index < 2}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/25 via-teal-600/10 to-transparent" />
          )}
          <div className="absolute inset-0 bg-gradient-to-l from-[#071525] via-transparent to-transparent" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide",
                  status.className,
                )}
              >
                {status.label}
              </span>
              {booking.isGift ? (
                <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-100">
                  {ar ? "إهداء" : "Gift"}
                </span>
              ) : null}
            </div>
            <h2 className="mt-2 line-clamp-2 text-base font-bold leading-snug text-white sm:text-lg">
              {booking.activity?.title || (ar ? "تجربة إكزورا" : "Xoar experience")}
            </h2>
            <p className="mt-1 font-mono text-xs font-semibold tracking-wider text-white/85">
              {booking.confirmationCode || "—"}
            </p>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="text-xs text-slate-400">
              <p>
                {booking.bookingDate || "—"}
                {booking.bookingTime ? ` · ${booking.bookingTime}` : ""}
              </p>
              <p className="mt-0.5">
                {booking.activity?.location ? `${booking.activity.location} · ` : ""}
                {guests > 0 ? `${guests} ${ar ? "مشارك" : "guests"}` : null}
                {booking.totalAmount ? ` · ${booking.totalAmount}` : null}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {booking.activity?.slug ? (
                <Link
                  href={localizedPath(locale, `/activities/${booking.activity.slug}`)}
                  className="rounded-full border border-white/12 px-3 py-1.5 text-[11px] font-medium text-slate-300 transition hover:border-cyan-400/35 hover:text-white"
                >
                  {ar ? "التفاصيل" : "Details"}
                </Link>
              ) : null}
              {booking.confirmationCode ? (
                <a
                  href={bookingPdfUrl(booking.confirmationCode, theme)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gradient-to-r from-teal-500 to-violet-500 px-3.5 py-1.5 text-[11px] font-bold text-white"
                >
                  {ar ? "PDF" : "PDF"}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function AccountBookingsPage(): React.ReactElement {
  const params = useParams();
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const ar = locale === "ar";
  const reduceMotion = useReducedMotion();
  const cached = customerCache.getBookings();
  const [bookings, setBookings] = useState<CustomerBooking[]>(cached ?? []);
  const [loading, setLoading] = useState(cached === undefined);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [, startTransition] = useTransition();

  useEffect(() => {
    let active = true;
    const hasCache = customerCache.getBookings() !== undefined;
    if (!hasCache) setLoading(true);

    void customerService.bookings().then((list) => {
      if (!active) return;
      startTransition(() => {
        setBookings(list);
        setLoading(false);
      });
    });

    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    let upcoming = 0;
    let past = 0;
    let gift = 0;
    for (const b of bookings) {
      if (isUpcoming(b)) upcoming += 1;
      else past += 1;
      if (b.isGift) gift += 1;
    }
    return { upcoming, past, gift, all: bookings.length };
  }, [bookings]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "upcoming":
        return bookings.filter(isUpcoming);
      case "past":
        return bookings.filter((b) => !isUpcoming(b));
      case "gift":
        return bookings.filter((b) => b.isGift);
      default:
        return bookings;
    }
  }, [bookings, filter]);

  const filters: Array<{ key: FilterKey; label: string; count: number }> = [
    { key: "all", label: ar ? "الكل" : "All", count: counts.all },
    { key: "upcoming", label: ar ? "قادمة" : "Upcoming", count: counts.upcoming },
    { key: "past", label: ar ? "سابقة" : "Past", count: counts.past },
    { key: "gift", label: ar ? "إهداء" : "Gifts", count: counts.gift },
  ];

  return (
    <CustomerSpace
      locale={locale}
      compact
      title={ar ? "محفظة التذاكر" : "Ticket wallet"}
      subtitle={ar ? "تذاكرك الرقمية بسرعة ولمسة أنيقة." : "Your digital tickets, fast and clear."}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-md text-sm text-slate-400">
          {ar
            ? "كل تجربة كتذكرة حيّة — صفّها، حمّل PDF، وارجع للنشاط بضغطة."
            : "Each experience as a live ticket — filter, grab the PDF, reopen the activity."}
        </p>
        <p className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
          {counts.upcoming} {ar ? "قادمة" : "upcoming"}
        </p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition",
              filter === f.key
                ? "bg-white text-slate-950"
                : "border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white",
            )}
          >
            {f.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px]",
                filter === f.key ? "bg-slate-900/10" : "bg-white/5",
              )}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <BookingSkeleton />
      ) : filtered.length === 0 ? (
        <div className="relative overflow-hidden rounded-[1.75rem] border border-dashed border-white/15 px-6 py-16 text-center">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.12),transparent_55%)]"
            aria-hidden
          />
          <p className="relative text-slate-300">
            {filter === "all"
              ? ar
                ? "لا توجد حجوزات بعد — ابدأ تجربتك الأولى."
                : "No bookings yet — start your first experience."
              : ar
                ? "لا نتائج في هذا التصنيف."
                : "Nothing in this filter."}
          </p>
          <Link
            href={localizedPath(locale, "/activities")}
            className="relative mt-5 inline-flex rounded-full bg-gradient-to-l from-cyan-500 to-teal-400 px-5 py-2.5 text-sm font-bold text-slate-950"
          >
            {ar ? "استكشف الأنشطة" : "Explore activities"}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((b, i) => (
            <TicketCard
              key={b.id}
              booking={b}
              locale={locale}
              index={i}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      )}
    </CustomerSpace>
  );
}
