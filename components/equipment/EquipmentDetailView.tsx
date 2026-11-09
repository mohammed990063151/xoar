"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EventBookingCalendar } from "@/components/events/EventBookingCalendar";
import { PackageDetailsModal } from "@/components/events/PackageDetailsModal";
import type { EquipmentPackage } from "@/types/equipment-offering";
import {
  GeideaPaymentModal,
  type GeideaPaymentSession,
} from "@/components/payment/GeideaPaymentModal";
import { GeideaWordmark, PaymentBrandMark } from "@/components/payment/PaymentBrandMark";
import { AccordionImageGallery } from "@/components/ui/AccordionImageGallery";
import { ACTIVITY_FALLBACK_IMAGE } from "@/lib/activity";
import { formatMoney, parsePriceAmount } from "@/lib/booking";
import { cn } from "@/lib/cn";
import { categoryLabel } from "@/lib/equipment-categories";
import { formProfileDefaults } from "@/lib/form-profile-cookie";
import { formatSarPrice } from "@/lib/format-price";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { pageBottom, siteContainer } from "@/lib/layout";
import { whatsappHref } from "@/lib/whatsapp";
import { paymentService } from "@/services/paymentService";
import type { EquipmentOffering } from "@/types/equipment-offering";
import type { PaymentConfig, PaymentMethodOption } from "@/types/payment";

interface EquipmentDetailViewProps {
  readonly locale: Locale;
  readonly offering: EquipmentOffering;
}

type TabId = "description" | "specs" | "terms" | "faq";

