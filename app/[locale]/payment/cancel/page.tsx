"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { siteContainer, pageBottom } from "@/lib/layout";

export default function PaymentCancelPage(): React.ReactElement {
  const params = useParams();
  const locale = (params?.locale === "en" ? "en" : "ar") as Locale;
  const ar = locale === "ar";

  return (
    <div className={siteContainer}>
      <div className={`${pageBottom} mx-auto max-w-lg py-16 text-center`}>
        <h1 className="text-2xl font-bold text-white">
          {ar ? "تم إلغاء الدفع" : "Payment cancelled"}
        </h1>
        <p className="mt-3 text-slate-400">
          {ar
            ? "لم يُكتمل الحجز. يمكنك المحاولة مرة أخرى."
            : "Your booking was not completed. You can try again."}
        </p>
        <Link
          href={localizedPath(locale, "/activities")}
          className="mt-8 inline-flex rounded-2xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white"
        >
          {ar ? "العودة للأنشطة" : "Back to activities"}
        </Link>
      </div>
    </div>
  );
}
