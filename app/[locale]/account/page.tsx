"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { CustomerSpace } from "@/components/account/CustomerSpace";
import { customerService } from "@/services/customerService";
import type { Customer, CustomerBooking } from "@/types/customer";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { useParams } from "next/navigation";
import { portalPath } from "@/lib/portal-url";

export default function AccountHomePage(): React.ReactElement {
  const params = useParams();
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const ar = locale === "ar";
  const reduceMotion = useReducedMotion();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    void Promise.all([
      customerService.me(),
      customerService.bookings(),
      customerService.notifications(),
    ]).then(([profile, list, notes]) => {
      setCustomer(profile);
      setBookings(list.slice(0, 3));
      setUnread(notes.unreadCount);
    });
  }, []);

  const tiles = [
    {
      href: "/account/bookings",
      title: ar ? "حجوزاتي" : "My bookings",
      hint: ar
        ? `${customer?.bookingsCount ?? bookings.length} تجربة`
        : `${customer?.bookingsCount ?? bookings.length} experiences`,
      accent: "from-cyan-500/20 to-transparent",
    },
    {
      href: "/account/group-bookings",
      title: ar ? "مجموعات الحجز" : "Group bookings",
      hint: ar ? "ادعُ أصدقاءك" : "Invite friends",
      accent: "from-violet-500/20 to-transparent",
    },
    {
      href: "/account/notifications",
      title: ar ? "الإشعارات" : "Notifications",
      hint:
        unread > 0
          ? ar
            ? `${unread} غير مقروء`
            : `${unread} unread`
          : ar
            ? "كل شيء هادئ"
            : "All caught up",
      accent: "from-amber-500/20 to-transparent",
    },
    {
      href: "/account/wallet",
      title: ar ? "محفظتي" : "Wallet",
      hint: ar
        ? `${customer?.walletBalanceSar ?? 0} ر.س`
        : `SAR ${customer?.walletBalanceSar ?? 0}`,
      accent: "from-emerald-500/20 to-transparent",
    },
    {
      href: "/account/referrals",
      title: ar ? "الإحالات" : "Referrals",
      hint: customer?.referralCode ?? (ar ? "ادعُ وارك" : "Invite & earn"),
      accent: "from-sky-500/20 to-transparent",
    },
  ] as const;

  return (
    <CustomerSpace locale={locale}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile, i) => (
          <motion.div
            key={tile.href}
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              href={localizedPath(locale, tile.href)}
              className="group relative block overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#081526]/80 p-5 transition hover:border-cyan-400/35"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tile.accent} opacity-80 transition group-hover:opacity-100`}
                aria-hidden
              />
              <div className="relative">
                <p className="text-lg font-bold text-white">{tile.title}</p>
                <p className="mt-2 text-sm text-slate-400">{tile.hint}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-3">
          <h2 className="text-xl font-bold text-white">
            {ar ? "آخر التذاكر" : "Latest tickets"}
          </h2>
          <Link
            href={localizedPath(locale, "/account/bookings")}
            className="text-sm text-cyan-300 hover:text-cyan-100"
          >
            {ar ? "الكل" : "View all"}
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-white/15 px-6 py-12 text-center">
            <p className="text-slate-400">
              {ar ? "لم تحجز بعد — ابدأ تجربتك الأولى." : "No bookings yet — start your first experience."}
            </p>
            <Link
              href={localizedPath(locale, "/activities")}
              className="mt-4 inline-flex rounded-full bg-gradient-to-l from-cyan-500 to-teal-400 px-5 py-2.5 text-sm font-bold text-slate-950"
            >
              {ar ? "استكشف الأنشطة" : "Explore activities"}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b, i) => (
              <motion.article
                key={b.id}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-l from-[#0a1a2e] to-[#071220] px-5 py-4"
                initial={reduceMotion ? false : { opacity: 0, x: ar ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-cyan-300">
                      {b.confirmationCode}
                    </p>
                    <p className="mt-1 font-semibold text-white">{b.activity?.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {b.bookingDate}
                      {b.bookingTime ? ` · ${b.bookingTime}` : ""}
                    </p>
                  </div>
                  {b.pdfUrl ? (
                    <a
                      href={b.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-cyan-400/30 px-4 py-2 text-xs font-semibold text-cyan-100"
                    >
                      PDF
                    </a>
                  ) : null}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {customer?.isPartner ? (
        <a
          href={portalPath("/activities")}
          className="mt-10 inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-100"
        >
          {ar ? "لوحة الشريك" : "Partner dashboard"}
        </a>
      ) : (
        <Link
          href={localizedPath(locale, "/partners") + "?apply=1"}
          className="mt-10 inline-flex text-sm text-slate-400 underline-offset-4 hover:text-cyan-200 hover:underline"
        >
          {ar ? "هل لديك نشاط؟ انضم كشريك" : "Have a business? Become a partner"}
        </Link>
      )}
    </CustomerSpace>
  );
}
