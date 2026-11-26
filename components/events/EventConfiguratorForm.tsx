"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import { PackageDetailsModal } from "@/components/events/PackageDetailsModal";
import { LocationMapPicker } from "@/components/events/LocationMapPicker";
import { GccPhoneField } from "@/components/ui/GccPhoneField";
import { ACTIVITY_FALLBACK_IMAGE } from "@/lib/activity";
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
  /** From admin general settings — falls back to defaults when empty. */
  readonly budgetOptions?: readonly number[];
  readonly hourOptions?: readonly number[];
}

const OTHER = "other" as const;
const DEFAULT_HOUR_OPTIONS = [2, 3, 4, 5, 6, 8, 10, 12];
const DEFAULT_BUDGET_OPTIONS = [
  3000, 5000, 8000, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000,
];

function normalizeNumberOptions(
  values: readonly number[] | undefined,
  fallback: number[],
): number[] {
  const cleaned = (values ?? [])
    .map((n) => Number(n))
    .filter((n) => Number.isFinite(n) && n > 0)
    .map((n) => Math.round(n));
  const unique = Array.from(new Set(cleaned)).sort((a, b) => a - b);
  return unique.length > 0 ? unique : fallback;
}

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

function parseBudgetAmount(raw: string): number {
  const digits = toAsciiDigits(raw).replace(/[^\d.]/g, "");
  if (!digits) return 0;
  const n = Number(digits);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function packageCover(
  pkg: EventOfferingPackage,
  offering: EventOffering | null,
): string {
  const fromPkg = pkg.image?.trim();
  if (fromPkg) return fromPkg;
  const fromWork = pkg.works?.find((w) => w.image?.trim())?.image?.trim();
  if (fromWork) return fromWork;
  const fromGallery = offering?.gallery?.find((url) => url?.trim())?.trim();
  if (fromGallery) return fromGallery;
  const fromOffering = offering?.image?.trim();
  if (fromOffering) return fromOffering;
  return ACTIVITY_FALLBACK_IMAGE;
}

/** Parse admin duration text (e.g. "4 ساعات") into a select option. */
function hoursFromDuration(
  duration?: string | null,
  hourOptions: readonly number[] = DEFAULT_HOUR_OPTIONS,
): string | null {
  if (!duration?.trim()) return null;
  const match = duration.match(/(\d{1,2})/);
  if (!match) return null;
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (hourOptions.includes(n)) return String(n);
  const nearest = hourOptions.reduce((best, h) =>
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
  budgetOptions,
  hourOptions,
}: EventConfiguratorFormProps): React.ReactElement {
  const ar = locale === "ar";
  const source =
    audience === "individual" ? "event-request-individual" : "event-request-corporate";
  const BUDGET_OPTIONS = useMemo(
    () => normalizeNumberOptions(budgetOptions, DEFAULT_BUDGET_OPTIONS),
    [budgetOptions],
  );
  const HOUR_OPTIONS = useMemo(
    () => normalizeNumberOptions(hourOptions, DEFAULT_HOUR_OPTIONS),
    [hourOptions],
  );

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
  const [locationDetail, setLocationDetail] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dialCode, setDialCode] = useState<GccDialCode>("966");
  const [phoneNational, setPhoneNational] = useState("");
  const [phoneSeed, setPhoneSeed] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [detailsPackageId, setDetailsPackageId] = useState<number | null>(null);
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

  const budgetMinAmount = parseBudgetAmount(budgetMin);
  const budgetMaxAmount = parseBudgetAmount(budgetMax);
  const hasBudgetFilter = budgetMinAmount > 0 || budgetMaxAmount > 0;

  const filteredPackages = useMemo(() => {
    if (!hasBudgetFilter) return packages;
    return packages.filter((pkg) => {
      const price = pkg.priceAmount ?? 0;
      if (price <= 0) return true;
      if (budgetMinAmount > 0 && price < budgetMinAmount) return false;
      if (budgetMaxAmount > 0 && price > budgetMaxAmount) return false;
      return true;
    });
  }, [packages, hasBudgetFilter, budgetMinAmount, budgetMaxAmount]);

  const detailsPackage =
    detailsPackageId !== null
      ? (packages.find((pkg) => pkg.id === detailsPackageId) ?? null)
      : null;

  const budgetLabel = useMemo(() => {
    const minLabel = budgetMinAmount > 0 ? formatSar(budgetMinAmount, locale) : "";
    const maxLabel = budgetMaxAmount > 0 ? formatSar(budgetMaxAmount, locale) : "";
    if (minLabel && maxLabel) return `${minLabel} — ${maxLabel}`;
    if (minLabel) return ar ? `من ${minLabel}` : `From ${minLabel}`;
    if (maxLabel) return ar ? `حتى ${maxLabel}` : `Up to ${maxLabel}`;
    return [budgetMin.trim(), budgetMax.trim()].filter(Boolean).join(" — ");
  }, [budgetMin, budgetMax, budgetMinAmount, budgetMaxAmount, locale, ar]);

  // Prefill guests / hours / city from the admin offering when the customer picks it.
  useEffect(() => {
    if (typeof selectedOfferingId !== "number") return;
    const offering = offerings.find((item) => item.id === selectedOfferingId);
    if (!offering) return;
    if (offering.capacity && offering.capacity > 0) {
      setGuestsCount(String(offering.capacity));
    }
    const parsedHours = hoursFromDuration(offering.duration, HOUR_OPTIONS);
    if (parsedHours) setHours(parsedHours);
    if (offering.city?.trim()) {
      setCity(offering.city.trim());
    }
    if (offering.locationMode === "fixed") {
      setLocationDetail("");
    }
  }, [selectedOfferingId, offerings, HOUR_OPTIONS]);

  // Drop package selection if budget filter hides it.
  useEffect(() => {
    if (typeof selectedPackageId !== "number") return;
    if (filteredPackages.some((pkg) => pkg.id === selectedPackageId)) return;
    setSelectedPackageId(null);
    setDetailsPackageId(null);
  }, [filteredPackages, selectedPackageId]);

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
    : [city.trim(), locationDetail.trim() || selectedOffering?.location?.trim()]
        .filter(Boolean)
        .join(ar ? " — " : " · ") || city.trim();

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
    setDetailsPackageId(null);
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

  const needsCustomerMapLocation =
    isOtherOccasion ||
    (typeof selectedOfferingId === "number" && !fixedVenue);

  const detailsDone = Boolean(
    preferredDate.trim() &&
      guestsCount.trim() &&
      city.trim() &&
      (needsCustomerMapLocation ? locationDetail.trim() : true) &&
      (budgetMinAmount > 0 || budgetMaxAmount > 0) &&
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
      budgetLabel
        ? `${ar ? "الميزانية" : "Budget"}: ${budgetLabel}`
        : null,
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
                      hoursFromDuration(selectedOffering.duration, HOUR_OPTIONS) ===
                        String(h)
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

              {!fixedVenue ? (
                <div className="sm:col-span-2">
                  <LocationMapPicker
                    locale={locale}
                    label={copy.locationMap}
                    value={locationDetail}
                    onChange={setLocationDetail}
                    required={needsCustomerMapLocation}
                    placeholder={copy.locationMapPlaceholder}
                    inputClassName={fieldClass}
                  />
                </div>
              ) : null}

              <div className="sm:col-span-2 space-y-2">
                <p className="text-sm text-slate-200">{copy.budget}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm text-slate-300">
                    {copy.budgetFrom}
                    <select
                      required
                      value={budgetMin}
                      onChange={(e) => {
                        const next = e.target.value;
                        setBudgetMin(next);
                        const nextMin = parseBudgetAmount(next);
                        if (
                          nextMin > 0 &&
                          budgetMaxAmount > 0 &&
                          budgetMaxAmount < nextMin
                        ) {
                          setBudgetMax("");
                        }
                      }}
                      className={fieldClass}
                    >
                      <option value="">
                        {ar ? "اختر الحد الأدنى" : "Select minimum"}
                      </option>
                      {BUDGET_OPTIONS.map((amount) => (
                        <option key={`min-${amount}`} value={String(amount)}>
                          {formatSar(amount, locale)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm text-slate-300">
                    {copy.budgetTo}
                    <select
                      required
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      className={fieldClass}
                    >
                      <option value="">
                        {ar ? "اختر الحد الأعلى" : "Select maximum"}
                      </option>
                      {BUDGET_OPTIONS.filter(
                        (amount) => budgetMinAmount <= 0 || amount >= budgetMinAmount,
                      ).map((amount) => (
                        <option key={`max-${amount}`} value={String(amount)}>
                          {formatSar(amount, locale)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
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
                  <>
                    {hasBudgetFilter && filteredPackages.length === 0 ? (
                      <p className="mt-4 rounded-xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                        {copy.noPackagesInBudget}
                      </p>
                    ) : null}
                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredPackages.map((pkg) => (
                        <PackageCard
                          key={pkg.id}
                          pkg={pkg}
                          offering={selectedOffering}
                          locale={locale}
                          active={selectedPackageId === pkg.id}
                          selectLabel={
                            selectedPackageId === pkg.id
                              ? copy.selectedPackage
                              : copy.selectPackage
                          }
                          detailsLabel={copy.viewPackage}
                          onSelect={() => {
                            setSelectedPackageId(pkg.id);
                            setCustomNeeds("");
                          }}
                          onOpenDetails={() => setDetailsPackageId(pkg.id)}
                        />
                      ))}
                      <PackageCard
                        locale={locale}
                        offering={selectedOffering}
                        active={isOtherPackage}
                        custom
                        onSelect={() => setSelectedPackageId(OTHER)}
                        selectLabel={
                          isOtherPackage ? copy.selectedPackage : copy.selectPackage
                        }
                        detailsLabel={copy.viewPackage}
                        title={ar ? "أخرى (احتياجاتي)" : "Other (my needs)"}
                        description={
                          ar
                            ? "ما لقيت باقتك؟ اكتب طلبك وسنجهّزه لك."
                            : "Don’t see your package? Describe it and we’ll build it."
                        }
                      />
                    </div>
                  </>
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

      <PackageDetailsModal
        locale={locale}
        pkg={
          detailsPackage
            ? {
                id: detailsPackage.id,
                title: detailsPackage.title,
                description: detailsPackage.description,
                details: detailsPackage.details,
                features: detailsPackage.features,
                works: detailsPackage.works,
                image: detailsPackage.image || packageCover(detailsPackage, selectedOffering),
                gallery: selectedOffering?.gallery,
                price: detailsPackage.price,
                priceAmount: detailsPackage.priceAmount,
                badge: detailsPackage.badge,
              }
            : null
        }
        selected={detailsPackage ? selectedPackageId === detailsPackage.id : false}
        onClose={() => setDetailsPackageId(null)}
        onToggleSelect={() => {
          if (!detailsPackage) return;
          if (selectedPackageId === detailsPackage.id) {
            setSelectedPackageId(null);
            return;
          }
          setSelectedPackageId(detailsPackage.id);
          setCustomNeeds("");
        }}
      />
    </div>
  );
}

function PackageCard({
  pkg,
  offering,
  locale,
  active,
  onSelect,
  onOpenDetails,
  custom = false,
  title,
  description,
  selectLabel,
  detailsLabel,
}: {
  readonly pkg?: EventOfferingPackage;
  readonly offering?: EventOffering | null;
  readonly locale: Locale;
  readonly active: boolean;
  readonly onSelect: () => void;
  readonly onOpenDetails?: () => void;
  readonly custom?: boolean;
  readonly title?: string;
  readonly description?: string;
  readonly selectLabel: string;
  readonly detailsLabel: string;
}): React.ReactElement {
  const ar = locale === "ar";
  const label = title ?? pkg?.title ?? "";
  const tone = custom ? "custom" : packageTone(label);
  const style = toneStyles[tone];
  const cover = pkg ? packageCover(pkg, offering ?? null) : ACTIVITY_FALLBACK_IMAGE;
  const price =
    pkg?.priceAmount && pkg.priceAmount > 0 ? formatSar(pkg.priceAmount, locale) : null;
  const featurePreview = (pkg?.features ?? []).filter(Boolean).slice(0, 2);

  const bookButtonClass =
    "flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-violet-600 via-blue-500 to-cyan-400 py-2.5 text-sm font-semibold text-white shadow-[0_6px_20px_rgba(99,102,241,0.3)] transition hover:brightness-110";

  return (
    <motion.div
      className={cn(
        "gradient-border group h-full",
        active && "ring-2 ring-emerald-400/70 ring-offset-2 ring-offset-slate-950",
      )}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      <div className="inner flex h-full flex-col overflow-hidden">
        <button
          type="button"
          onClick={() => {
            if (onOpenDetails) onOpenDetails();
            else onSelect();
          }}
          className="relative w-full shrink-0 text-start"
        >
          <div className="relative aspect-[16/11] w-full overflow-hidden bg-slate-900">
            {custom ? (
              <div
                className={cn(
                  "flex h-full w-full items-center justify-center text-4xl",
                  style.ring,
                )}
              >
                <span className={style.chip} aria-hidden>
                  {style.icon}
                </span>
              </div>
            ) : (
              <Image
                src={cover}
                alt={label}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#05050c]/90 via-transparent to-black/15" />
            {pkg?.badge ? (
              <span className="absolute start-3 top-3 z-10 rounded-full border border-amber-300/35 bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-100 backdrop-blur">
                {pkg.badge}
              </span>
            ) : null}
            {price ? (
              <div className="activity-card-price-strip pointer-events-none absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-gradient-to-t from-[#05050c] to-[#05050c]/85 px-3 py-2 backdrop-blur-sm">
                <p className="text-sm font-bold text-emerald-300">{price}</p>
              </div>
            ) : null}
          </div>
        </button>

        <div className="flex flex-1 flex-col justify-start gap-1.5 p-3">
          <span
            className={cn(
              "w-fit rounded-full border px-2.5 py-0.5 text-[10px] font-medium",
              custom
                ? "border-violet-500/30 bg-violet-500/10 text-violet-200"
                : "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
            )}
          >
            {custom ? (ar ? "طلب مخصص" : "Custom request") : style.icon + " " + (ar ? "باقة" : "Package")}
          </span>

          <h3 className="line-clamp-1 text-sm font-bold leading-snug text-white transition group-hover:text-purple-200 sm:text-base">
            {label}
          </h3>

          {description || pkg?.description ? (
            <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-400">
              {description ?? pkg?.description}
            </p>
          ) : null}

          {featurePreview.length > 0 ? (
            <ul className="space-y-0.5">
              {featurePreview.map((feature) => (
                <li key={feature} className="line-clamp-1 text-[10px] text-slate-500">
                  • {feature}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-auto flex flex-col gap-2 pt-1">
            {onOpenDetails ? (
              <button
                type="button"
                onClick={onOpenDetails}
                className="w-full rounded-xl border border-white/15 bg-white/[0.04] py-2 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-500/10 hover:text-white"
              >
                {detailsLabel}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onSelect}
              className={cn(
                bookButtonClass,
                active && "ring-2 ring-emerald-300/60",
              )}
            >
              {selectLabel}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
