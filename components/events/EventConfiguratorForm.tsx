"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PackageDetailsModal } from "@/components/events/PackageDetailsModal";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import { FieldTipLabel } from "@/components/ui/FieldTipLabel";
import { ACTIVITY_FALLBACK_IMAGE } from "@/lib/activity";
import { cn } from "@/lib/cn";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { pageBottom, pageTitle, siteContainer } from "@/lib/layout";
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

const fieldClass =
  "event-cfg-field mt-0 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)]";

function tips(ar: boolean) {
  return {
    theme: ar
      ? "اختر الفكرة الأقرب لمناسبتك — بعدها تظهر باقاتها وصورها مباشرة تحت."
      : "Pick the idea closest to your occasion — its packages and photos appear below.",
    packages: ar
      ? "اضغط البطاقة لرؤية التفاصيل والصور، ثم اضغط «إضافة» لضمّها لطلبك. يمكنك إضافة أكثر من باقة."
      : "Open a card to see details and photos, then tap Add to include it. You can add more than one.",
    title: ar
      ? "اسم مختصر لطلبك يظهر لفريق إكزورا عند المراجعة — مثل «حفل تخرج أحمد»."
      : "A short name for your request so Xora can recognize it — e.g. “Sara’s graduation”.",
    description: ar
      ? "صف الأجواء والهدف وأي تفاصيل مهمة (عدد الطاولات، نوع الضيافة، ملاحظات خاصة…)."
      : "Describe the vibe, goal, and any important notes (tables, hospitality, special requests…).",
    start: ar
      ? "التاريخ المفضّل لبدء فعاليتك. يمكن تعديله لاحقاً عند تواصل الفريق معك."
      : "Your preferred start date. It can be adjusted later when the team contacts you.",
    end: ar
      ? "اتركه فارغاً إذا كانت الفعالية يوماً واحداً. عبّئه فقط إن امتدت لأكثر من يوم."
      : "Leave blank for a one-day event. Fill it only if the occasion spans multiple days.",
    duration: ar
      ? "كم تستمر تقريباً؟ يساعدنا هذا في تجهيز الفريق والمعدات."
      : "About how long will it run? This helps us prepare the team and equipment.",
    guests: ar
      ? "عدد تقريبي يكفي — لا يلزم رقم دقيق الآن."
      : "An approximate count is enough — exact numbers can wait.",
    city: ar
      ? "المدينة التي ستقام فيها الفعالية (الرياض، جدة…)."
      : "The city where the event will take place (Riyadh, Jeddah…).",
    location: ar
      ? "اسم القاعة أو الحي، أو اكتب «في موقعي» إن كانت في بيتك / استراحتك."
      : "Venue name or district — or write “at my place” if it’s at home / a private lounge.",
    message: ar
      ? "اختياري: أي ملاحظة إضافية تريد أن يقرأها الفريق قبل التواصل."
      : "Optional: anything else you want the team to know before they call you.",
    name: ar
      ? "الاسم الذي يظهر في طلبك — للتواصل والتأكيد."
      : "The name on your request — used for follow-up and confirmation.",
    email: ar
      ? "سنرسل عليه تأكيد استلام الطلب وأي تحديثات."
      : "We’ll send request confirmation and updates here.",
    phone: ar
      ? "أفضل رقم جوال للتواصل السريع عبر اتصال أو واتساب."
      : "Best mobile number for a quick call or WhatsApp.",
    summary: ar
      ? "ملخص حي لطلبك: الفكرة والباقات المختارة. بعد الإرسال يتواصل معك الفريق للتأكيد."
      : "A live summary of your idea and packages. After submit, the team will contact you to confirm.",
  };
}

