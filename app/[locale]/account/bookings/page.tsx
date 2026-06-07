"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AccountShell } from "@/components/account/AccountShell";
import { customerService, getCustomerToken } from "@/services/customerService";
import type { CustomerBooking } from "@/types/customer";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { useParams } from "next/navigation";

export default function AccountBookingsPage(): React.ReactElement {
  const params = useParams();
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const router = useRouter();
  const ar = locale === "ar";
  const [bookings, setBookings] = useState<CustomerBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getCustomerToken()) {
      router.replace(localizedPath(locale, "/account/login"));
      return;
    }
    customerService
      .bookings()
      .then(setBookings)
      .finally(() => setLoading(false));
  }, [locale, router]);

  return (
    <AccountShell locale={locale} title={ar ? "محفظة التجارب" : "Experience wallet"}>
      {loading ? (
        <p className="text-slate-500">{ar ? "جاري التحميل..." : "Loading..."}</p>
      ) : bookings.length === 0 ? (
        <p className="text-slate-500">
          {ar ? "لا توجد حجوزات بعد." : "No bookings yet."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {bookings.map((b) => (
            <article
              key={b.id}
              className="rounded-2xl border border-white/10 bg-slate-950/80 p-5"
            >
              <p className="font-mono text-lg font-bold text-cyan-300">
                {b.confirmationCode}
              </p>
              <p className="mt-2 font-semibold text-white">{b.activity?.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                {b.bookingDate}
                {b.bookingTime ? ` · ${b.bookingTime}` : ""}
              </p>
              {b.pdfUrl ? (
                <a
                  href={b.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex text-sm text-cyan-400 hover:text-cyan-200"
                >
                  {ar ? "عرض تذكرتي (PDF)" : "View ticket (PDF)"}
                </a>
              ) : null}
            </article>
          ))}
        </div>
      )}
      <Link
        href={localizedPath(locale, "/activities")}
        className="mt-8 inline-flex text-sm text-violet-300 hover:text-violet-100"
      >
        {ar ? "استكشف أنشطة جديدة" : "Explore new activities"}
      </Link>
    </AccountShell>
  );
}
