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
  readonly customerName?: string;
  readonly customerEmail?: string;
  readonly customerPhone?: string;
  readonly paymentMethod?: string;
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
    <div className="booking-invoice-row grid grid-cols-[1fr_1.35fr_1fr] items-center border-b border-white/[0.08] last:border-b-0">
      <div className="booking-invoice-label px-3 py-2.5 text-[10px] text-white/50">{labelEn}</div>
      <div className="booking-invoice-value border-x border-white/[0.08] px-3 py-2.5 text-center text-sm font-semibold text-white">
        {value}
      </div>
      <div className="booking-invoice-label px-3 py-2.5 text-end text-[10px] text-white/50" dir="rtl">
        {labelAr}
      </div>
    </div>
  );
}

function SectionHead({
  titleEn,
  titleAr,
}: {
  readonly titleEn: string;
  readonly titleAr: string;
}): React.ReactElement {
  return (
    <div className="booking-invoice-section-head flex items-center justify-between border-b border-white/10 bg-black/25 px-3 py-2 text-[11px] font-bold text-white">
      <span>{titleEn}</span>
      <span dir="rtl">{titleAr}</span>
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
  customerName,
  customerEmail,
  customerPhone,
  paymentMethod,
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
        "booking-invoice-card overflow-hidden rounded-[1.35rem] border border-white/12 bg-[#1A1B4B] text-white shadow-2xl",
        className,
      )}
    >
      <div className="relative min-h-[9rem] overflow-hidden">
        {activityImage ? (
          <Image
            src={activityImage}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 420px"
            unoptimized
          />
        ) : (
          <div className="booking-invoice-hero-fallback absolute inset-0 bg-gradient-to-br from-[#14163f] to-[#1A1B4B]" />
        )}
        <div className="booking-invoice-hero-overlay relative bg-gradient-to-b from-[#1A1B4B]/10 via-[#1A1B4B]/70 to-[#1A1B4B]/98 p-4 sm:min-h-[9rem] sm:p-5">
          <div className="flex items-end justify-between gap-3">
            <Image src="/logo-xora.png" alt="Xora" width={92} height={30} className="h-7 w-auto" />
            <div className="max-w-[62%] text-end">
              <h3 className="booking-invoice-title text-sm font-bold leading-snug sm:text-base">{activityTitle}</h3>
              <p className="booking-invoice-subtitle mt-1 text-[10px] text-white/65">
                {ar ? "وثيقة رسمية — Xora" : "Official document — Xora"}
              </p>
              <div className="mt-2 flex flex-wrap justify-end gap-1.5">
                {isGroup ? (
                  <span className="booking-invoice-badge booking-invoice-badge-group rounded-full border border-teal-400/35 bg-teal-500/15 px-2.5 py-0.5 text-[9px] font-semibold text-teal-100">
                    Group Booking | حجز جماعي
                  </span>
                ) : null}
                {isGift ? (
                  <span className="booking-invoice-badge booking-invoice-badge-gift rounded-full border border-violet-400/35 bg-violet-500/15 px-2.5 py-0.5 text-[9px] font-semibold text-violet-100">
                    Gift | إهداء
                  </span>
                ) : null}
                <span className="booking-invoice-badge booking-invoice-badge-confirmed rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[9px] font-semibold">
                  Confirmed | مؤكد
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 pt-4 text-center sm:px-5">
        <div className="booking-invoice-qr mx-auto inline-block rounded-[14px] bg-white p-3 shadow-lg shadow-black/30">
          <QRCode
            value={confirmationCode}
            size={compact ? 72 : 96}
            bgColor="#ffffff"
            fgColor="#1A1B4B"
            level="M"
            aria-label={ar ? "رمز QR للحجز" : "Booking QR code"}
          />
        </div>
        <p className="booking-invoice-caption mt-3 text-[11px] text-white/60">
          Confirmation Code | رمز تأكيد الحجز
        </p>
        <p className="booking-invoice-code mt-1 font-mono text-[1.65rem] font-bold tracking-[0.16em]">
          {confirmationCode}
        </p>
      </div>

      <div className="booking-invoice-summary mx-4 mb-4 grid grid-cols-3 overflow-hidden rounded-xl border border-white/12 bg-white/[0.07] sm:mx-5">
        {[
          {
            en: "Total Amount",
            ar: "المبلغ الإجمالي",
            val: totalAmount ?? "—",
          },
          {
            en: "Total Participants",
            ar: "إجمالي المشاركين",
            val: guests != null ? `${guests} Persons | أشخاص` : "—",
          },
          {
            en: "Activity Date",
            ar: "تاريخ الفعالية",
            val: dateLine,
          },
        ].map((item) => (
          <div
            key={item.en}
            className="booking-invoice-summary-cell border-e border-white/10 px-2 py-3 text-center last:border-e-0"
          >
            <p className="booking-invoice-summary-label text-[9px] leading-tight text-white/55">
              {item.en}
              <br />
              {item.ar}
            </p>
            <p className="booking-invoice-summary-value mt-1.5 text-[11px] font-bold leading-snug sm:text-xs">
              {item.val}
            </p>
          </div>
        ))}
      </div>

      {!compact ? (
        <div className="mx-4 mb-4 space-y-2 sm:mx-5">
          {(customerName || customerEmail || customerPhone) ? (
            <div className="booking-invoice-section overflow-hidden rounded-xl border border-white/11 bg-white/[0.05]">
              <SectionHead titleEn="Customer Information" titleAr="بيانات العميل" />
              {customerName ? (
                <BilingualRow labelEn="Name" labelAr="الاسم" value={customerName} />
              ) : null}
              {customerEmail ? (
                <BilingualRow labelEn="Email" labelAr="البريد" value={customerEmail} />
              ) : null}
              {customerPhone ? (
                <BilingualRow labelEn="Phone" labelAr="الجوال" value={customerPhone} />
              ) : null}
            </div>
          ) : null}

          <div className="booking-invoice-section overflow-hidden rounded-xl border border-white/11 bg-white/[0.05]">
            <SectionHead titleEn="Booking Details" titleAr="تفاصيل الحجز" />
            <BilingualRow labelEn="Activity Date" labelAr="تاريخ الفعالية" value={dateLine} />
            {guests != null ? (
              <BilingualRow
                labelEn="Total Participants"
                labelAr="إجمالي المشاركين"
                value={String(guests)}
              />
            ) : null}
          </div>

          <div className="booking-invoice-section overflow-hidden rounded-xl border border-white/11 bg-white/[0.05]">
            <SectionHead titleEn="Activity" titleAr="النشاط" />
            <BilingualRow labelEn="Activity Name" labelAr="اسم النشاط" value={activityTitle} />
          </div>

          <div className="booking-invoice-section overflow-hidden rounded-xl border border-white/11 bg-white/[0.05]">
            <SectionHead titleEn="Payment" titleAr="الدفع" />
            {paymentMethod ? (
              <BilingualRow labelEn="Payment Method" labelAr="طريقة الدفع" value={paymentMethod} />
            ) : null}
            {totalAmount ? (
              <BilingualRow labelEn="Total Amount" labelAr="المبلغ الإجمالي" value={totalAmount} />
            ) : null}
            <BilingualRow
              labelEn="Payment Status"
              labelAr="حالة الدفع"
              value={
                isPaid ? (
                  <span className="inline-block rounded-full bg-gradient-to-r from-teal-500 via-indigo-500 to-violet-500 px-3 py-0.5 text-[11px] font-bold text-white">
                    Paid | مدفوع
                  </span>
                ) : (
                  <span className="booking-invoice-pending text-amber-200">Pending | بانتظار الدفع</span>
                )
              }
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}