export function EventConfiguratorForm({
  locale,
  audience,
  offerings,
  copy,
  page,
}: EventConfiguratorFormProps): React.ReactElement {
  const ar = locale === "ar";
  const tip = tips(ar);
  const source =
    audience === "individual" ? "event-request-individual" : "event-request-corporate";

  const flatPackages = useMemo<SelectablePackage[]>(() => {
    const rows: SelectablePackage[] = [];
    for (const offering of offerings) {
      for (const pkg of offering.packages ?? []) {
        rows.push({
          ...pkg,
          offeringId: offering.id,
          offeringTitle: offering.title,
          offeringImage: offering.image,
          offeringGallery: offering.gallery ?? [],
        });
      }
    }
    return rows;
  }, [offerings]);

  const [selectedOfferingId, setSelectedOfferingId] = useState<number | null>(
    offerings[0]?.id ?? null,
  );
  const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([]);
  const [detailsPkgId, setDetailsPkgId] = useState<number | null>(null);

  const [requestTitle, setRequestTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [duration, setDuration] = useState("");
  const [guestsCount, setGuestsCount] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [customerMessage, setCustomerMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useFormProfileAutofill({ setName, setEmail, setPhone });

  const selectedOffering = offerings.find((item) => item.id === selectedOfferingId) ?? null;

  const visiblePackages = useMemo(() => {
    if (!selectedOfferingId) return flatPackages;
    const scoped = flatPackages.filter((pkg) => pkg.offeringId === selectedOfferingId);
    return scoped.length > 0 ? scoped : flatPackages;
  }, [flatPackages, selectedOfferingId]);

  const selectedPackages = useMemo(
    () => flatPackages.filter((pkg) => selectedPackageIds.includes(pkg.id)),
    [flatPackages, selectedPackageIds],
  );

  const detailsPkg = flatPackages.find((pkg) => pkg.id === detailsPkgId) ?? null;

  const steps = useMemo(
    () => [
      {
        id: 1,
        label: ar ? "الفكرة" : "Idea",
        done: Boolean(selectedOfferingId),
      },
      {
        id: 2,
        label: ar ? "الباقات" : "Packages",
        done: selectedPackageIds.length > 0,
      },
      {
        id: 3,
        label: ar ? "التفاصيل" : "Details",
        done: Boolean(requestTitle.trim() && (preferredDate || city || guestsCount)),
      },
      {
        id: 4,
        label: ar ? "التواصل" : "Contact",
        done: Boolean(name.trim() && email.trim()),
      },
    ],
    [ar, selectedOfferingId, selectedPackageIds.length, requestTitle, preferredDate, city, guestsCount, name, email],
  );

  const activeStep = steps.find((s) => !s.done)?.id ?? 4;
  const doneCount = steps.filter((s) => s.done).length;

  function togglePackage(id: number): void {
    setSelectedPackageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function selectOffering(id: number): void {
    setSelectedOfferingId(id);
    setSelectedPackageIds((prev) =>
      prev.filter((pkgId) => flatPackages.find((pkg) => pkg.id === pkgId)?.offeringId === id),
    );
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    setLoading(true);

    const packageLines = selectedPackages.map(
      (pkg) => `- ${pkg.offeringTitle} / ${pkg.title}`,
    );

    const messageLines = [
      ar ? "[طلب تهيئة فعالية من الموقع]" : "[Event configuration request]",
      `${ar ? "الجمهور" : "Audience"}: ${audience}`,
      selectedOffering
        ? `${ar ? "الفعالية الأساسية" : "Base offering"}: ${selectedOffering.title}`
        : null,
      requestTitle ? `${ar ? "عنوان الطلب" : "Title"}: ${requestTitle}` : null,
      description ? `${ar ? "التفاصيل" : "Details"}: ${description}` : null,
      preferredDate ? `${ar ? "تاريخ البداية" : "Start"}: ${preferredDate}` : null,
      endDate ? `${ar ? "تاريخ النهاية" : "End"}: ${endDate}` : null,
      duration ? `${ar ? "المدة" : "Duration"}: ${duration}` : null,
      guestsCount ? `${ar ? "الضيوف" : "Guests"}: ${guestsCount}` : null,
      city ? `${ar ? "المدينة" : "City"}: ${city}` : null,
      location ? `${ar ? "الموقع" : "Location"}: ${location}` : null,
      packageLines.length
        ? `${ar ? "الباقات المختارة" : "Selected packages"}:\n${packageLines.join("\n")}`
        : `${ar ? "الباقات" : "Packages"}: ${ar ? "بدون" : "none"}`,
      customerMessage ? `${ar ? "رسالة" : "Message"}: ${customerMessage}` : null,
    ].filter(Boolean);

    try {
      await submitInquiry({
        type: "service",
        source,
        locale,
        name,
        email,
        phone: phone || undefined,
        event_type: audience === "corporate" ? "corporate" : "private",
        title: requestTitle || selectedOffering?.title || (ar ? "طلب فعالية" : "Event request"),
        description: description || undefined,
        preferred_date: preferredDate || undefined,
        location: [city, location].filter(Boolean).join(" — ") || undefined,
        guests_count: guestsCount ? Number(guestsCount) : undefined,
        customer_message: customerMessage || undefined,
        event_offering_id: selectedOfferingId ?? undefined,
        event_package_ids: selectedPackageIds,
        event_slug: selectedOffering?.slug,
        message: messageLines.join("\n"),
      });
      setSent(true);
      setSelectedPackageIds([]);
      setRequestTitle("");
      setDescription("");
      setPreferredDate("");
      setEndDate("");
      setDuration("");
      setGuestsCount("");
      setCity("");
      setLocation("");
      setCustomerMessage("");
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
          <p className="event-cfg-intro mt-4 text-base leading-relaxed text-slate-300 lg:max-w-3xl">
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
            onSubmit={handleSubmit}
            className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] lg:items-start"
          >
            <div className="space-y-6">
              {/* Tamam-style progress */}
              <nav
                aria-label={ar ? "خطوات الطلب" : "Request steps"}
                className="event-cfg-panel overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 p-3 sm:p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-3 px-1">
                  <p className="event-cfg-muted text-xs font-medium text-slate-300">
                    {ar
                      ? `أكمل الخطوات بالترتيب — ${doneCount} من 4 جاهزة`
                      : `Follow the steps — ${doneCount} of 4 ready`}
                  </p>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-100">
                    {Math.round((doneCount / 4) * 100)}%
                  </span>
                </div>
                <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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

              {/* 01 Theme */}
              <section className="event-cfg-panel rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                      01 — {ar ? "الفكرة" : "Idea"}
                    </p>
                    <div className="mt-1">
                      <FieldTipLabel
                        label={ar ? "اختر فكرة الفعالية" : "Choose your event idea"}
                        tip={tip.theme}
                        className="mb-0 [&_.event-cfg-label]:text-xl [&_.event-cfg-label]:font-bold [&_.event-cfg-label]:text-white"
                      />
                    </div>
                    <p className="event-cfg-muted mt-1 text-sm text-slate-300">
                      {ar
                        ? "فكرة واحدة فقط — اضغط عليها لتظهر باقاتها."
                        : "One idea only — tap it to reveal its packages."}
                    </p>
                  </div>
                </div>

                {offerings.length === 0 ? (
                  <p className="mt-5 rounded-xl border border-dashed border-amber-400/35 bg-amber-500/10 px-4 py-5 text-sm text-amber-50">
                    {ar
                      ? "لا توجد أفكار فعاليات متاحة حالياً. يرجى المحاولة لاحقاً أو التواصل معنا."
                      : "No event ideas are available right now. Please try again later or contact us."}
                  </p>
                ) : (
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
                          <div className="space-y-1.5 p-3.5">
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
                            <p className="text-xs font-semibold text-emerald-200">
                              {ar
                                ? `${offering.packages.length} باقة للاختيار`
                                : `${offering.packages.length} packages to choose`}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* 02 Packages */}
              <section className="event-cfg-panel rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
                      02 — {ar ? "الباقات" : "Packages"}
                    </p>
                    <div className="mt-1">
                      <FieldTipLabel
                        label={ar ? "استعرض وأضف ما يناسبك" : "Browse and add what fits"}
                        tip={tip.packages}
                        className="mb-0 [&_.event-cfg-label]:text-xl [&_.event-cfg-label]:font-bold [&_.event-cfg-label]:text-white"
                      />
                    </div>
                    <p className="event-cfg-muted mt-1 text-sm text-slate-300">
                      {ar
                        ? "كل باقة فيها صور وتفاصيل — افتحها قبل الإضافة."
                        : "Every package has photos and details — open it before adding."}
                    </p>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={selectedPackageIds.length}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="rounded-full border border-violet-400/35 bg-violet-500/15 px-3 py-1 text-xs font-bold text-violet-50"
                    >
                      {ar
                        ? `${selectedPackageIds.length} في الطلب`
                        : `${selectedPackageIds.length} in request`}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {visiblePackages.length === 0 ? (
                  <p className="event-cfg-muted mt-5 rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-slate-400">
                    {ar
                      ? "لا توجد باقات لهذه الفكرة حالياً."
                      : "No packages for this theme right now."}
                  </p>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {visiblePackages.map((pkg) => {
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
                              <span className="absolute end-2.5 top-2.5 rounded-full border border-white/25 bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
                                {ar ? "اضغط للتفاصيل" : "Tap for details"}
                              </span>
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
                              {ar ? "ماذا تشمل؟" : "What’s included?"}
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
                              {selected ? (ar ? "إزالة" : "Remove") : ar ? "أضف لطلبي" : "Add to request"}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* 03 Details */}
              <section className="event-cfg-panel rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-300">
                  03 — {ar ? "التفاصيل" : "Details"}
                </p>
                <h2 className="event-cfg-heading mt-1 text-xl font-bold text-white">
                  {ar ? "أخبرنا عن مناسبتك" : "Tell us about your occasion"}
                </h2>
                <p className="event-cfg-muted mt-1 text-sm text-slate-300">
                  {ar
                    ? "حقول بسيطة — اضغط علامة (i) بجانب أي حقل لمعرفة ماذا يُستخدم."
                    : "Simple fields — tap the (i) next to any field to see what it’s for."}
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <FieldTipLabel
                      htmlFor="cfg-title"
                      label={copy.requestTitle}
                      tip={tip.title}
                      required
                    />
                    <input
                      id="cfg-title"
                      required
                      value={requestTitle}
                      onChange={(e) => setRequestTitle(e.target.value)}
                      className={fieldClass}
                      placeholder={selectedOffering?.title || undefined}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldTipLabel htmlFor="cfg-desc" label={copy.description} tip={tip.description} />
                    <textarea
                      id="cfg-desc"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={fieldClass}
                      placeholder={
                        ar
                          ? "مثال: حفل عائلي هادئ مع ضيافة خفيفة وإضاءة ناعمة…"
                          : "e.g. A calm family gathering with light hospitality and soft lighting…"
                      }
                    />
                  </div>
                  <div>
                    <FieldTipLabel htmlFor="cfg-start" label={copy.preferredDate} tip={tip.start} />
                    <input
                      id="cfg-start"
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <FieldTipLabel htmlFor="cfg-end" label={copy.endDate} tip={tip.end} />
                    <input
                      id="cfg-end"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <FieldTipLabel htmlFor="cfg-duration" label={copy.duration} tip={tip.duration} />
                    <input
                      id="cfg-duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className={fieldClass}
                      placeholder={copy.durationPlaceholder}
                    />
                  </div>
                  <div>
                    <FieldTipLabel htmlFor="cfg-guests" label={copy.guestsCount} tip={tip.guests} />
                    <input
                      id="cfg-guests"
                      type="number"
                      min={1}
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(e.target.value)}
                      className={fieldClass}
                      placeholder={ar ? "مثال: 40" : "e.g. 40"}
                    />
                  </div>
                  <div>
                    <FieldTipLabel htmlFor="cfg-city" label={copy.city} tip={tip.city} />
                    <input
                      id="cfg-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={fieldClass}
                      placeholder={copy.cityPlaceholder}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldTipLabel htmlFor="cfg-location" label={copy.location} tip={tip.location} />
                    <input
                      id="cfg-location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className={fieldClass}
                      placeholder={
                        selectedOffering?.locationMode === "customer_choice"
                          ? copy.locationPlaceholder
                          : selectedOffering?.location || copy.locationPlaceholder
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldTipLabel
                      htmlFor="cfg-msg"
                      label={copy.customerMessage}
                      tip={tip.message}
                    />
                    <textarea
                      id="cfg-msg"
                      rows={2}
                      value={customerMessage}
                      onChange={(e) => setCustomerMessage(e.target.value)}
                      className={fieldClass}
                      placeholder={copy.customerMessagePlaceholder}
                    />
                  </div>
                </div>
              </section>

              {/* 04 Contact */}
              <section className="event-cfg-panel rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                  04 — {ar ? "التواصل" : "Contact"}
                </p>
                <h2 className="event-cfg-heading mt-1 text-xl font-bold text-white">
                  {ar ? "كيف نتواصل معك؟" : "How should we reach you?"}
                </h2>
                <p className="event-cfg-muted mt-1 text-sm text-slate-300">
                  {ar
                    ? "بعد الإرسال يتواصل فريق إكزورا لتأكيد التفاصيل — بدون دفع الآن."
                    : "After you submit, Xora will contact you to confirm details — no payment now."}
                </p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <FieldTipLabel htmlFor="cfg-name" label={copy.name} tip={tip.name} required />
                    <input
                      id="cfg-name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={fieldClass}
                      placeholder={ar ? "مثال: نورة العتيبي" : "e.g. Nora Alotaibi"}
                    />
                  </div>
                  <div>
                    <FieldTipLabel htmlFor="cfg-email" label={copy.email} tip={tip.email} required />
                    <input
                      id="cfg-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={fieldClass}
                      placeholder="name@email.com"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldTipLabel htmlFor="cfg-phone" label={copy.phone} tip={tip.phone} />
                    <input
                      id="cfg-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={fieldClass}
                      placeholder="05xxxxxxxx"
                    />
                  </div>
                </div>
              </section>
            </div>

            <aside className="lg:sticky lg:top-24">
              <div className="event-cfg-summary overflow-hidden rounded-[1.5rem] border border-emerald-400/30 bg-gradient-to-b from-emerald-500/15 via-slate-950 to-slate-950 shadow-[0_22px_55px_rgba(0,0,0,0.35)]">
                <div className="border-b border-white/10 px-5 py-4">
                  <FieldTipLabel
                    label={ar ? "ملخص طلبك" : "Your request"}
                    tip={tip.summary}
                    className="mb-1 [&_.event-cfg-label]:text-xs [&_.event-cfg-label]:font-semibold [&_.event-cfg-label]:uppercase [&_.event-cfg-label]:tracking-[0.18em] [&_.event-cfg-label]:text-emerald-300"
                  />
                  <p className="event-cfg-heading mt-1 text-base font-bold text-white">
                    {selectedOffering
                      ? selectedOffering.title
                      : ar
                        ? "اختر فكرة للبدء"
                        : "Pick an idea to start"}
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

                <div className="max-h-56 space-y-2 overflow-y-auto px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {ar ? "الباقات المختارة" : "Selected packages"}
                  </p>
                  <AnimatePresence initial={false}>
                    {selectedPackages.length === 0 ? (
                      <motion.p
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="rounded-xl border border-dashed border-white/15 px-3 py-5 text-center text-xs leading-relaxed text-slate-400"
                      >
                        {ar
                          ? "لم تُضف باقة بعد — افتح باقة ثم اضغط «أضف لطلبي»."
                          : "No packages yet — open one, then tap “Add to request”."}
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
                          <button
                            type="button"
                            onClick={() => setDetailsPkgId(pkg.id)}
                            className="min-w-0 text-start"
                          >
                            <p className="truncate text-sm font-semibold text-white">{pkg.title}</p>
                            <p className="truncate text-[11px] text-slate-400">{pkg.offeringTitle}</p>
                          </button>
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

                <div className="border-t border-white/10 px-5 py-4">
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    {ar
                      ? "إرسال الطلب مجاني وبدون دفع الآن. فريق إكزورا يتواصل معك لترتيب التفاصيل."
                      : "Submitting is free — no payment now. Xora will contact you to arrange the details."}
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