export function EquipmentDetailView({
  locale,
  offering,
}: EquipmentDetailViewProps): React.ReactElement {
  const ar = locale === "ar";
  const profile = formProfileDefaults();
  const category = categoryLabel(offering.category, locale);

  const galleryImages = useMemo(() => {
    const urls = [offering.image, ...(offering.gallery ?? [])]
      .filter((url): url is string => Boolean(url && url.trim()))
      .map((url) => url.trim());
    return urls.length > 0 ? Array.from(new Set(urls)) : [ACTIVITY_FALLBACK_IMAGE];
  }, [offering.gallery, offering.image]);

  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState<TabId>("description");
  const [selectedPackages, setSelectedPackages] = useState<number[]>([]);
  const [detailsPackage, setDetailsPackage] = useState<EquipmentPackage | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [units, setUnits] = useState(1);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [geideaSession, setGeideaSession] = useState<GeideaPaymentSession | null>(null);

  useEffect(() => {
    let cancelled = false;
    paymentService
      .getConfig(locale)
      .then((cfg) => {
        if (cancelled) return;
        setPaymentConfig(cfg);
        setPaymentMethod(cfg.methods?.[0]?.id ?? "");
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const packagesTotal = offering.packages
    .filter((p) => selectedPackages.includes(p.id))
    .reduce((sum, p) => sum + (p.priceAmount || 0), 0);
  const total = (offering.basePriceAmount || 0) * Math.max(1, units) + packagesTotal;
  const totalLabel = formatMoney(total, locale);

  const tabs = (
    [
      { id: "description" as const, label: ar ? "الوصف" : "Overview", show: true },
      {
        id: "specs" as const,
        label: ar ? "المواصفات" : "Specs",
        show: Boolean(offering.specs?.trim() || offering.whatsIncluded?.trim()),
      },
      {
        id: "terms" as const,
        label: ar ? "الشروط" : "Terms",
        show: Boolean(offering.termsConditions?.trim()),
      },
      {
        id: "faq" as const,
        label: ar ? "أسئلة" : "FAQ",
        show: (offering.faq ?? []).length > 0,
      },
    ] as const
  ).filter((t) => t.show);

  function togglePackage(id: number): void {
    setSelectedPackages((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    if (!dateFrom) {
      setError(ar ? "اختر يوم التأجير." : "Choose the rental day.");
      return;
    }
    if (!paymentMethod) {
      setError(ar ? "اختر طريقة الدفع." : "Choose a payment method.");
      return;
    }
    if (total <= 0) {
      setError(ar ? "السعر غير متاح للحجز." : "This item is not bookable yet.");
      return;
    }
    if (!deliveryLocation.trim()) {
      setError(ar ? "اكتب موقع التسليم أو الفعالية." : "Enter the delivery / event location.");
      return;
    }

    const bookable = new Set(offering.availability?.bookableDates ?? []);
    if (bookable.size > 0) {
      const end = dateTo || dateFrom;
      const a = dateFrom <= end ? dateFrom : end;
      const b = dateFrom <= end ? end : dateFrom;
      let cursor = a;
      while (cursor <= b) {
        if (!bookable.has(cursor)) {
          setError(
            ar
              ? "أحد الأيام في الفترة غير متاح (مقفل أو مكتمل)."
              : "One day in the range is unavailable (locked or full).",
          );
          return;
        }
        const d = new Date(`${cursor}T12:00:00`);
        d.setDate(d.getDate() + 1);
        cursor = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      }
    }

    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await paymentService.submitEquipmentBooking({
        type: "equipment_booking",
        equipment_offering_id: offering.id,
        equipment_package_ids: selectedPackages,
        locale,
        source: "equipment-catalog",
        name: String(fd.get("name")),
        email: String(fd.get("email")),
        phone: String(fd.get("phone") || ""),
        booking_date: dateFrom,
        booking_end_date: dateTo || dateFrom,
        adults: units,
        children: 0,
        total_amount: String(total.toFixed(2)),
        payment_method: paymentMethod,
        location: deliveryLocation.trim(),
        message: [
          `${ar ? "المعدة" : "Equipment"}: ${offering.title}`,
          `${ar ? "فترة التأجير" : "Rental days"}: ${dateFrom}${dateTo && dateTo !== dateFrom ? ` → ${dateTo}` : ""}`,
          `${ar ? "الوحدات" : "Units"}: ${units}`,
          `${ar ? "التسليم" : "Delivery"}: ${deliveryLocation.trim()}`,
          selectedPackages.length
            ? `${ar ? "إضافات" : "Add-ons"}: ${selectedPackages.join(",")}`
            : null,
        ]
          .filter(Boolean)
          .join(" · "),
      });

      if (result.sessionId && result.confirmationCode) {
        const charged = parsePriceAmount(result.totalAmount ?? "");
        setGeideaSession({
          sessionId: result.sessionId,
          confirmationCode: result.confirmationCode,
          checkoutUrl: result.checkoutUrl,
          amountLabel: charged > 0 ? formatMoney(charged, locale) : totalLabel,
        });
        return;
      }
      if (result.requiresRedirect && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      setConfirmationCode(result.confirmationCode ?? `EQ${result.id}`);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : ar ? "تعذّر الحجز." : "Booking failed.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={cn(siteContainer, pageBottom, "py-16 text-center")}>
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
          {ar ? "تم تأكيد الحجز" : "Booking confirmed"}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">
          {ar ? "شكراً لك" : "Thank you"}
        </h1>
        <p className="mt-4 text-slate-300">
          {ar ? "رمز التأكيد" : "Confirmation code"}:{" "}
          <span className="font-semibold text-white">{confirmationCode}</span>
        </p>
        <Link
          href={localizedPath(locale, "/equipment")}
          className="mt-8 inline-flex rounded-full bg-gradient-to-l from-cyan-600 via-sky-500 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-white"
        >
          {ar ? "العودة لكتالوج المعدات" : "Back to equipment"}
        </Link>
      </div>
    );
  }

  const waHref = whatsappHref(offering.contactWhatsapp);

  return (
    <div className={cn(siteContainer, pageBottom, "relative py-8 sm:py-10")}>
      {geideaSession ? (
        <GeideaPaymentModal
          locale={locale}
          session={geideaSession}
          scriptUrl={paymentConfig?.hppScriptUrl}
          onClose={() => {
            setGeideaSession(null);
            setError(
              ar
                ? "تم إلغاء الدفع. يمكنك المحاولة مرة أخرى."
                : "Payment cancelled. You can try again.",
            );
          }}
          onError={(message) => {
            setGeideaSession(null);
            setError(message);
          }}
        />
      ) : null}

      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href={localizedPath(locale, "/equipment")} className="hover:text-white">
          {ar ? "المعدات" : "Equipment"}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-slate-300">{offering.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)] lg:items-start">
        <div className="min-w-0 space-y-6">
          <AccordionImageGallery
            images={galleryImages}
            locale={locale}
            title={offering.title}
            eyebrow={category}
            subtitle={[
              offering.duration,
              offering.basePrice ? formatSarPrice(offering.basePrice, locale) : "",
            ]
              .filter(Boolean)
              .join(" · ")}
            activeIndex={activeImage}
            onActiveChange={setActiveImage}
            variant="dark"
            showCaption={false}
            autoplay={galleryImages.length > 1}
          />

          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300/80">
              {category}
            </p>
            <h1 className="text-[clamp(1.4rem,4vw,2.1rem)] font-bold text-white">{offering.title}</h1>
            {offering.city || offering.location ? (
              <p className="text-sm text-slate-400">
                📍 {[offering.city, offering.location].filter(Boolean).join(" — ")}
              </p>
            ) : null}
          </header>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {offering.duration ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3.5 py-3">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">
                  {ar ? "مدة التأجير" : "Rental period"}
                </p>
                <p className="mt-1 text-sm font-medium text-white">{offering.duration}</p>
              </div>
            ) : null}
            {offering.capacity ? (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3.5 py-3">
                <p className="text-[10px] uppercase tracking-wider text-amber-200/70">
                  {ar ? "الوحدات" : "Units"}
                </p>
                <p className="mt-1 text-sm font-medium text-amber-50">
                  {ar ? `حتى ${offering.capacity}` : `Up to ${offering.capacity}`}
                </p>
              </div>
            ) : null}
            <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-3.5 py-3">
              <p className="text-[10px] uppercase tracking-wider text-cyan-300/80">
                {ar ? "السعر الأساسي" : "Base rate"}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {offering.basePriceAmount > 0
                  ? formatMoney(offering.basePriceAmount, locale)
                  : ar
                    ? "حسب الطلب"
                    : "On request"}
              </p>
            </div>
          </div>

          {(offering.highlights ?? []).length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {(offering.highlights ?? []).map((h, i) => (
                <div
                  key={`${h.title}-${i}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] px-3.5 py-3"
                >
                  <p className="text-sm font-semibold text-white">{h.title}</p>
                  {h.description ? (
                    <p className="mt-1 text-xs text-slate-400">{h.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          <div id="equipment-tabs" className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-sm transition",
                    tab === t.id
                      ? "bg-cyan-500/20 text-cyan-50 ring-1 ring-cyan-400/40"
                      : "bg-white/5 text-slate-400 hover:text-white",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-sm leading-relaxed text-slate-300">
              {tab === "description" ? (
                <p className="whitespace-pre-line">
                  {offering.description ||
                    (ar ? "لا يوجد وصف إضافي." : "No additional description.")}
                </p>
              ) : null}
              {tab === "specs" ? (
                <div className="space-y-4">
                  {offering.specs ? (
                    <p className="whitespace-pre-line">{offering.specs}</p>
                  ) : null}
                  {offering.whatsIncluded ? (
                    <div>
                      <p className="mb-1 font-semibold text-white">
                        {ar ? "يشمل" : "Includes"}
                      </p>
                      <p className="whitespace-pre-line">{offering.whatsIncluded}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {tab === "terms" ? (
                <p className="whitespace-pre-line">{offering.termsConditions}</p>
              ) : null}
              {tab === "faq" ? (
                <div className="space-y-3">
                  {(offering.faq ?? []).map((item, i) => (
                    <details
                      key={`faq-${i}`}
                      className="rounded-xl border border-white/10 bg-black/20 px-3 py-2"
                    >
                      <summary className="cursor-pointer font-semibold text-white">
                        {item.question}
                      </summary>
                      <p className="mt-2 text-slate-400">{item.answer}</p>
                    </details>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <aside id="book" className="scroll-mt-24 space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.35rem] border border-cyan-400/20 bg-cyan-500/5 px-4 py-3 text-sm text-cyan-50">
            {ar
              ? "اختر أيام التأجير، موقع التسليم، والإضافات — ثم ادفع مباشرة."
              : "Pick rental days, delivery location, and add-ons — then pay instantly."}
          </div>

          <div className="booking-panel rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
            <p className="text-lg font-bold text-white">{totalLabel}</p>
            <p className="text-xs text-slate-500">
              {ar ? "الإجمالي التقديري قبل الدفع" : "Estimated total before payment"}
            </p>

            {offering.packages.length ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-slate-200">
                  {ar ? "إضافات اختيارية" : "Optional add-ons"}
                </p>
                {offering.packages.map((pkg) => {
                  const checked = selectedPackages.includes(pkg.id);
                  return (
                    <div
                      key={pkg.id}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-xl border px-2.5 py-2.5 transition",
                        checked
                          ? "border-cyan-400/40 bg-cyan-500/10"
                          : "border-white/10",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => togglePackage(pkg.id)}
                        className="flex min-w-0 flex-1 items-start gap-3 rounded-lg px-0.5 py-0.5 text-start hover:opacity-95"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border text-[10px]",
                            checked
                              ? "border-cyan-300 bg-cyan-400 text-slate-950"
                              : "border-white/30",
                          )}
                        >
                          {checked ? "✓" : ""}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-white">{pkg.title}</span>
                          {pkg.description ? (
                            <span className="mt-0.5 block text-xs text-slate-400 line-clamp-2">
                              {pkg.description}
                            </span>
                          ) : null}
                        </span>
                        <span className="shrink-0 text-xs font-semibold text-emerald-200">
                          +{formatMoney(pkg.priceAmount || 0, locale)}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailsPackage(pkg)}
                        title={ar ? "عرض التفاصيل" : "View details"}
                        aria-label={ar ? `تفاصيل ${pkg.title}` : `Details for ${pkg.title}`}
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/35 bg-cyan-500/10 text-cyan-200 transition hover:border-cyan-300/55 hover:bg-cyan-500/20 hover:text-white"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 10v6" strokeLinecap="round" />
                          <circle cx="12" cy="7.5" r="0.9" fill="currentColor" stroke="none" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <EventBookingCalendar
                locale={locale}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onChange={({ dateFrom: from, dateTo: to }) => {
                  setDateFrom(from);
                  setDateTo(to);
                }}
                availability={offering.availability}
                daysAhead={offering.bookingDaysAhead ?? offering.availability?.bookingDaysAhead ?? 180}
                heading={ar ? "أيام التأجير" : "Rental days"}
                subheading={
                  ar
                    ? "الأيام المقفلة أو المكتملة غير متاحة — اختر البداية ثم النهاية."
                    : "Locked or full days are unavailable — pick start, then end."
                }
              />

              <label className="block text-sm text-slate-300">
                {ar ? "عدد الوحدات" : "Units"}
                <input
                  type="number"
                  min={1}
                  max={offering.capacity || 50}
                  value={units}
                  onChange={(e) => setUnits(Math.max(1, Number(e.target.value) || 1))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                />
              </label>

              <label className="block text-sm text-slate-300">
                {ar ? "موقع التسليم / الفعالية" : "Delivery / event location"}
                <textarea
                  required
                  rows={2}
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder={
                    ar ? "مثال: قاعة الفعاليات — الرياض" : "e.g. Event hall — Riyadh"
                  }
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white placeholder:text-slate-500"
                />
              </label>

              <label className="block text-sm text-slate-300">
                {ar ? "الاسم الكامل" : "Full name"}
                <input
                  name="name"
                  required
                  defaultValue={profile.name}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                />
              </label>
              <label className="block text-sm text-slate-300">
                {ar ? "البريد" : "Email"}
                <input
                  name="email"
                  type="email"
                  required
                  defaultValue={profile.email}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                />
              </label>
              <label className="block text-sm text-slate-300">
                {ar ? "الجوال" : "Phone"}
                <input
                  name="phone"
                  defaultValue={profile.phone}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                />
              </label>

              {paymentConfig?.methods?.length ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">{ar ? "طريقة الدفع" : "Payment method"}</p>
                  {paymentConfig.methods.map((method: PaymentMethodOption) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm",
                        paymentMethod === method.id
                          ? "border-emerald-400/50 bg-emerald-500/10 text-white"
                          : "border-white/10 text-slate-300",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {method.gateway === "geidea" ? (
                          <GeideaWordmark />
                        ) : (
                          <PaymentBrandMark id={method.id} />
                        )}
                        {method.label}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}

              {error ? <p className="text-sm text-rose-300">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-cyan-600 via-sky-500 to-emerald-400 py-3 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(6,182,212,0.3)] transition hover:brightness-110 disabled:opacity-60"
              >
                {loading
                  ? ar
                    ? "جاري المعالجة…"
                    : "Processing…"
                  : ar
                    ? `ادفع ${totalLabel}`
                    : `Pay ${totalLabel}`}
              </button>
            </form>
          </div>

          {waHref || offering.contactPhone ? (
            <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-sm font-semibold text-white">
                {ar ? "تحتاج استشارة تقنية؟" : "Need a tech consult?"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {waHref ? (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-200"
                  >
                    WhatsApp
                  </a>
                ) : null}
                {offering.contactPhone ? (
                  <a
                    href={`tel:${offering.contactPhone.replace(/[^\d+]/g, "")}`}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-200"
                  >
                    {offering.contactPhone}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      <PackageDetailsModal
        locale={locale}
        pkg={detailsPackage}
        selected={detailsPackage ? selectedPackages.includes(detailsPackage.id) : false}
        onClose={() => setDetailsPackage(null)}
        onToggleSelect={() => {
          if (detailsPackage) togglePackage(detailsPackage.id);
        }}
      />
    </div>
  );
}
