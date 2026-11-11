"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EventBookingCalendar } from "@/components/events/EventBookingCalendar";
import { PackageDetailsModal } from "@/components/events/PackageDetailsModal";
import type { EquipmentPackage } from "@/types/equipment-offering";
import { AccordionImageGallery } from "@/components/ui/AccordionImageGallery";
import { ACTIVITY_FALLBACK_IMAGE } from "@/lib/activity";
import { formatMoney } from "@/lib/booking";
import { cn } from "@/lib/cn";
import { categoryLabel } from "@/lib/equipment-categories";
import { formProfileDefaults } from "@/lib/form-profile-cookie";
import { formatSarPrice } from "@/lib/format-price";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { pageBottom, siteContainer } from "@/lib/layout";
import { whatsappHref } from "@/lib/whatsapp";
import { submitInquiry } from "@/services/inquiryService";
import type { EquipmentOffering } from "@/types/equipment-offering";

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
  const minQty = Math.max(1, offering.minQuantity ?? 1);
  const qtyStep = Math.max(1, offering.quantityStep ?? 1);
  const maxQty = Math.max(minQty, offering.capacity || 5000);
  const customizationOptions = offering.customizationOptions ?? [];

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [units, setUnits] = useState(minQty);
  const [customSelections, setCustomSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const packagesTotal = offering.packages
    .filter((p) => selectedPackages.includes(p.id))
    .reduce((sum, p) => sum + (p.priceAmount || 0), 0);
  const total = (offering.basePriceAmount || 0) * Math.max(minQty, units) + packagesTotal;
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

  function snapUnits(raw: number): number {
    const clamped = Math.min(maxQty, Math.max(minQty, raw || minQty));
    const offset = clamped - minQty;
    const snapped = minQty + Math.round(offset / qtyStep) * qtyStep;
    return Math.min(maxQty, Math.max(minQty, snapped));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    if (!dateFrom) {
      setError(ar ? "اختر يوم التأجير." : "Choose the rental day.");
      return;
    }
    if (!deliveryLocation.trim()) {
      setError(ar ? "اكتب موقع التسليم أو الفعالية." : "Enter the delivery / event location.");
      return;
    }
    if (units < minQty) {
      setError(
        ar
          ? `أقل عدد للوحدات هو ${minQty}.`
          : `Minimum units is ${minQty}.`,
      );
      return;
    }

    const customizations = customizationOptions
      .map((opt) => {
        const value = customSelections[opt.key] ?? "";
        const choice = opt.choices.find((c) => c.value === value);
        return {
          key: opt.key,
          label: opt.label,
          value,
          value_label: choice?.label ?? value,
          required: Boolean(opt.required),
        };
      });

    const missing = customizations.find((c) => c.required && !c.value);
    if (missing) {
      setError(
        ar
          ? `اختر: ${missing.label}`
          : `Please choose: ${missing.label}`,
      );
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
    const selectedCustomizationRows = customizations
      .filter((c) => c.value)
      .map(({ key, label, value, value_label }) => ({ key, label, value, value_label }));

    try {
      await submitInquiry({
        type: "service",
        equipment_offering_id: offering.id,
        equipment_package_ids: selectedPackages,
        locale,
        source: "equipment-catalog",
        name: String(fd.get("name")),
        email: String(fd.get("email")),
        phone: String(fd.get("phone") || ""),
        title: offering.title,
        preferred_date: dateFrom,
        preferred_end_date: dateTo || dateFrom,
        booking_date: dateFrom,
        booking_end_date: dateTo || dateFrom,
        adults: units,
        units_count: units,
        location: deliveryLocation.trim(),
        customizations: selectedCustomizationRows,
        message: [
          ar ? "[طلب تأجير معدة من الكتالوج]" : "[Catalog equipment rental request]",
          `${ar ? "المعدة" : "Equipment"}: ${offering.title}`,
          `${ar ? "فترة التأجير" : "Rental days"}: ${dateFrom}${dateTo && dateTo !== dateFrom ? ` → ${dateTo}` : ""}`,
          `${ar ? "الوحدات" : "Units"}: ${units}`,
          `${ar ? "التسليم" : "Delivery"}: ${deliveryLocation.trim()}`,
          selectedCustomizationRows.length
            ? `${ar ? "خيارات" : "Options"}: ${selectedCustomizationRows.map((c) => `${c.label}=${c.value_label}`).join(" · ")}`
            : null,
          selectedPackages.length
            ? `${ar ? "إضافات" : "Add-ons"}: ${selectedPackages.join(",")}`
            : null,
          total > 0
            ? `${ar ? "تقدير السعر" : "Estimated total"}: ${totalLabel}`
            : null,
        ]
          .filter(Boolean)
          .join("\n"),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : ar ? "تعذّر إرسال الطلب." : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={cn(siteContainer, pageBottom, "py-16 text-center")}>
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
          {ar ? "تم استلام الطلب" : "Request received"}
        </p>
        <h1 className="mt-3 text-3xl font-bold text-white">
          {ar ? "شكراً لك" : "Thank you"}
        </h1>
        <p className="mt-4 text-slate-300">
          {ar
            ? "فريق Xora سيتابع طلب المعدات ويتواصل معك قريباً."
            : "The Xora team will follow up on your equipment request shortly."}
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
              ? "أرسل طلب التأجير مع الأيام والوحدات والخيارات — فريق Xora يتابعك بدون دفع فوري."
              : "Send a rental request with days, units, and options — Xora follows up with no instant payment."}
          </div>

          <div className="booking-panel rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
            <p className="text-lg font-bold text-white">{totalLabel}</p>
            <p className="text-xs text-slate-500">
              {ar ? "تقدير مرجعي — الطلب بدون دفع فوري" : "Reference estimate — request only, no instant pay"}
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
                  min={minQty}
                  max={maxQty}
                  step={qtyStep}
                  value={units}
                  onChange={(e) => setUnits(snapUnits(Number(e.target.value) || minQty))}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                />
                <span className="mt-1 block text-xs text-slate-500">
                  {ar
                    ? `يبدأ من ${minQty}${qtyStep > 1 ? ` · بزيادة ${qtyStep}` : ""}`
                    : `Starts at ${minQty}${qtyStep > 1 ? ` · step ${qtyStep}` : ""}`}
                </span>
              </label>

              {customizationOptions.map((opt) => (
                <label key={opt.key} className="block text-sm text-slate-300">
                  {opt.label}
                  {opt.required ? <span className="text-rose-300"> *</span> : null}
                  <select
                    required={Boolean(opt.required)}
                    value={customSelections[opt.key] ?? ""}
                    onChange={(e) =>
                      setCustomSelections((prev) => ({ ...prev, [opt.key]: e.target.value }))
                    }
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
                  >
                    <option value="">
                      {ar ? "اختر…" : "Choose…"}
                    </option>
                    {opt.choices.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}

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

              {error ? <p className="text-sm text-rose-300">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-cyan-600 via-sky-500 to-emerald-400 py-3 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(6,182,212,0.3)] transition hover:brightness-110 disabled:opacity-60"
              >
                {loading
                  ? ar
                    ? "جاري الإرسال…"
                    : "Sending…"
                  : ar
                    ? "أرسل طلب التأجير"
                    : "Send rental request"}
              </button>
            </form>
          </div>

          {waHref || offering.contactPhone ? (
            <div className="booking-panel rounded-2xl border border-white/10 bg-slate-950/50 p-4">
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
