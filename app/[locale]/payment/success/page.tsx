"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";
import { paymentService } from "@/services/paymentService";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { siteContainer, pageBottom } from "@/lib/layout";

function PaymentSuccessContent(): React.ReactElement {
  const params = useParams();
  const search = useSearchParams();
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const ar = locale === "ar";
  const code = search.get("code") ?? "";
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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl text-emerald-300">
          ✓
        </div>
        <h1 className="mt-6 text-2xl font-bold text-white">
          {ar ? "شكراً لحجزك!" : "Thank you for your booking!"}
        </h1>
        <p className="mt-2 text-slate-400">
          {code ? (
            <>
              {ar ? "رمز الحجز:" : "Confirmation:"}{" "}
              <span className="font-mono text-cyan-300">{code}</span>
            </>
          ) : null}
        </p>
        {status === "pending" ? (
          <p className="mt-4 text-sm text-amber-200/90">
            {ar
              ? "جاري تأكيد الدفع — حدّث الصفحة خلال لحظات."
              : "Payment confirmation pending — refresh shortly."}
          </p>
        ) : null}
        {pdfUrl ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex rounded-2xl border border-cyan-400/40 bg-cyan-500/15 px-6 py-3 text-sm font-semibold text-cyan-100"
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
