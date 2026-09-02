"use client";

import Image from "next/image";
import QRCode from "react-qr-code";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";

export type BookingInvoiceCardProps = {
  readonly locale: Locale;
  readonly confirmationCode: string;
  readonly activityTitle: string;
  readonly activityImage?: string;
  readonly bookingDate?: string;
  readonly bookingDateTo?: string;
  readonly guests?: number;
  readonly totalAmount?: string;
  readonly isGift?: boolean;
  readonly isGroup?: boolean;
  readonly isPaid?: boolean;
  readonly className?: string;
  readonly compact?: boolean;
};

function BilingualRow({
  labelEn,
  value,
  labelAr,
}: {
  readonly labelEn: string;
  readonly value: React.ReactNode;
  readonly labelAr: string;
}): React.ReactElement {
  return (
    <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center border-b border-slate-100 last:border-b-0">
      <div className="px-3 py-2.5 text-[11px] text-slate-500">{labelEn}</div>
      <div className="border-x border-slate-100 px-3 py-2.5 text-center text-sm font-semibold text-[#0f172a]">
        {value}
      </div>
      <div className="px-3 py-2.5 text-end text-[11px] text-slate-500" dir="rtl">
        {labelAr}
      </div>
    </div>
  );
}

export function BookingInvoiceCard({
  locale,
  confirmationCode,
  activityTitle,
  activityImage,
  bookingDate,
  bookingDateTo,
  guests,
  totalAmount,
  isGift = false,
  isGroup = false,
  isPaid = true,
  className,
  compact = false,
}: BookingInvoiceCardProps): React.ReactElement {
  const ar = locale === "ar";
  const dateLine =
    bookingDate && bookingDateTo && bookingDateTo !== bookingDate
      ? `${bookingDate} → ${bookingDateTo}`
      : bookingDate ?? "—";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#1A1B4B] text-white shadow-2xl",
        className,
      )}
    >
      <div className="relative min-h-[7.5rem] overflow-hidden">
        {activityImage ? (
          <Image
            src={activityImage}
            alt=""
            fill
            className="object-cover opacity-45"
            sizes="(max-width: 640px) 100vw, 420px"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#14163f] to-[#1A1B4B]" />
        )}
        <div className="relative bg-gradient-to-b from-[#1A1B4B]/40 to-[#1A1B4B]/95 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <Image src="/logo-xora.png" alt="Xora" width={88} height={28} className="h-7 w-auto" />
            <div className="text-end">
              <h3 className="text-base font-bold leading-snug sm:text-lg">{activityTitle}</h3>
              <p className="mt-1 text-[11px] text-white/65">
                {ar ? "وثيقة رسمية — Xora" : "Official document — Xora"}
              </p>
              <div className="mt-2 flex flex-wrap justify-end gap-1.5">
                {isGroup ? (
                  <span className="rounded-full border border-teal-400/35 bg-teal-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-teal-100">
                    {ar ? "حجز جماعي" : "Group booking"}
                  </span>
                ) : null}
                {isGift ? (
                  <span className="rounded-full border border-violet-400/35 bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-violet-100">
                    {ar ? "إهداء" : "Gift"}
                  </span>
                ) : null}
                <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold">
                  ✓ {ar ? "مؤكد" : "Confirmed"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3 text-center sm:px-5">
        <div className="mx-auto inline-block rounded-xl bg-white p-3">
          <QRCode
            value={confirmationCode}
            size={compact ? 64 : 88}
            bgColor="#ffffff"
            fgColor="#1A1B4B"
            level="M"
            aria-label={ar ? "رمز QR للحجز" : "Booking QR code"}
          />
        </div>
        <p className="mt-3 font-mono text-2xl font-bold tracking-[0.18em]">{confirmationCode}</p>
        <p className="mt-1 text-[11px] text-white/60">
          {ar ? "رمز التأكيد · تذكرة الحجز" : "Confirmation code · Booking ticket"}
        </p>
      </div>

      <div className="mx-4 mb-4 grid grid-cols-3 overflow-hidden rounded-xl border border-white/12 bg-white/8 sm:mx-5">
        {[
          {
            en: "Total",
            ar: "المبلغ",
            val: totalAmount ?? "—",
          },
          {
            en: "Guests",
            ar: "المشاركون",
            val: guests != null ? `${guests} ${ar ? "فرد" : ""}` : "—",
          },
          {
            en: "Date",
            ar: "التاريخ",
            val: dateLine,
          },
        ].map((item) => (
          <div
            key={item.en}
            className="border-e border-white/10 px-2 py-3 text-center last:border-e-0"
          >
            <p className="text-[10px] leading-tight text-white/60">
              {item.en}
              <br />
              {item.ar}
            </p>
            <p className="mt-1 text-xs font-bold sm:text-sm">{item.val}</p>
          </div>
        ))}
      </div>

      {!compact ? (
        <div className="mx-4 mb-4 overflow-hidden rounded-xl bg-white sm:mx-5">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-[#1A1B4B]">
            <span>Customer Information</span>
            <span dir="rtl">معلومات العميل</span>
          </div>
          <BilingualRow
            labelEn="Activity"
            labelAr="النشاط"
            value={<span className="text-xs sm:text-sm">{activityTitle}</span>}
          />
          <BilingualRow labelEn="Date" labelAr="التاريخ" value={dateLine} />
          <BilingualRow
            labelEn="Status"
            labelAr="الحالة"
            value={
              isPaid ? (
                <span className="inline-block rounded-full bg-gradient-to-r from-teal-500 to-violet-500 px-3 py-0.5 text-[11px] font-bold text-white">
                  {ar ? "مدفوع" : "Paid"}
                </span>
              ) : (
                <span className="text-amber-700">{ar ? "بانتظار الدفع" : "Pending"}</span>
              )
            }
          />
        </div>
      ) : null}
    </article>
  );
}
