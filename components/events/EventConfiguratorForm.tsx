"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import { GccPhoneField } from "@/components/ui/GccPhoneField";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { pageBottom, pageTitle, siteContainer } from "@/lib/layout";
import {
  formatGccE164,
  isValidGccMobile,
  splitGccPhone,
  toAsciiDigits,
  type GccDialCode,
} from "@/lib/phone";
import { GeideaWordmark, PaymentBrandMark } from "@/components/payment/PaymentBrandMark";
import { useFormProfileAutofill } from "@/hooks/useFormProfileAutofill";
import { submitInquiry } from "@/services/inquiryService";
import { paymentService } from "@/services/paymentService";
import type { PaymentConfig } from "@/types/payment";
import type {
  EventOffering,
  EventOfferingAudience,
  EventOfferingPackage,
} from "@/types/event-offering";

interface EventConfiguratorFormProps {
  readonly locale: Locale;
  readonly audience: EventOfferingAudience;
  readonly offerings: EventOffering[];
  readonly copy: Dictionary["pages"]["requestEvent"];
  readonly page: Dictionary["pages"]["individualEvents"] | Dictionary["pages"]["corporateEvents"];
}

const OTHER = "other" as const;
const HOUR_OPTIONS = [2, 3, 4, 5, 6, 8, 10, 12];

const fieldClass =
  "event-cfg-field mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)]";

type PackageTone = "silver" | "gold" | "diamond" | "custom" | "default";

function packageTone(title: string): PackageTone {
  const t = title.toLowerCase();
  if (/فض|silver|silv/.test(t)) return "silver";
  if (/ذهب|gold|golden/.test(t)) return "gold";
  if (/ماس|diamond|platin/.test(t)) return "diamond";
  if (/أخر|اخر|other|custom|احتياج/.test(t)) return "custom";
  return "default";
}

const toneStyles: Record<
  PackageTone,
  { ring: string; glow: string; icon: string; chip: string }
> = {
  silver: {
    ring: "border-slate-300/50 bg-gradient-to-br from-slate-100/10 to-slate-500/5",
    glow: "shadow-[0_0_0_1px_rgba(226,232,240,0.25)]",
    icon: "◇",
    chip: "text-slate-200",
  },
  gold: {
    ring: "border-amber-400/55 bg-gradient-to-br from-amber-300/15 to-yellow-700/10",
    glow: "shadow-[0_0_0_1px_rgba(251,191,36,0.28)]",
    icon: "♛",
    chip: "text-amber-200",
  },
  diamond: {
    ring: "border-cyan-300/55 bg-gradient-to-br from-cyan-300/15 to-indigo-500/10",
    glow: "shadow-[0_0_0_1px_rgba(103,232,249,0.28)]",
    icon: "✦",
    chip: "text-cyan-200",
  },
  custom: {
    ring: "border-violet-400/50 bg-gradient-to-br from-violet-400/12 to-fuchsia-500/8",
    glow: "shadow-[0_0_0_1px_rgba(167,139,250,0.25)]",
    icon: "✎",
    chip: "text-violet-200",
  },
  default: {
    ring: "border-emerald-400/40 bg-gradient-to-br from-emerald-400/10 to-teal-500/5",
    glow: "shadow-[0_0_0_1px_rgba(52,211,153,0.2)]",
    icon: "◆",
    chip: "text-emerald-200",
  },
};

function formatSar(amount: number, locale: Locale): string {
  if (!Number.isFinite(amount) || amount <= 0) return "";
  try {
    return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-SA", {
      style: "currency",
      currency: "SAR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${Math.round(amount)} SAR`;
  }
}

/** Parse admin duration text (e.g. "4 ساعات") into a select option. */
function hoursFromDuration(duration?: string | null): string | null {
  if (!duration?.trim()) return null;
  const match = duration.match(/(\d{1,2})/);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (HOUR_OPTIONS.includes(n)) return String(n);
  const nearest = HOUR_OPTIONS.reduce((best, h) =>
    Math.abs(h - n) < Math.abs(best - n) ? h : best,
  );
  return String(nearest);
}

function venueLine(offering: EventOffering | null, ar: boolean): string {
  if (!offering) return "";
  const parts = [offering.city?.trim(), offering.location?.trim()].filter(Boolean);
  if (parts.length === 0) return "";
  return parts.join(ar ? " — " : " · ");
}

