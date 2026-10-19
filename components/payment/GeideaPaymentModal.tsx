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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 p-3 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={ar ? "بوابة الدفع الآمنة" : "Secure payment"}
      dir={ar ? "rtl" : "ltr"}
    >
      <div className="flex max-h-[96vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_30px_120px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden>
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                <path d="M10 1.5a4.5 4.5 0 0 0-4.5 4.5v2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V6A4.5 4.5 0 0 0 10 1.5Zm-2.5 6.5V6a2.5 2.5 0 0 1 5 0v2h-5Z" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">{ar ? "دفع آمن ومشفّر" : "Secure encrypted payment"}</p>
              <p className="truncate text-[11px] text-slate-500">
                {ar ? "رمز الحجز" : "Booking"} {session.confirmationCode}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            {ar ? "إلغاء" : "Cancel"}
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <GeideaWordmark className="border border-slate-100 px-2 py-0.5" />
          <div className="text-end">
            <p className="text-[11px] text-slate-500">{ar ? "المبلغ المستحق" : "Amount due"}</p>
            <p className="text-lg font-extrabold text-slate-900">{session.amountLabel}</p>
          </div>
        </div>

        {/* Geidea pins its iframe to min-height 650px, so the frame area scrolls only on short screens. */}
        <div className="relative max-h-[calc(96vh-190px)] min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-slate-100">
          <div className="absolute inset-x-0 top-0 flex h-[650px] flex-col items-center justify-center gap-3 text-sm text-slate-500">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-orange-500" aria-hidden />
            {ar ? "جاري تحميل صفحة الدفع…" : "Loading payment page…"}
          </div>
          <div
            id={CONTAINER_ID}
            className="relative z-10 h-[650px] w-full [&_iframe]:block [&_iframe]:!w-full [&_iframe]:border-0"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-slate-100 bg-slate-50 px-4 py-2.5">
          {["mada", "visa", "mastercard", "apple"].map((brand) => (
            <PaymentBrandMark key={brand} id={brand} className="h-7 w-14 border border-slate-100" />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
