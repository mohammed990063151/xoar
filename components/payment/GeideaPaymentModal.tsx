"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/lib/i18n";
import { GeideaWordmark, PaymentBrandMark } from "@/components/payment/PaymentBrandMark";
import { startGeideaCheckout } from "@/components/payment/startGeideaCheckout";

const CONTAINER_ID = "geidea-checkout-frame";

export interface GeideaPaymentSession {
  sessionId: string;
  confirmationCode: string;
  checkoutUrl?: string | null;
  amountLabel: string;
}

export function GeideaPaymentModal({
  session,
  locale,
  scriptUrl,
  onClose,
  onError,
}: {
  readonly session: GeideaPaymentSession;
  readonly locale: Locale;
  readonly scriptUrl?: string | null;
  readonly onClose: () => void;
  readonly onError: (message: string) => void;
}): React.ReactElement | null {
  const ar = locale === "ar";
  const started = useRef(false);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    startGeideaCheckout({
      sessionId: session.sessionId,
      confirmationCode: session.confirmationCode,
      locale,
      scriptUrl,
      containerId: CONTAINER_ID,
      onCancel: onClose,
      onError,
    }).catch(() => {
      if (session.checkoutUrl) {
        window.location.href = session.checkoutUrl;
        return;
      }
      onError(ar ? "تعذّر فتح بوابة الدفع. حاول مرة أخرى." : "Could not open the payment page. Please try again.");
    });
  }, [ar, locale, onClose, onError, scriptUrl, session]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-stretch justify-center bg-slate-950/85 backdrop-blur-md sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={ar ? "بوابة الدفع الآمنة" : "Secure payment"}
      dir={ar ? "rtl" : "ltr"}
    >
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-[0_30px_120px_rgba(0,0,0,0.6)] sm:h-auto sm:max-h-[96vh] sm:max-w-xl sm:rounded-3xl sm:border sm:border-white/10 lg:max-w-2xl 2xl:max-w-3xl">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 sm:h-11 sm:w-11" aria-hidden>
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor">
                <path d="M10 1.5a4.5 4.5 0 0 0-4.5 4.5v2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V6A4.5 4.5 0 0 0 10 1.5Zm-2.5 6.5V6a2.5 2.5 0 0 1 5 0v2h-5Z" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-base font-bold text-slate-900 sm:text-lg">{ar ? "دفع آمن ومشفّر" : "Secure encrypted payment"}</p>
              <p className="truncate text-xs text-slate-500 sm:text-sm">
                {ar ? "رمز الحجز" : "Booking"} <span dir="ltr" className="font-mono font-semibold">{session.confirmationCode}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {ar ? "إلغاء" : "Cancel"}
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <GeideaWordmark className="border border-slate-100 px-3 py-1.5" imageClassName="h-6 sm:h-7" />
          <div className="text-end">
            <p className="text-xs text-slate-500 sm:text-sm">{ar ? "المبلغ المستحق" : "Amount due"}</p>
            <p className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{session.amountLabel}</p>
          </div>
        </div>

        {/* Geidea pins its iframe to min-height 650px; larger screens zoom the frame, short screens scroll it. */}
        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-slate-100 sm:max-h-[calc(96vh-230px)]">
          <div className="absolute inset-x-0 top-0 flex h-[650px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" aria-hidden />
            {ar ? "جاري تحميل صفحة الدفع…" : "Loading payment page…"}
          </div>
          <div
            id={CONTAINER_ID}
            className="geidea-frame-zoom relative z-10 h-[650px] w-full [&_iframe]:block [&_iframe]:!w-full [&_iframe]:border-0"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-3">
          {["mada", "visa", "mastercard", "apple"].map((brand) => (
            <PaymentBrandMark key={brand} id={brand} className="h-9 w-[4.5rem] border border-slate-100 sm:h-10 sm:w-20" />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
