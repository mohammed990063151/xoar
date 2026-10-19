"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";
import { BookingInvoiceCard } from "@/components/booking/BookingInvoiceCard";
import { paymentService } from "@/services/paymentService";
import type { BookingCheckoutResult } from "@/types/payment";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { bookingPdfUrl } from "@/lib/booking-pdf-url";
import { normalizeStorageImageUrl } from "@/lib/image-url";
import { giftConfirmedMessage } from "@/lib/booking-labels";
import { useDocumentTheme } from "@/hooks/useDocumentTheme";
import { siteContainer, pageBottom } from "@/lib/layout";

function PaymentSuccessContent(): React.ReactElement {
  const params = useParams();
  const search = useSearchParams();
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const ar = locale === "ar";
  const code = search.get("code") ?? "";
  const theme = useDocumentTheme();
  const [booking, setBooking] = useState<BookingCheckoutResult | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!code) return;
    let stopped = false;
    let attempts = 0;

    const tick = (): void => {
      paymentService
        .getBookingStatus(code)
        .then((data) => {
          if (stopped) return;
          setBooking(data);
          setLoaded(true);
          if (data.paymentStatus === "paid" || attempts >= 10) return;
          attempts += 1;
          window.setTimeout(tick, 2000);
        })
        .catch(() => {
          if (stopped) return;
          setLoaded(true);
          if (attempts >= 10) return;
          attempts += 1;
          window.setTimeout(tick, 2000);
        });
    };

    tick();
    return () => {
      stopped = true;
    };
  }, [code]);

  const paid = booking?.paymentStatus === "paid";
  const guests = booking ? (booking.adults ?? 0) + (booking.children ?? 0) : undefined;
  const image = booking?.activity?.image ? normalizeStorageImageUrl(booking.activity.image) : undefined;

  return (
    <div className={siteContainer}>
      <div className={`${pageBottom} mx-auto max-w-lg py-16 text-center`}>
        <div
          className={
            paid
              ? "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-500/20 text-3xl text-teal-200"
              : "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15 text-3xl text-amber-200"
          }
        >
          {paid ? "✓" : "…"}
        </div>
        <h1 className="mt-6 text-2xl font-bold text-white">
          {paid
            ? ar
              ? "تم الحجز بنجاح!"
              : "Booking confirmed!"
            : ar
              ? "جاري تأكيد الدفع"
              : "Confirming your payment"}
        </h1>
        {paid ? (
          <p className="mt-2 text-sm text-slate-400">
            {ar
              ? "تم الدفع وتأكيد حجزك — رمز التأكيد والتذكرة جاهزان."
              : "Payment received and your booking is confirmed — your ticket is ready."}
          </p>
        ) : null}
        {code ? (
          <div className="mx-auto mt-6 max-w-md text-start">
            <BookingInvoiceCard
              locale={locale}
              confirmationCode={code}
              activityTitle={booking?.activity?.title || (ar ? "تأكيد الحجز" : "Booking confirmation")}
              activityImage={image}
              bookingDate={booking?.bookingDate}
              bookingDateTo={booking?.bookingEndDate || booking?.bookingDate}
              guests={guests && guests > 0 ? guests : undefined}
              totalAmount={booking?.totalAmount}
              isGift={booking?.isGift}
              isGroup={booking?.isGroup}
              isPaid={paid}
              paymentMethod={paid ? booking?.paymentMethod : undefined}
              paymentMethodLabel={booking?.paymentMethodLabel}
              paymentGateway={booking?.paymentGateway}
              paymentGatewayLabel={booking?.paymentGatewayLabel}
            />
            {booking?.isGift && booking.giftRecipientName ? (
              <p className="mt-3 text-xs font-medium text-violet-200">
                {giftConfirmedMessage(locale, booking.giftRecipientName)}
              </p>
            ) : null}
          </div>
        ) : null}
        {loaded && !paid ? (
          <p className="mt-4 text-sm text-amber-200/90">
            {ar
              ? "لم يصل تأكيد الدفع بعد — ستتحدث الصفحة تلقائياً خلال لحظات."
              : "Payment confirmation has not arrived yet — this page refreshes automatically."}
          </p>
        ) : null}
        {code && paid ? (
          <a
            href={bookingPdfUrl(code, theme)}
            target="_blank"
            rel="noopener noreferrer"
            className="booking-success-download mt-6 inline-flex rounded-2xl border border-slate-900 bg-slate-900 px-6 py-3 text-sm font-semibold shadow-md transition hover:bg-slate-800"
          >
            {ar ? "تحميل التذكرة (PDF)" : "Download ticket (PDF)"}
          </a>
        ) : null}
        {paid && booking?.inviteUrl ? (
          <div className="mt-5 space-y-3 rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-4 text-start">
            <p className="text-sm font-semibold text-cyan-100">
              {ar ? "شارك رابط الدعوة مع أصدقائك" : "Share the invite link with friends"}
            </p>
            <input
              readOnly
              value={booking.inviteUrl}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white"
              onClick={(e) => e.currentTarget.select()}
            />
            {booking.whatsappUrl ? (
              <a
                href={booking.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                {ar ? "مشاركة واتساب" : "Share on WhatsApp"}
              </a>
            ) : null}
          </div>
        ) : null}
        <div className="mt-8 flex flex-col items-center gap-3 text-sm">
          <Link href={localizedPath(locale, "/account/bookings")} className="text-cyan-300 hover:text-cyan-100">
            {ar ? "حجوزاتي" : "My bookings"}
          </Link>
          <Link href={localizedPath(locale, "/activities")} className="text-violet-300 hover:text-violet-100">
            {ar ? "العودة للأنشطة" : "Back to activities"}
          </Link>
        </div>
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
