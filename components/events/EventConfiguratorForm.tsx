"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LocationMapPicker, type MapLocation } from "@/components/events/LocationMapPicker";
import { PackageDetailsModal } from "@/components/events/PackageDetailsModal";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import { ACTIVITY_FALLBACK_IMAGE } from "@/lib/activity";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { pageBottom, pageTitle, siteContainer } from "@/lib/layout";
import {
  GCC_DIAL_CODES,
  formatGccE164,
  isValidGccMobile,
  splitGccPhone,
  toAsciiDigits,
  type GccDialCode,
} from "@/lib/phone";
import { useFormProfileAutofill } from "@/hooks/useFormProfileAutofill";
import { submitInquiry } from "@/services/inquiryService";
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

type SelectablePackage = EventOfferingPackage & {
  offeringId: number;
  offeringTitle: string;
  offeringImage?: string | null;
  offeringGallery?: string[];
};

const OTHER_IDEA = "other" as const;

const fieldClass =
  "event-cfg-field mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)]";

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

  const [selectedOfferingId, setSelectedOfferingId] = useState<number | typeof OTHER_IDEA | null>(
    null,
  );
  const [customIdea, setCustomIdea] = useState("");
  const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([]);
  const [detailsPkgId, setDetailsPkgId] = useState<number | null>(null);

  const [description, setDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [guestsCount, setGuestsCount] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [locationCoords, setLocationCoords] = useState<MapLocation | null>(null);
  const [budget, setBudget] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dialCode, setDialCode] = useState<GccDialCode>("966");
  const [phoneNational, setPhoneNational] = useState("");
  const [phoneSeed, setPhoneSeed] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useFormProfileAutofill({ setName, setEmail, setPhone: setPhoneSeed });

  useEffect(() => {
    if (!phoneSeed.trim() || phoneNational.trim()) return;
    const split = splitGccPhone(phoneSeed);
    setDialCode(split.dial);
    setPhoneNational(split.national.replace(/^0+/, ""));
  }, [phoneSeed, phoneNational]);

  const phoneNationalClean = toAsciiDigits(phoneNational).replace(/^0+/, "");
  const phoneValid = isValidGccMobile(phoneNationalClean, dialCode);

  const selectedOffering =
    typeof selectedOfferingId === "number"
      ? (offerings.find((item) => item.id === selectedOfferingId) ?? null)
      : null;
  const isOtherIdea = selectedOfferingId === OTHER_IDEA;

  const ideaPackages = useMemo<SelectablePackage[]>(() => {
    if (!selectedOffering) return [];
    return (selectedOffering.packages ?? []).map((pkg) => ({
      ...pkg,
      offeringId: selectedOffering.id,
      offeringTitle: selectedOffering.title,
      offeringImage: selectedOffering.image,
      offeringGallery: selectedOffering.gallery ?? [],
    }));
  }, [selectedOffering]);

  const selectedPackages = useMemo(
    () => ideaPackages.filter((pkg) => selectedPackageIds.includes(pkg.id)),
    [ideaPackages, selectedPackageIds],
  );

  const detailsPkg = ideaPackages.find((pkg) => pkg.id === detailsPkgId) ?? null;

  const ideaLabel = isOtherIdea
    ? customIdea.trim() || (ar ? "فكرة أخرى" : "Other idea")
    : selectedOffering?.title ?? "";

  const dateRangeLabel = preferredDate
    ? endDate && endDate !== preferredDate
      ? `${preferredDate} → ${endDate}`
      : preferredDate
    : "";

  function selectOffering(id: number): void {
    // Customer must choose — clicking the same idea again clears the selection.
    if (selectedOfferingId === id) {
      setSelectedOfferingId(null);
      setSelectedPackageIds([]);
      setDetailsPkgId(null);
      return;
    }
    setSelectedOfferingId(id);
    setCustomIdea("");
    setSelectedPackageIds([]);
    setDetailsPkgId(null);
    requestAnimationFrame(() => {
      document.getElementById("idea-packages")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }

  function selectOtherIdea(): void {
    if (selectedOfferingId === OTHER_IDEA) {
      setSelectedOfferingId(null);
      setCustomIdea("");
      setSelectedPackageIds([]);
      setDetailsPkgId(null);
      return;
    }
    setSelectedOfferingId(OTHER_IDEA);
    setSelectedPackageIds([]);
    setDetailsPkgId(null);
  }

  function togglePackage(id: number): void {
    setSelectedPackageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  const steps = useMemo(
    () => [
      {
        id: 1,
        label: ar ? "التفاصيل" : "Details",
        done: Boolean(
          preferredDate.trim() &&
            guestsCount.trim() &&
            city.trim() &&
            budget.trim() &&
            description.trim(),
        ),
      },
      {
        id: 2,
        label: ar ? "التواصل" : "Contact",
        done: Boolean(name.trim() && email.trim() && phoneValid),
      },
      {
        id: 3,
        label: ar ? "الفكرة" : "Idea",
        done: isOtherIdea
          ? Boolean(customIdea.trim())
          : typeof selectedOfferingId === "number",
      },
    ],
    [
      ar,
      preferredDate,
      guestsCount,
      city,
      budget,
      description,
      name,
      email,
      phoneValid,
      isOtherIdea,
      customIdea,
      selectedOfferingId,
    ],
  );

  const activeStep = steps.find((s) => !s.done)?.id ?? 3;
  const doneCount = steps.filter((s) => s.done).length;

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");

    if (!steps[0]?.done) {
      setError(ar ? "أكمل تفاصيل المناسبة أولاً (بما فيها الميزانية)." : "Complete the event details first (including budget).");
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError(ar ? "أدخل بيانات التواصل حتى نقدر نرد عليك." : "Enter your contact details so we can reply.");
      return;
    }
    if (!phoneValid) {
      setError(copy.phoneInvalid);
      return;
    }
    if (!steps[2]?.done) {
      setError(
        ar
          ? "اختر فكرة من القائمة، أو اكتب فكرتك في «فكرة أخرى»."
          : "Pick an idea, or type yours under “Other idea”.",
      );
      return;
    }

    const phoneE164 = formatGccE164(dialCode, phoneNationalClean);

    setLoading(true);

    const title =
      ideaLabel ||
      (ar ? "طلب فعالية" : "Event request");

    const packageLines = selectedPackages.map(
      (pkg) => `- ${pkg.offeringTitle} / ${pkg.title}`,
    );

    const messageLines = [
      ar ? "[طلب فعالية مبسّط من الموقع]" : "[Simplified event request]",
      `${ar ? "الجمهور" : "Audience"}: ${audience}`,
      `${ar ? "الفكرة" : "Idea"}: ${ideaLabel}`,
      isOtherIdea ? `${ar ? "وصف الفكرة" : "Custom idea"}: ${customIdea.trim()}` : null,
      selectedOffering
        ? `${ar ? "الفعالية الأساسية" : "Base offering"}: ${selectedOffering.title}`
        : null,
      `${ar ? "التفاصيل" : "Details"}: ${description.trim()}`,
      `${ar ? "من تاريخ" : "From"}: ${preferredDate}`,
      endDate ? `${ar ? "إلى تاريخ" : "To"}: ${endDate}` : null,
      `${ar ? "الضيوف" : "Guests"}: ${guestsCount}`,
      `${ar ? "المدينة" : "City"}: ${city}`,
      location.trim() ? `${ar ? "الموقع" : "Location"}: ${location.trim()}` : null,
      locationCoords
        ? `${ar ? "إحداثيات الخريطة" : "Map coords"}: ${locationCoords.lat.toFixed(6)}, ${locationCoords.lng.toFixed(6)}`
        : null,
      `${ar ? "الميزانية التقريبية" : "Approx. budget"}: ${budget.trim()}`,
      packageLines.length
        ? `${ar ? "الباقات المختارة" : "Selected packages"}:\n${packageLines.join("\n")}`
        : null,
    ].filter(Boolean);

    try {
      await submitInquiry({
        type: "service",
        source,
        locale,
        name: name.trim(),
        email: email.trim(),
        phone: phoneE164,
        event_type: audience === "corporate" ? "corporate" : "private",
        title,
        description: description.trim() || undefined,
        preferred_date: preferredDate || undefined,
        preferred_end_date: endDate || undefined,
        location: [city.trim(), location.trim()].filter(Boolean).join(" — ") || undefined,
        guests_count: guestsCount ? Number(guestsCount) : undefined,
        event_offering_id: typeof selectedOfferingId === "number" ? selectedOfferingId : undefined,
        event_package_ids: selectedPackageIds,
        event_slug: selectedOffering?.slug,
        message: messageLines.join("\n"),
      });
      setSent(true);
      setSelectedOfferingId(null);
      setCustomIdea("");
      setSelectedPackageIds([]);
      setDetailsPkgId(null);
      setDescription("");
      setPreferredDate("");
      setEndDate("");
      setGuestsCount("");
      setCity("");
      setLocation("");
      setLocationCoords(null);
      setBudget("");
      setDialCode("966");
      setPhoneNational("");
      setPhoneSeed("");
    } catch (err) {
      setError(err instanceof Error ? err.message : ar ? "تعذّر إرسال الطلب" : "Could not submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn(pageBottom, "event-configurator")}>
      <div className={siteContainer}>
        <SlideInEdge
          from={ar ? "end" : "start"}
          className="mx-auto max-w-3xl text-center lg:mx-0 lg:max-w-none lg:text-start"
        >
          <p className="event-cfg-eyebrow text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400/90">
            {page.eyebrow}
          </p>
          <h1 className={`mt-3 ${pageTitle}`}>{page.title}</h1>
          <p className="event-cfg-intro mt-4 text-base leading-relaxed text-slate-300 lg:max-w-2xl">
            {page.intro}
          </p>
        </SlideInEdge>

        {sent ? (
          <motion.div
            className="event-cfg-panel mx-auto mt-10 max-w-2xl rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-6 py-10 text-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-lg font-semibold text-emerald-100">{copy.successTitle}</p>
            <p className="mt-2 text-sm leading-relaxed text-emerald-100/90">{copy.success}</p>
            <button
              type="button"
              className="mt-6 rounded-full border border-emerald-400/40 px-5 py-2.5 text-sm font-medium text-emerald-50 transition hover:bg-emerald-500/15"
              onClick={() => setSent(false)}
            >
              {copy.sendAnother}
            </button>
          </motion.div>
        ) : (
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start"
          >
            <div className="space-y-6">
              <nav
                aria-label={ar ? "خطوات الطلب" : "Request steps"}
                className="event-cfg-panel overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-3 sm:p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3 px-1">
                  <p className="event-cfg-muted text-sm font-medium text-slate-200">
                    {ar
                      ? `٣ خطوات فقط — أكملت ${doneCount} من 3`
                      : `Only 3 steps — ${doneCount} of 3 done`}
                  </p>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-100">
                    {Math.round((doneCount / 3) * 100)}%
                  </span>
                </div>
                <ol className="grid grid-cols-3 gap-2">
                  {steps.map((step) => (
                    <li
                      key={step.id}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border px-2.5 py-2.5 text-start transition",
                        step.done
                          ? "border-emerald-400/40 bg-emerald-500/15"
                          : step.id === activeStep
                            ? "border-cyan-400/40 bg-cyan-500/10"
                            : "border-white/10 bg-black/25",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          step.done
                            ? "bg-emerald-500 text-white"
                            : step.id === activeStep
                              ? "bg-cyan-500/30 text-cyan-50"
                              : "bg-white/10 text-slate-300",
                        )}
                      >
                        {step.done ? "✓" : step.id}
                      </span>
                      <span className="event-cfg-heading text-xs font-semibold text-white sm:text-sm">
                        {step.label}
                      </span>
                    </li>
                  ))}
                </ol>
              </nav>

              {/* 01 Details */}
              <section className="event-cfg-panel rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">
                  01 — {ar ? "التفاصيل" : "Details"}
                </p>
                <h2 className="event-cfg-heading mt-1 text-xl font-bold text-white">
                  {ar ? "وش مناسبتك؟" : "What’s the occasion?"}
                </h2>
                <p className="event-cfg-muted mt-1 text-sm text-slate-300">
                  {ar
                    ? "اكتب المعلومات الأساسية فقط — التاريخ، العدد، المدينة، والميزانية."
                    : "Just the basics — date, guests, city, and budget."}
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm text-slate-200 sm:col-span-2">
                    {ar ? "وصف قصير للمناسبة" : "Short description"}
                    <textarea
                      required
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={fieldClass}
                      placeholder={
                        ar
                          ? "مثال: حفل عائلي هادئ، ضيافة خفيفة، في استراحة…"
                          : "e.g. Calm family gathering, light hospitality, at a private lounge…"
                      }
                    />
                  </label>

                  <div className="sm:col-span-2">
                    <p className="text-sm font-medium text-slate-200">
                      {ar ? "تاريخ المناسبة" : "Event dates"}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {ar
                        ? "حدّد من — إلى في نفس الصندوق. إذا يوم واحد، اترك «إلى» فارغاً أو نفس تاريخ البداية."
                        : "Set from — to in one box. For a single day, leave “To” empty or the same as From."}
                    </p>
                    <div
                      className={cn(
                        "mt-1.5 grid grid-cols-1 gap-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 sm:grid-cols-[1fr_auto_1fr]",
                        "focus-within:border-emerald-400/60 focus-within:shadow-[0_0_0_3px_rgba(52,211,153,0.12)]",
                      )}
                    >
                      <label className="flex flex-col gap-1.5 px-3.5 py-3">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-300/90">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <rect x="3" y="5" width="18" height="16" rx="2" />
                            <path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
                          </svg>
                          {ar ? "من" : "From"}
                        </span>
                        <input
                          required
                          type="date"
                          value={preferredDate}
                          onChange={(e) => {
                            const next = e.target.value;
                            setPreferredDate(next);
                            if (endDate && next && endDate < next) setEndDate(next);
                          }}
                          className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                        />
                      </label>
                      <div
                        className="hidden items-center justify-center px-1 text-slate-500 sm:flex"
                        aria-hidden
                      >
                        <span className="h-8 w-px bg-white/10" />
                        <span className="mx-2 text-xs font-semibold text-slate-400">
                          {ar ? "إلى" : "to"}
                        </span>
                        <span className="h-8 w-px bg-white/10" />
                      </div>
                      <label className="flex flex-col gap-1.5 border-t border-white/10 px-3.5 py-3 sm:border-t-0">
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-cyan-300/90">
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                            <rect x="3" y="5" width="18" height="16" rx="2" />
                            <path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
                          </svg>
                          {ar ? "إلى" : "To"}
                          <span className="font-normal normal-case tracking-normal text-slate-500">
                            ({ar ? "اختياري" : "optional"})
                          </span>
                        </span>
                        <input
                          type="date"
                          value={endDate}
                          min={preferredDate || undefined}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                        />
                      </label>
                    </div>
                  </div>

                  <label className="block text-sm text-slate-200">
                    {copy.guestsCount}
                    <input
                      required
                      type="number"
                      min={1}
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(e.target.value)}
                      className={fieldClass}
                      placeholder={ar ? "مثال: 40" : "e.g. 40"}
                    />
                  </label>

                  <label className="block text-sm text-slate-200">
                    {copy.city}
                    <input
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={fieldClass}
                      placeholder={copy.cityPlaceholder}
                    />
                  </label>

                  <label className="block text-sm text-slate-200">
                    {copy.budget}
                    <input
                      required
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className={fieldClass}
                      placeholder={copy.budgetPlaceholder}
                    />
                  </label>

                  <LocationMapPicker
                    locale={locale}
                    className="sm:col-span-2"
                    label={copy.location}
                    optionalHint={`(${ar ? "اختياري" : "optional"})`}
                    value={location}
                    onChange={setLocation}
                    onCoordsChange={setLocationCoords}
                    inputClassName={fieldClass}
                    placeholder={
                      ar ? "اسم القاعة أو الحي، أو اختر من الخريطة" : copy.locationPlaceholder
                    }
                  />
                </div>
              </section>

              {/* 02 Contact */}
              <section className="event-cfg-panel rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                  02 — {ar ? "التواصل" : "Contact"}
                </p>
                <h2 className="event-cfg-heading mt-1 text-xl font-bold text-white">
                  {ar ? "كيف نتواصل معك؟" : "How should we reach you?"}
                </h2>
                <p className="event-cfg-muted mt-1 text-sm text-slate-300">
                  {ar
                    ? "بعد الإرسال يتصل بك فريق إكزورا — بدون دفع الآن."
                    : "After you submit, Xora will contact you — no payment now."}
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm text-slate-200">
                    {copy.name}
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={fieldClass}
                      placeholder={ar ? "مثال: نورة العتيبي" : "e.g. Nora Alotaibi"}
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
                      placeholder="name@email.com"
                      autoComplete="email"
                      dir="ltr"
                    />
                  </label>
                  <div className="block text-sm text-slate-200 sm:col-span-2">
                    <span className="block">{copy.phone}</span>
                    <div className="mt-1.5 flex gap-2" dir="ltr">
                      <label className="sr-only" htmlFor="event-phone-country">
                        {copy.phoneCountry}
                      </label>
                      <select
                        id="event-phone-country"
                        value={dialCode}
                        onChange={(e) => setDialCode(e.target.value as GccDialCode)}
                        className={cn(
                          fieldClass,
                          "mt-0 w-[7.75rem] shrink-0 appearance-none px-2.5 py-3 text-start",
                        )}
                      >
                        {GCC_DIAL_CODES.map((c) => (
                          <option key={c.dial} value={c.dial}>
                            {c.flag} +{c.dial}
                          </option>
                        ))}
                      </select>
                      <input
                        required
                        type="tel"
                        id="event-phone"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="tel-national"
                        placeholder={copy.phonePlaceholder}
                        value={phoneNational}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const digits = toAsciiDigits(raw);
                          if (
                            raw.includes("+") ||
                            digits.startsWith("00") ||
                            digits.startsWith("0") ||
                            digits.length > 9
                          ) {
                            const split = splitGccPhone(raw);
                            setDialCode(split.dial);
                            setPhoneNational(
                              split.national.replace(/^0+/, "").slice(0, 9),
                            );
                            return;
                          }
                          setPhoneNational(digits.slice(0, 9));
                        }}
                        className={cn(fieldClass, "mt-0 min-w-0 flex-1 text-start")}
                        aria-invalid={phoneNationalClean.length > 0 && !phoneValid}
                      />
                    </div>
                    {phoneNationalClean.length > 0 && !phoneValid ? (
                      <p className="mt-2 text-xs text-rose-300">{copy.phoneInvalid}</p>
                    ) : null}
                  </div>
                </div>
              </section>

              {/* 03 Idea */}
              <section className="event-cfg-panel rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                  03 — {ar ? "الفكرة" : "Idea"}
                </p>
                <h2 className="event-cfg-heading mt-1 text-xl font-bold text-white">
                  {ar ? "اختر فكرة قريبة منك" : "Pick a close idea"}
                </h2>
                <p className="event-cfg-muted mt-1 text-sm text-slate-300">
                  {ar
                    ? "ما في اختيار افتراضي — اضغط أنت الفكرة. باقاتها تظهر تحتها مباشرة، أو اختر «فكرة أخرى» واكتبها."
                    : "Nothing is pre-selected — you pick the idea. Its packages appear below, or choose “Other idea” and type yours."}
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {offerings.map((offering) => {
                    const active = selectedOfferingId === offering.id;
                    return (
                      <button
                        key={offering.id}
                        type="button"
                        onClick={() => selectOffering(offering.id)}
                        className={cn(
                          "group overflow-hidden rounded-2xl border text-start transition duration-300",
                          active
                            ? "border-emerald-400/60 bg-emerald-500/10 ring-2 ring-emerald-400/35"
                            : "border-white/12 bg-black/30 hover:-translate-y-0.5 hover:border-cyan-300/40",
                        )}
                      >
                        <div className="relative aspect-[16/10]">
                          <Image
                            src={offering.image || ACTIVITY_FALLBACK_IMAGE}
                            alt={offering.title}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-[1.04]"
                            sizes="(max-width: 640px) 100vw, 40vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
                          {active ? (
                            <span className="absolute end-2.5 top-2.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white shadow">
                              {ar ? "مختار" : "Selected"}
                            </span>
                          ) : null}
                        </div>
                        <div className="space-y-1 p-3.5">
                          <p className="event-cfg-heading text-base font-bold text-white">
                            {offering.title}
                          </p>
                          <p className="event-cfg-muted line-clamp-2 text-xs leading-relaxed text-slate-300">
                            {offering.description ||
                              offering.shortLabel ||
                              offering.city ||
                              offering.location ||
                              "—"}
                          </p>
                          {(offering.packages?.length ?? 0) > 0 ? (
                            <p className="text-xs font-semibold text-emerald-200">
                              {ar
                                ? `${offering.packages.length} باقة — تظهر بعد الاختيار`
                                : `${offering.packages.length} packages — show after select`}
                            </p>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={selectOtherIdea}
                    className={cn(
                      "flex min-h-[12rem] flex-col items-start justify-center gap-2 rounded-2xl border border-dashed p-5 text-start transition",
                      isOtherIdea
                        ? "border-emerald-400/60 bg-emerald-500/10 ring-2 ring-emerald-400/35"
                        : "border-white/20 bg-black/20 hover:border-cyan-300/40 hover:bg-cyan-500/5",
                    )}
                  >
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-100">
                      {ar ? "مخصص" : "Custom"}
                    </span>
                    <p className="event-cfg-heading text-lg font-bold text-white">
                      {ar ? "فكرة أخرى" : "Other idea"}
                    </p>
                    <p className="event-cfg-muted text-sm text-slate-300">
                      {ar
                        ? "ما لقيت فكرتك؟ اكتبها هنا وراح نساعدك ننفّذها."
                        : "Don’t see your idea? Write it here and we’ll help make it happen."}
                    </p>
                    {isOtherIdea ? (
                      <span className="mt-1 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white">
                        {ar ? "مختار" : "Selected"}
                      </span>
                    ) : null}
                  </button>
                </div>

                {isOtherIdea ? (
                  <label className="mt-4 block text-sm text-slate-200">
                    {ar ? "اكتب فكرتك" : "Describe your idea"}
                    <textarea
                      required
                      rows={3}
                      value={customIdea}
                      onChange={(e) => setCustomIdea(e.target.value)}
                      className={fieldClass}
                      placeholder={
                        ar
                          ? "مثال: حفل خطوبة في سطح بيت، إضاءة وردية، وموسيقى هادئة…"
                          : "e.g. Rooftop engagement, soft pink lighting, calm music…"
                      }
                    />
                  </label>
                ) : null}

                {offerings.length === 0 && !isOtherIdea ? (
                  <p className="mt-4 rounded-xl border border-dashed border-amber-400/35 bg-amber-500/10 px-4 py-4 text-sm text-amber-50">
                    {ar
                      ? "لا توجد أفكار جاهزة الآن — اختر «فكرة أخرى» واكتب مناسبتك."
                      : "No ready ideas right now — choose “Other idea” and describe yours."}
                  </p>
                ) : null}
              </section>

              {/* Packages — only after picking a specific idea */}
              {selectedOffering ? (
                <section
                  id="idea-packages"
                  className="event-cfg-panel scroll-mt-24 rounded-[1.5rem] border border-violet-400/25 bg-slate-950/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                        {ar ? "باقات هذه الفكرة" : "Packages for this idea"}
                      </p>
                      <h2 className="event-cfg-heading mt-1 text-xl font-bold text-white">
                        {selectedOffering.title}
                      </h2>
                      <p className="event-cfg-muted mt-1 text-sm text-slate-300">
                        {ar
                          ? "اختياري: أضف باقة أو أكثر لطلبك، أو أرسل بدون باقة ونتفق لاحقاً."
                          : "Optional: add one or more packages, or submit without — we’ll agree later."}
                      </p>
                    </div>
                    <span className="rounded-full border border-violet-400/35 bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-50">
                      {ar
                        ? `${selectedPackageIds.length} في الطلب`
                        : `${selectedPackageIds.length} in request`}
                    </span>
                  </div>

                  {ideaPackages.length === 0 ? (
                    <p className="event-cfg-muted mt-5 rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-slate-400">
                      {ar
                        ? "لا توجد باقات جاهزة لهذه الفكرة حالياً — يمكنك إرسال الطلب ونتفق على التفاصيل."
                        : "No packages for this idea yet — you can still submit and we’ll arrange details."}
                    </p>
                  ) : (
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {ideaPackages.map((pkg) => {
                        const selected = selectedPackageIds.includes(pkg.id);
                        return (
                          <article
                            key={pkg.id}
                            className={cn(
                              "overflow-hidden rounded-2xl border transition duration-300",
                              selected
                                ? "border-emerald-400/50 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(52,211,153,0.25)]"
                                : "border-white/12 bg-black/35 hover:border-cyan-300/35",
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => setDetailsPkgId(pkg.id)}
                              className="block w-full text-start"
                            >
                              <div className="relative aspect-[16/10]">
                                <Image
                                  src={pkg.image || pkg.offeringImage || ACTIVITY_FALLBACK_IMAGE}
                                  alt={pkg.title}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 640px) 100vw, 30vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                                {pkg.badge ? (
                                  <span className="absolute start-2.5 top-2.5 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                                    {pkg.badge}
                                  </span>
                                ) : null}
                              </div>
                              <div className="space-y-1.5 p-3.5">
                                <p className="event-cfg-heading text-base font-bold text-white">
                                  {pkg.title}
                                </p>
                                <p className="event-cfg-muted line-clamp-2 text-xs leading-relaxed text-slate-300">
                                  {pkg.description || "—"}
                                </p>
                              </div>
                            </button>
                            <div className="flex gap-2 border-t border-white/10 px-3 py-2.5">
                              <button
                                type="button"
                                onClick={() => setDetailsPkgId(pkg.id)}
                                className="flex-1 rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-cyan-300/40 hover:bg-white/5"
                              >
                                {ar ? "التفاصيل" : "Details"}
                              </button>
                              <button
                                type="button"
                                onClick={() => togglePackage(pkg.id)}
                                className={cn(
                                  "flex-1 rounded-xl px-3 py-2 text-xs font-bold transition",
                                  selected
                                    ? "bg-rose-500/20 text-rose-100 hover:bg-rose-500/30"
                                    : "bg-emerald-500 text-white hover:bg-emerald-400",
                                )}
                              >
                                {selected
                                  ? ar
                                    ? "إزالة"
                                    : "Remove"
                                  : ar
                                    ? "أضف لطلبي"
                                    : "Add"}
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </section>
              ) : null}
            </div>

            <aside className="lg:sticky lg:top-24">
              <div className="event-cfg-summary overflow-hidden rounded-[1.5rem] border border-emerald-400/30 bg-gradient-to-b from-emerald-500/15 via-slate-950 to-slate-950 shadow-[0_22px_55px_rgba(0,0,0,0.35)]">
                <div className="border-b border-white/10 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                    {ar ? "ملخص سريع" : "Quick summary"}
                  </p>
                  <p className="event-cfg-heading mt-2 text-base font-bold text-white">
                    {ideaLabel || (ar ? "لم تُختر فكرة بعد" : "No idea selected yet")}
                  </p>
                </div>

                <ul className="space-y-1.5 border-b border-white/10 px-4 py-3">
                  {steps.map((step) => (
                    <li
                      key={step.id}
                      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs"
                    >
                      <span className="event-cfg-muted text-slate-300">
                        {step.id}. {step.label}
                      </span>
                      <span
                        className={cn(
                          "font-semibold",
                          step.done ? "text-emerald-300" : "text-slate-500",
                        )}
                      >
                        {step.done ? (ar ? "تم" : "Done") : ar ? "بانتظارك" : "Pending"}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2 border-b border-white/10 px-5 py-4 text-sm text-slate-300">
                  {dateRangeLabel ? (
                    <p>
                      <span className="text-slate-500">{ar ? "التاريخ:" : "Date:"} </span>
                      {dateRangeLabel}
                    </p>
                  ) : null}
                  {guestsCount ? (
                    <p>
                      <span className="text-slate-500">{ar ? "الضيوف:" : "Guests:"} </span>
                      {guestsCount}
                    </p>
                  ) : null}
                  {city ? (
                    <p>
                      <span className="text-slate-500">{ar ? "المدينة:" : "City:"} </span>
                      {city}
                    </p>
                  ) : null}
                  {budget ? (
                    <p>
                      <span className="text-slate-500">{ar ? "الميزانية:" : "Budget:"} </span>
                      {budget}
                    </p>
                  ) : null}
                </div>

                <div className="max-h-40 space-y-2 overflow-y-auto px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {ar ? "الباقات المختارة" : "Selected packages"}
                  </p>
                  <AnimatePresence initial={false}>
                    {selectedPackages.length === 0 ? (
                      <motion.p
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-xl border border-dashed border-white/15 px-3 py-4 text-center text-xs leading-relaxed text-slate-400"
                      >
                        {selectedOffering
                          ? ar
                            ? "اختياري — أضف باقة من قسم الفكرة أعلاه."
                            : "Optional — add a package from the idea section above."
                          : ar
                            ? "تظهر بعد اختيار فكرة معيّنة."
                            : "Appear after you pick a specific idea."}
                      </motion.p>
                    ) : (
                      selectedPackages.map((pkg) => (
                        <motion.div
                          key={pkg.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-start justify-between gap-2 rounded-xl border border-white/10 bg-black/35 px-3 py-2.5"
                        >
                          <p className="truncate text-sm font-semibold text-white">{pkg.title}</p>
                          <button
                            type="button"
                            onClick={() => togglePackage(pkg.id)}
                            className="shrink-0 text-[10px] font-medium text-rose-300 hover:text-rose-200"
                          >
                            {ar ? "إزالة" : "Remove"}
                          </button>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>

                <div className="border-t border-white/10 px-5 py-3">
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    {ar
                      ? "إرسال الطلب مجاني وبدون دفع الآن. الباقات اختيارية — تظهر فقط بعد اختيار فكرة."
                      : "Free to submit — no payment now. Packages are optional and appear only after picking an idea."}
                  </p>
                </div>

                {error ? (
                  <p className="px-5 pb-2 text-sm text-rose-300" role="alert">
                    {error}
                  </p>
                ) : null}

                <div className="px-4 pb-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-emerald-600 via-teal-500 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(16,185,129,0.32)] transition hover:brightness-110 disabled:opacity-60"
                  >
                    {loading ? copy.sending : copy.submit}
                  </button>
                </div>
              </div>
            </aside>
          </form>
        )}
      </div>

      <PackageDetailsModal
        locale={locale}
        pkg={
          detailsPkg
            ? {
                ...detailsPkg,
                gallery: [
                  ...(detailsPkg.offeringGallery ?? []),
                  detailsPkg.offeringImage ?? "",
                ].filter(Boolean),
              }
            : null
        }
        selected={detailsPkg ? selectedPackageIds.includes(detailsPkg.id) : false}
        showPrice={false}
        onClose={() => setDetailsPkgId(null)}
        onToggleSelect={() => {
          if (detailsPkg) togglePackage(detailsPkg.id);
        }}
      />
    </div>
  );
}
