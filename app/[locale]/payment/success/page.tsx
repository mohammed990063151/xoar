"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";
import { BookingInvoiceCard } from "@/components/booking/BookingInvoiceCard";
import { paymentService } from "@/services/paymentService";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { bookingPdfUrl } from "@/lib/booking-pdf-url";
import { useDocumentTheme } from "@/hooks/useDocumentTheme";
import { siteContainer, pageBottom } from "@/lib/layout";

function PaymentSuccessContent(): React.ReactElement {
  const params = useParams();
  const search = useSearchParams();
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const ar = locale === "ar";
  const code = search.get("code") ?? "";
  const theme = useDocumentTheme();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("pending");

  useEffect(() => {
    if (!code) return;
    paymentService.getBookingStatus(code).then((data) => {
      setStatus(data.paymentStatus ?? "pending");
      setPdfUrl(data.pdfUrl ?? null);
    });
  }, [code]);

  return (
    <div className={siteContainer}>
      <div className={`${pageBottom} mx-auto max-w-lg py-16 text-center`}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/20 text-3xl text-teal-200">
          ✓
        </div>
        <h1 className="mt-6 text-2xl font-bold text-white">
          {ar ? "شكراً لحجزك!" : "Thank you for your booking!"}
        </h1>
        {code ? (
          <div className="mx-auto mt-6 max-w-md text-start">
            <BookingInvoiceCard
              locale={locale}
              confirmationCode={code}
              activityTitle={ar ? "تأكيد الحجز" : "Booking confirmation"}
              isPaid={status === "paid"}
              compact
            />
          </div>
        ) : null}
        {status === "pending" ? (
          <p className="mt-4 text-sm text-amber-200/90">
            {ar
              ? "جاري تأكيد الدفع — حدّث الصفحة خلال لحظات."
              : "Payment confirmation pending — refresh shortly."}
          </p>
        ) : null}
        {code ? (
          <a
            href={bookingPdfUrl(code, theme)}
            target="_blank"
            rel="noopener noreferrer"
            className="booking-success-download mt-6 inline-flex rounded-2xl border border-slate-900 bg-slate-900 px-6 py-3 text-sm font-semibold shadow-md transition hover:bg-slate-800"
          >
            {ar ? "تحميل التذكرة (PDF)" : "Download ticket (PDF)"}
          </a>
        ) : null}
        <Link
          href={localizedPath(locale, "/activities")}
          className="mt-8 block text-sm text-violet-300 hover:text-violet-100"
        >
          {ar ? "العودة للأنشطة" : "Back to activities"}
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage(): React.ReactElement {
  return (
    <Suspense
      fallback={
        <div className={siteContainer}>
          <div className={`${pageBottom} mx-auto max-w-lg py-16 text-center text-slate-400`}>
            Loading…
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