export function EventConfiguratorForm({
  locale,
  audience,
  offerings,
  copy,
  page,
}: EventConfiguratorFormProps): React.ReactElement {
  const ar = locale === "ar";
  const source =
    audience === "individual" ? "event-request-individual" : "event-request-corporate";

  const [category, setCategory] = useState("");
  const [selectedOfferingId, setSelectedOfferingId] = useState<number | typeof OTHER | null>(
    null,
  );
  const [customOccasion, setCustomOccasion] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState<number | typeof OTHER | null>(null);
  const [customNeeds, setCustomNeeds] = useState("");
  const [notes, setNotes] = useState("");

  const [preferredDate, setPreferredDate] = useState("");
  const [guestsCount, setGuestsCount] = useState("");
  const [hours, setHours] = useState("4");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dialCode, setDialCode] = useState<GccDialCode>("966");
  const [phoneNational, setPhoneNational] = useState("");
  const [phoneSeed, setPhoneSeed] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [sent, setSent] = useState(false);
  const [paidCode, setPaidCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useFormProfileAutofill({ setName, setEmail, setPhone: setPhoneSeed, setCity });

  useEffect(() => {
    if (!phoneSeed.trim() || phoneNational.trim()) return;
    const split = splitGccPhone(phoneSeed);
    setDialCode(split.dial);
    setPhoneNational(split.national.replace(/^0+/, ""));
  }, [phoneSeed, phoneNational]);

  useEffect(() => {
    let alive = true;
    void paymentService.getConfig(locale).then((cfg) => {
      if (!alive) return;
      setPaymentConfig(cfg);
      const first = cfg.methods?.[0]?.id ?? "";
      setPaymentMethod((prev) => prev || first);
    });
    return () => {
      alive = false;
    };
  }, [locale]);

  const phoneNationalClean = toAsciiDigits(phoneNational).replace(/^0+/, "");
  const phoneValid = isValidGccMobile(phoneNationalClean, dialCode);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const item of offerings) {
      const label = item.category?.trim();
      if (label) set.add(label);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, locale === "ar" ? "ar" : "en"));
  }, [offerings, locale]);

  const hasCategories = categories.length > 0;

  const occasions = useMemo(() => {
    if (!hasCategories) return offerings;
    if (!category.trim()) return [];
    return offerings.filter((item) => (item.category?.trim() || "") === category.trim());
  }, [offerings, hasCategories, category]);

  const selectedOffering =
    typeof selectedOfferingId === "number"
      ? (offerings.find((item) => item.id === selectedOfferingId) ?? null)
      : null;
  const isOtherOccasion = selectedOfferingId === OTHER;
  const packages = selectedOffering?.packages ?? [];
  const isOtherPackage = selectedPackageId === OTHER;
  const selectedPackage =
    typeof selectedPackageId === "number"
      ? (packages.find((pkg) => pkg.id === selectedPackageId) ?? null)
      : null;

  // Prefill guests / hours / city from the admin offering when the customer picks it.
  useEffect(() => {
    if (typeof selectedOfferingId !== "number") return;
    const offering = offerings.find((item) => item.id === selectedOfferingId);
    if (!offering) return;
    if (offering.capacity && offering.capacity > 0) {
      setGuestsCount(String(offering.capacity));
    }
    const parsedHours = hoursFromDuration(offering.duration);
    if (parsedHours) setHours(parsedHours);
    if (offering.city?.trim()) {
      setCity(offering.city.trim());
    }
  }, [selectedOfferingId, offerings]);

  const packagePrice = selectedPackage?.priceAmount ?? 0;
  const basePrice = selectedOffering?.basePriceAmount ?? 0;
  const payableTotal =
    typeof selectedPackageId === "number" && packagePrice > 0 ? basePrice + packagePrice : 0;
  const canPay = payableTotal > 0 && !isOtherOccasion && !isOtherPackage;
  const showPackages = typeof selectedOfferingId === "number";
  const showCustomNeeds = isOtherOccasion || isOtherPackage;
  const fixedVenue = selectedOffering?.locationMode === "fixed";
  const offeringVenue = venueLine(selectedOffering, ar);
  const locationForSubmit = fixedVenue
    ? offeringVenue || city.trim()
    : [city.trim(), selectedOffering?.location?.trim()].filter(Boolean).join(ar ? " — " : " · ") ||
      city.trim();

  const occasionLabel = isOtherOccasion
    ? customOccasion.trim() || (ar ? "أخرى" : "Other")
    : selectedOffering?.title ?? "";

  const packageLabel = isOtherPackage
    ? ar
      ? "أخرى (احتياجاتي)"
      : "Other (my needs)"
    : selectedPackage?.title ?? "";

  function resetPackageChoice(): void {
    setSelectedPackageId(null);
    setCustomNeeds("");
  }

  function handleCategoryChange(value: string): void {
    setCategory(value);
    setSelectedOfferingId(null);
    setCustomOccasion("");
    resetPackageChoice();
  }

  function handleOccasionChange(value: string): void {
    if (value === OTHER) {
      setSelectedOfferingId(OTHER);
      resetPackageChoice();
      return;
    }
    if (value === "") {
      setSelectedOfferingId(null);
      setCustomOccasion("");
      resetPackageChoice();
      return;
    }
    setSelectedOfferingId(Number(value));
    setCustomOccasion("");
    resetPackageChoice();
  }

  const detailsDone = Boolean(
    preferredDate.trim() &&
      guestsCount.trim() &&
      city.trim() &&
      budget.trim() &&
      name.trim() &&
      email.trim() &&
      phoneValid &&
      (hasCategories ? category.trim() : true) &&
      (isOtherOccasion
        ? customOccasion.trim()
        : typeof selectedOfferingId === "number"),
  );

  const packageDone = isOtherOccasion
    ? Boolean(customNeeds.trim() || customOccasion.trim())
    : isOtherPackage
      ? Boolean(customNeeds.trim())
      : typeof selectedPackageId === "number";

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");

    if (!detailsDone) {
      setError(
        ar
          ? "أكمل نوع المناسبة والمناسبة والتفاصيل وبيانات التواصل."
          : "Complete event type, occasion, details, and contact info.",
      );
      return;
    }
    if (!packageDone) {
      setError(
        ar
          ? isOtherOccasion || isOtherPackage
            ? "اكتب احتياجاتك أو تفاصيل طلبك."
            : "اختر باقة جاهزة، أو «أخرى» لكتابة طلبك."
          : isOtherOccasion || isOtherPackage
            ? "Write your needs or request details."
            : "Pick a ready package, or Other to describe your needs.",
      );
      return;
    }
    if (canPay && !paymentMethod) {
      setError(ar ? "اختر طريقة الدفع." : "Choose a payment method.");
      return;
    }

    const phoneE164 = formatGccE164(dialCode, phoneNationalClean);
    const title = [occasionLabel, packageLabel].filter(Boolean).join(" — ") ||
      (ar ? "طلب فعالية" : "Event request");

    const messageLines = [
      ar ? "[طلب فعالية من الموقع]" : "[Website event request]",
      `${ar ? "الجمهور" : "Audience"}: ${audience}`,
      category ? `${ar ? "نوع المناسبة" : "Event type"}: ${category}` : null,
      `${ar ? "المناسبة" : "Occasion"}: ${occasionLabel}`,
      isOtherOccasion ? `${ar ? "وصف المناسبة" : "Custom occasion"}: ${customOccasion.trim()}` : null,
      packageLabel ? `${ar ? "الباقة" : "Package"}: ${packageLabel}` : null,
      hours ? `${ar ? "عدد الساعات" : "Hours"}: ${hours}` : null,
      selectedOffering?.duration
        ? `${ar ? "المدة المقترحة" : "Suggested duration"}: ${selectedOffering.duration}`
        : null,
      selectedOffering?.capacity
        ? `${ar ? "الضيوف المقترحون" : "Suggested guests"}: ${selectedOffering.capacity}`
        : null,
      locationForSubmit
        ? `${ar ? "الموقع" : "Location"}: ${locationForSubmit}`
        : null,
      `${ar ? "الميزانية التقريبية" : "Approx. budget"}: ${budget.trim()}`,
      canPay && payableTotal > 0
        ? `${ar ? "المبلغ" : "Amount"}: ${formatSar(payableTotal, locale)}`
        : null,
      customNeeds.trim()
        ? `${ar ? "الاحتياجات / الطلبات" : "Needs / requests"}: ${customNeeds.trim()}`
        : null,
      notes.trim() ? `${ar ? "ملاحظات" : "Notes"}: ${notes.trim()}` : null,
    ].filter(Boolean);

    setLoading(true);
    try {
      if (canPay) {
        const result = await paymentService.submitEventBooking({
          type: "event_booking",
          source,
          locale,
          name: name.trim(),
          email: email.trim(),
          phone: phoneE164,
          event_type: audience === "corporate" ? "corporate" : "private",
          title,
          description: [customNeeds.trim(), notes.trim()].filter(Boolean).join("\n") || undefined,
          preferred_date: preferredDate || undefined,
          booking_date: preferredDate || undefined,
          location: locationForSubmit || undefined,
          guests_count: guestsCount ? Number(guestsCount) : undefined,
          adults: guestsCount ? Number(guestsCount) : undefined,
          event_offering_id: typeof selectedOfferingId === "number" ? selectedOfferingId : undefined,
          event_package_ids:
            typeof selectedPackageId === "number" ? [selectedPackageId] : undefined,
          event_slug: selectedOffering?.slug,
          payment_method: paymentMethod,
          message: messageLines.join("\n"),
        });

        if (result.requiresRedirect && result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
          return;
        }
        if (result.sessionId && result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
          return;
        }
        setPaidCode(result.confirmationCode ?? `EV${result.id}`);
        setSent(true);
        return;
      }

      await submitInquiry({
        type: "service",
        source,
        locale,
        name: name.trim(),
        email: email.trim(),
        phone: phoneE164,
        event_type: audience === "corporate" ? "corporate" : "private",
        title,
        description:
          [customNeeds.trim() || customOccasion.trim(), notes.trim()].filter(Boolean).join("\n") ||
          undefined,
        preferred_date: preferredDate || undefined,
        location: locationForSubmit || undefined,
        guests_count: guestsCount ? Number(guestsCount) : undefined,
        event_offering_id: typeof selectedOfferingId === "number" ? selectedOfferingId : undefined,
        event_package_ids:
          typeof selectedPackageId === "number" ? [selectedPackageId] : undefined,
        event_slug: selectedOffering?.slug,
        message: messageLines.join("\n"),
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : ar ? "تعذّر إرسال الطلب" : "Could not submit");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className={cn(pageBottom, siteContainer)}>
        <div className="mx-auto max-w-xl rounded-3xl border border-emerald-400/25 bg-emerald-500/10 p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            {paidCode ? (ar ? "تم الدفع" : "Paid") : copy.successTitle}
          </p>
          <h2 className="mt-3 text-2xl font-bold text-white">
            {paidCode
              ? ar
                ? "تم إنشاء حجزك بنجاح"
                : "Your booking was created"
              : copy.success}
          </h2>
          {paidCode ? (
            <p className="mt-3 text-sm text-slate-300" dir="ltr">
              {ar ? "رمز التأكيد:" : "Confirmation:"} {paidCode}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-300">{copy.success}</p>
          )}
          <button
            type="button"
            className="mt-6 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900"
            onClick={() => {
              setSent(false);
              setPaidCode("");
              setSelectedPackageId(null);
              setCustomNeeds("");
              setNotes("");
            }}
          >
            {copy.sendAnother}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(pageBottom, "event-configurator")}>
      <div className={siteContainer}>
        <SlideInEdge>
          <header className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-400/90">
              {page.eyebrow}
            </p>
            <h1 className={pageTitle}>{page.title}</h1>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">{page.intro}</p>
          </header>
        </SlideInEdge>

        <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-4xl space-y-6">
          {/* 01 Details */}
          <section className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              01 — {ar ? "التفاصيل" : "Details"}
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              {ar ? "وش مناسبتك؟" : "What’s your occasion?"}
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {hasCategories ? (
                <label className="block text-sm text-slate-200">
                  {ar ? "نوع المناسبة" : "Event type"}
                  <select
                    required
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">{ar ? "اختر النوع" : "Select type"}</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className={cn("block text-sm text-slate-200", !hasCategories && "sm:col-span-2")}>
                {ar ? "وش مناسبتك" : "Your occasion"}
                <select
                  required
                  value={
                    selectedOfferingId === OTHER
                      ? OTHER
                      : typeof selectedOfferingId === "number"
                        ? String(selectedOfferingId)
                        : ""
                  }
                  onChange={(e) => handleOccasionChange(e.target.value)}
                  className={fieldClass}
                  disabled={hasCategories && !category}
                >
                  <option value="">
                    {hasCategories && !category
                      ? ar
                        ? "اختر نوع المناسبة أولاً"
                        : "Pick event type first"
                      : ar
                        ? "اختر المناسبة"
                        : "Select occasion"}
                  </option>
                  {occasions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                  <option value={OTHER}>{ar ? "أخرى" : "Other"}</option>
                </select>
              </label>

              {isOtherOccasion ? (
                <label className="block text-sm text-slate-200 sm:col-span-2">
                  {ar ? "اكتب مناسبتك" : "Describe your occasion"}
                  <input
                    required
                    value={customOccasion}
                    onChange={(e) => setCustomOccasion(e.target.value)}
                    className={fieldClass}
                    placeholder={ar ? "مثال: حفل تخرج خاص" : "e.g. Private graduation"}
                  />
                </label>
              ) : null}

              {selectedOffering?.description?.trim() ? (
                <p className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-slate-300">
                  {selectedOffering.description}
                </p>
              ) : null}

              {fixedVenue && offeringVenue ? (
                <p className="sm:col-span-2 text-sm text-cyan-200/90">
                  {ar ? "الموقع:" : "Venue:"} {offeringVenue}
                </p>
              ) : null}

              <label className="block text-sm text-slate-200">
                {ar ? "تاريخ المناسبة" : "Event date"}
                <input
                  required
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm text-slate-200">
                {copy.guestsCount}
                <input
                  required
                  inputMode="numeric"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(toAsciiDigits(e.target.value).slice(0, 5))}
                  className={fieldClass}
                  placeholder={
                    selectedOffering?.capacity
                      ? String(selectedOffering.capacity)
                      : "40"
                  }
                />
              </label>
              <label className="block text-sm text-slate-200">
                {ar ? "عدد الساعات" : "Hours"}
                <select
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className={fieldClass}
                >
                  {HOUR_OPTIONS.map((h) => (
                    <option key={h} value={String(h)}>
                      {h} {ar ? "ساعات" : "hours"}
                      {selectedOffering?.duration &&
                      hoursFromDuration(selectedOffering.duration) === String(h)
                        ? ar
                          ? " (مقترح)"
                          : " (suggested)"
                        : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm text-slate-200">
                {copy.city}
                <input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={fieldClass}
                  placeholder={
                    selectedOffering?.city?.trim() || copy.cityPlaceholder
                  }
                  readOnly={fixedVenue && Boolean(selectedOffering?.city?.trim())}
                />
              </label>
              <label className="block text-sm text-slate-200 sm:col-span-2">
                {copy.budget}
                <input
                  required
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className={fieldClass}
                  placeholder={copy.budgetPlaceholder}
                />
              </label>
              <label className="block text-sm text-slate-200">
                {copy.name}
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={fieldClass}
                  autoComplete="name"
                />
              </label>
              <label className="block text-sm text-slate-200">
                {copy.email}
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={fieldClass}
                  autoComplete="email"
                  dir="ltr"
                />
              </label>
              <div className="sm:col-span-2">
                <GccPhoneField
                  locale={locale}
                  dialCode={dialCode}
                  national={phoneNational}
                  onDialChange={setDialCode}
                  onNationalChange={setPhoneNational}
                  label={copy.phone}
                  countryLabel={copy.phoneCountry}
                  placeholder={copy.phonePlaceholder}
                  invalid={phoneNationalClean.length > 0 && !phoneValid}
                  invalidMessage={copy.phoneInvalid}
                  fieldClassName={fieldClass}
                  id="event-phone"
                />
              </div>
            </div>
          </section>

          {/* 02 Packages */}
          <AnimatePresence initial={false}>
            {showPackages || isOtherOccasion ? (
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5 sm:p-6"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                  02 — {ar ? "الباقة" : "Package"}
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  {isOtherOccasion
                    ? ar
                      ? "اكتب احتياجاتك بنفسك"
                      : "Write your own needs"
                    : ar
                      ? "اختر الباقة المناسبة"
                      : "Choose the right package"}
                </h2>

                {showPackages ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {packages.map((pkg) => (
                      <PackageCard
                        key={pkg.id}
                        pkg={pkg}
                        locale={locale}
                        active={selectedPackageId === pkg.id}
                        onSelect={() => {
                          setSelectedPackageId(pkg.id);
                          setCustomNeeds("");
                        }}
                      />
                    ))}
                    <PackageCard
                      locale={locale}
                      active={isOtherPackage}
                      custom
                      onSelect={() => setSelectedPackageId(OTHER)}
                      title={ar ? "أخرى (احتياجاتي)" : "Other (my needs)"}
                      description={
                        ar
                          ? "ما لقيت باقتك؟ اكتب طلبك وسنجهّزه لك."
                          : "Don’t see your package? Describe it and we’ll build it."
                      }
                    />
                  </div>
                ) : null}

                {selectedPackage && !isOtherPackage ? (
                  <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                    {selectedPackage.details?.trim() || selectedPackage.description?.trim() ? (
                      <p className="leading-relaxed">
                        {selectedPackage.details?.trim() || selectedPackage.description}
                      </p>
                    ) : null}
                    {selectedPackage.features && selectedPackage.features.length > 0 ? (
                      <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                        {selectedPackage.features.map((feature) => (
                          <li key={feature} className="text-slate-400">
                            • {feature}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {basePrice > 0 || (selectedPackage.priceAmount ?? 0) > 0 ? (
                      <p className="mt-2 text-emerald-300">
                        {ar ? "السعر:" : "Price:"}{" "}
                        {formatSar(
                          (selectedPackage.priceAmount ?? 0) + (basePrice > 0 ? basePrice : 0),
                          locale,
                        )}
                        {basePrice > 0 && (selectedPackage.priceAmount ?? 0) > 0
                          ? ar
                            ? ` (أساسي ${formatSar(basePrice, locale)} + الباقة)`
                            : ` (base ${formatSar(basePrice, locale)} + package)`
                          : null}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {showCustomNeeds ? (
                  <label className="mt-5 block text-sm text-slate-200">
                    {ar ? "اكتب احتياجاتك بنفسك" : "Write your needs yourself"}
                    <textarea
                      required
                      rows={4}
                      value={customNeeds}
                      onChange={(e) => setCustomNeeds(e.target.value)}
                      className={fieldClass}
                      placeholder={
                        ar
                          ? "مثال: ديكور بالألوان الأخضر والذهبي، بوفيه مفتوح، منسق DJ"
                          : "e.g. Green & gold décor, open buffet, DJ coordinator"
                      }
                    />
                  </label>
                ) : null}
              </motion.section>
            ) : null}
          </AnimatePresence>

          {/* 03 Notes */}
          <section className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
              03 — {ar ? "الطلبات الخاصة" : "Special requests"}
            </p>
            <h2 className="mt-1 text-xl font-bold text-white">
              {ar ? "تفاصيل إضافية أو ملاحظات (اختياري)" : "Extra details or notes (optional)"}
            </h2>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={fieldClass}
              placeholder={
                ar
                  ? "أي تفاصيل تبغى فريق إكزورا يعرفها قبل التواصل معك"
                  : "Anything you want the Xora team to know before we contact you"
              }
            />

            {canPay && paymentConfig?.methods?.length ? (
              <div className="mt-5">
                <p className="text-sm font-medium text-slate-200">
                  {ar ? "طريقة الدفع" : "Payment method"}
                </p>
                {paymentConfig.driver === "geidea" ? (
                  <div className="mt-2 space-y-2">
                    {paymentConfig.methods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={
                          paymentMethod === method.id
                            ? "w-full rounded-xl border border-cyan-400/50 bg-cyan-500/10 px-3 py-3 text-start"
                            : "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-start hover:border-white/20"
                        }
                      >
                        {method.id === "tabby" || method.id === "tamara" ? (
                          <>
                            <span className="flex items-center justify-between gap-2">
                              <PaymentBrandMark
                                id={method.id}
                                className={
                                  method.id === "tamara" ? "h-9 !w-[6rem]" : "h-8 w-[4.5rem]"
                                }
                              />
                              <span className="text-[11px] font-semibold text-slate-200">
                                {method.label}
                              </span>
                            </span>
                            {payableTotal > 0 ? (
                              <span className="mt-2 block text-[11px] leading-relaxed text-slate-400">
                                {method.id === "tamara"
                                  ? ar
                                    ? `قسّطها على 3 دفعات من ${formatSar(payableTotal / 3, locale)}`
                                    : `Split into 3 payments of ${formatSar(payableTotal / 3, locale)}`
                                  : ar
                                    ? `4 دفعات بقيمة ${formatSar((payableTotal * 1.015) / 4, locale)} شهريًا أو حتى 12 شهرًا`
                                    : `4 payments of ${formatSar((payableTotal * 1.015) / 4, locale)}/mo or up to 12 months`}
                              </span>
                            ) : null}
                          </>
                        ) : (
                          <>
                            <span className="flex items-center justify-between gap-2">
                              <GeideaWordmark />
                              <span className="text-[11px] font-semibold text-slate-200">
                                {method.label}
                              </span>
                            </span>
                            <span className="mt-2.5 flex flex-wrap items-center gap-1.5">
                              {(method.brands ?? []).map((brand) => (
                                <PaymentBrandMark
                                  key={brand}
                                  id={brand}
                                  className="h-8 w-16"
                                />
                              ))}
                            </span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {paymentConfig.methods.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={
                          paymentMethod === method.id
                            ? "flex flex-col items-center gap-2 rounded-xl border border-cyan-400/50 bg-cyan-500/15 px-2 py-3 text-xs font-semibold text-cyan-100"
                            : "flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-3 text-xs text-slate-300 hover:border-white/20"
                        }
                      >
                        <PaymentBrandMark id={method.id} />
                        {method.label}
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-sm text-emerald-300">
                  {ar ? "المبلغ:" : "Amount:"} {formatSar(payableTotal, locale)}
                </p>
                {paymentConfig.methods.some((m) => m.brands?.includes("apple")) ? (
                  <p className="mt-1 text-xs text-slate-400">
                    {ar
                      ? "زر Apple Pay يظهر في صفحة الدفع على Safari / أجهزة Apple بعد تفعيله لدى Geidea."
                      : "Apple Pay appears on the checkout page in Safari / Apple devices once enabled by Geidea."}
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">
              {[
                category ? `${ar ? "النوع" : "Type"}: ${category}` : null,
                occasionLabel ? `${ar ? "المناسبة" : "Occasion"}: ${occasionLabel}` : null,
                packageLabel ? `${ar ? "الباقة" : "Package"}: ${packageLabel}` : null,
                hours ? `${ar ? "الساعات" : "Hours"}: ${hours}` : null,
              ]
                .filter(Boolean)
                .join(" · ") || (ar ? "ابدأ باختيار نوع المناسبة" : "Start by picking an event type")}
            </p>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-gradient-to-l from-emerald-400 to-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 disabled:opacity-60"
            >
              {loading
                ? copy.sending
                : canPay
                  ? ar
                    ? "الدفع مباشرة"
                    : "Pay now"
                  : copy.submit}
            </button>
          </div>

          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        </form>
      </div>
    </div>
  );
}

function PackageCard({
  pkg,
  locale,
  active,
  onSelect,
  custom = false,
  title,
  description,
}: {
  readonly pkg?: EventOfferingPackage;
  readonly locale: Locale;
  readonly active: boolean;
  readonly onSelect: () => void;
  readonly custom?: boolean;
  readonly title?: string;
  readonly description?: string;
}): React.ReactElement {
  const label = title ?? pkg?.title ?? "";
  const tone = custom ? "custom" : packageTone(label);
  const style = toneStyles[tone];
  const price =
    pkg?.priceAmount && pkg.priceAmount > 0 ? formatSar(pkg.priceAmount, locale) : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex min-h-[9.5rem] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-5 text-center transition",
        style.ring,
        active ? cn(style.glow, "scale-[1.02]") : "opacity-90 hover:opacity-100",
        active && "ring-2 ring-emerald-400/70",
      )}
    >
      <span className={cn("text-2xl", style.chip)} aria-hidden>
        {style.icon}
      </span>
      <span className="text-sm font-bold text-white">{label}</span>
      {description || pkg?.description ? (
        <span className="line-clamp-2 text-[11px] leading-relaxed text-slate-400">
          {description ?? pkg?.description}
        </span>
      ) : null}
      {pkg?.features && pkg.features.length > 0 ? (
        <ul className="mt-1 w-full space-y-0.5 text-start">
          {pkg.features.slice(0, 4).map((feature) => (
            <li
              key={feature}
              className="line-clamp-1 text-[10px] leading-snug text-slate-400"
            >
              • {feature}
            </li>
          ))}
        </ul>
      ) : null}
      {price ? <span className={cn("text-xs font-semibold", style.chip)}>{price}</span> : null}
      {pkg?.badge ? (
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-200">
          {pkg.badge}
        </span>
      ) : null}
    </button>
  );
}
