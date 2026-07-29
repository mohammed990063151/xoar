"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import { useFormProfileAutofill } from "@/hooks/useFormProfileAutofill";
import { cn } from "@/lib/cn";
import { isStorageImage, useUnoptimizedImage } from "@/lib/image-url";
import {
  gridCards3,
  pageBottom,
  pageEyebrow,
  sectionHeading,
  sectionSpacingTight,
  siteContainer,
} from "@/lib/layout";
import type { Locale } from "@/lib/i18n";
import type { NationalDayPageContent } from "@/lib/site-page";
import { submitInquiry } from "@/services/inquiryService";

interface NationalDayPageViewProps {
  readonly locale: Locale;
  readonly content: NationalDayPageContent;
  readonly brandName: string;
}

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-emerald-400/60 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)]";

function CoverImage({
  src,
  alt,
  className,
  priority,
  sizes,
}: {
  readonly src: string;
  readonly alt: string;
  readonly className?: string;
  readonly priority?: boolean;
  readonly sizes?: string;
}): React.ReactElement {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      className={cn("object-cover", className)}
      sizes={sizes ?? "100vw"}
      unoptimized={useUnoptimizedImage(src) || isStorageImage(src)}
    />
  );
}

function buildMessage(payload: {
  ar: boolean;
  interest: string;
  location: string;
  guestsCount: string;
  message: string;
}): string {
  const lines = [
    payload.ar ? "[طلب احتفال اليوم الوطني]" : "[National Day celebration request]",
  ];
  if (payload.interest.trim()) {
    lines.push(`${payload.ar ? "الخدمات" : "Services"}: ${payload.interest.trim()}`);
  }
  if (payload.location.trim()) {
    lines.push(`${payload.ar ? "الموقع" : "Location"}: ${payload.location.trim()}`);
  }
  if (payload.guestsCount) {
    lines.push(`${payload.ar ? "الحضور" : "Guests"}: ${payload.guestsCount}`);
  }
  if (payload.message.trim()) {
    lines.push(`${payload.ar ? "تفاصيل" : "Details"}: ${payload.message.trim()}`);
  }
  return lines.join("\n");
}

export function NationalDayPageView({
  locale,
  content,
  brandName,
}: NationalDayPageViewProps): React.ReactElement {
  const ar = locale === "ar";
  const formRef = useRef<HTMLElement>(null);
  const offeringsRef = useRef<HTMLElement>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [guestsCount, setGuestsCount] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useFormProfileAutofill({ setName, setEmail, setPhone });

  const heroImage = content.images[0] ?? content.offerings[0]?.image ?? "";
  const galleryRest = content.images.length > 1 ? content.images.slice(1) : content.images;
  const galleryPad =
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80";
  const galleryImages =
    galleryRest.length >= 4
      ? galleryRest
      : [...galleryRest, galleryPad].filter((src, i, arr) => arr.indexOf(src) === i);

  useEffect(() => {
    if (sent && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [sent]);

  function toggleInterest(title: string): void {
    setSelectedInterests((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title],
    );
  }

  function scrollToForm(): void {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function scrollToOfferings(): void {
    offeringsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    setLoading(true);

    const interestLabel = selectedInterests.join(ar ? "، " : ", ");

    try {
      await submitInquiry({
        type: "service",
        source: "national-day",
        locale,
        name,
        email,
        phone: phone || undefined,
        event_type: "national-day",
        title: ar ? `احتفال اليوم الوطني — ${name}` : `National Day celebration — ${name}`,
        location: location || undefined,
        guests_count: guestsCount ? Number(guestsCount) : undefined,
        customer_message: message || undefined,
        description: interestLabel || undefined,
        message: buildMessage({
          ar,
          interest: interestLabel,
          location,
          guestsCount,
          message,
        }),
      });
      setSent(true);
      setLocation("");
      setGuestsCount("");
      setMessage("");
      setSelectedInterests([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : ar ? "تعذّر إرسال الطلب" : "Could not submit");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn(pageBottom, "relative overflow-hidden")}>
      {/* Hero */}
      <section className="relative min-h-[min(92vh,880px)] overflow-hidden">
        {heroImage ? (
          <CoverImage
            src={heroImage}
            alt={ar ? "أجواء احتفال اليوم الوطني" : "National Day celebration atmosphere"}
            priority
            className="scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-slate-950 to-slate-950" />
        )}
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.55)_0%,rgba(2,6,23,0.72)_45%,rgba(2,6,23,0.94)_100%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_20%,rgba(16,185,129,0.28),transparent_60%),radial-gradient(ellipse_40%_40%_at_85%_70%,rgba(251,191,36,0.12),transparent)]"
          aria-hidden
        />
        <motion.div
          className="pointer-events-none absolute -start-16 top-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"
          animate={{ opacity: [0.35, 0.65, 0.35], y: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
        <motion.div
          className="pointer-events-none absolute -end-10 bottom-28 h-56 w-56 rounded-full bg-amber-400/15 blur-3xl"
          animate={{ opacity: [0.25, 0.55, 0.25], y: [0, -16, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          aria-hidden
        />

        <div className={cn(siteContainer, "relative flex min-h-[min(92vh,880px)] flex-col justify-end pb-16 pt-28 sm:pb-20 sm:pt-32")}>
          <SlideInEdge from="bottom">
            <p className="text-sm font-semibold tracking-[0.28em] text-emerald-300/95 sm:text-base">
              {brandName}
            </p>
            <p className={cn(pageEyebrow, "mt-4 !text-amber-300/90")}>{content.eyebrow}</p>
            <h1 className="mt-3 max-w-4xl text-[clamp(2rem,7vw,4.25rem)] font-bold leading-[1.08] tracking-tight text-white">
              {content.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-200/90 sm:text-lg">
              {content.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={scrollToForm}
                className="rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(16,185,129,0.35)] transition hover:from-emerald-400 hover:to-emerald-500"
              >
                {content.cta}
              </button>
              <button
                type="button"
                onClick={scrollToOfferings}
                className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-emerald-300/40 hover:bg-white/10"
              >
                {content.ctaSecondary}
              </button>
            </div>
          </SlideInEdge>
        </div>
      </section>

      {/* Offerings */}
      <section ref={offeringsRef} className={cn(siteContainer, sectionSpacingTight)}>
        <ScrollReveal>
          <div className="mx-auto max-w-3xl text-center">
            <p className={cn(pageEyebrow, "!text-emerald-400/90")}>
              {ar ? "باقة الاحتفال" : "Celebration package"}
            </p>
            <h2 className={cn(sectionHeading, "mt-3")}>{content.offeringsTitle}</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
              {content.offeringsIntro}
            </p>
          </div>
        </ScrollReveal>

        <div className={cn(gridCards3, "mt-10")}>
          {content.offerings.map((item, index) => {
            const selected = selectedInterests.includes(item.title);
            return (
              <ScrollReveal key={`${item.title}-${index}`}>
                <button
                  type="button"
                  onClick={() => {
                    toggleInterest(item.title);
                    scrollToForm();
                  }}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-2xl border text-start transition duration-300",
                    selected
                      ? "border-emerald-400/50 bg-emerald-500/10 shadow-[0_20px_50px_rgba(16,185,129,0.18)]"
                      : "border-white/10 bg-slate-950/60 hover:border-emerald-400/30 hover:bg-slate-900/80",
                  )}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {item.image ? (
                      <CoverImage
                        src={item.image}
                        alt={item.title}
                        className="transition duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <span
                      className={cn(
                        "absolute end-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                        selected
                          ? "bg-emerald-400 text-slate-950"
                          : "bg-black/50 text-emerald-200 backdrop-blur-sm",
                      )}
                    >
                      {selected
                        ? ar
                          ? "مختار"
                          : "Selected"
                        : ar
                          ? "أضِف للطلب"
                          : "Add to request"}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.description}</p>
                  </div>
                </button>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* Gallery */}
      {galleryImages.length > 0 ? (
        <section className={cn(siteContainer, "py-10 sm:py-14")}>
          <ScrollReveal>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className={sectionHeading}>{content.galleryTitle}</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-400">{content.galleryIntro}</p>
            </div>
          </ScrollReveal>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {galleryImages.slice(0, 6).map((src, index) => (
              <ScrollReveal key={`${src}-${index}`}>
                <div
                  className={cn(
                    "relative overflow-hidden rounded-2xl border border-white/10",
                    index === 0
                      ? "min-h-[220px] sm:col-span-2 sm:min-h-[280px] lg:col-span-3 lg:min-h-[320px]"
                      : "min-h-[180px] sm:min-h-[200px]",
                  )}
                >
                  <CoverImage
                    src={src}
                    alt={
                      ar
                        ? `صورة احتفال ${index + 1}`
                        : `Celebration photo ${index + 1}`
                    }
                    className="transition duration-700 hover:scale-105"
                    sizes={
                      index === 0
                        ? "(max-width: 768px) 100vw, 100vw"
                        : "(max-width: 768px) 100vw, 33vw"
                    }
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* Form */}
      <section
        ref={formRef}
        id="national-day-request"
        className={cn(siteContainer, "relative py-12 sm:py-16")}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_60%_70%_at_50%_0%,rgba(16,185,129,0.18),transparent)]"
          aria-hidden
        />
        <SlideInEdge from="bottom" className="relative mx-auto max-w-3xl">
          <div className="text-center">
            <p className={cn(pageEyebrow, "!text-emerald-400/90")}>{content.formEyebrow}</p>
            <h2 className={cn(sectionHeading, "mt-3")}>{content.formTitle}</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-400">{content.formIntro}</p>
            {selectedInterests.length > 0 ? (
              <p className="mt-3 text-sm text-emerald-300/90">
                {ar ? "الخدمات المختارة: " : "Selected: "}
                {selectedInterests.join(ar ? "، " : ", ")}
              </p>
            ) : null}
          </div>

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                className="mt-10 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-6 py-10 text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <p className="text-lg font-semibold text-emerald-100">{content.successTitle}</p>
                <p className="mt-2 text-sm leading-relaxed text-emerald-100/85">{content.success}</p>
                <button
                  type="button"
                  className="mt-6 rounded-full border border-emerald-400/35 px-5 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/15"
                  onClick={() => setSent(false)}
                >
                  {content.sendAnother}
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="mt-10 rounded-2xl border border-white/10 bg-slate-950/75 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.4)] backdrop-blur-sm sm:p-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="nd-name" className="text-sm font-medium text-slate-200">
                      {content.name}
                    </label>
                    <input
                      id="nd-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={fieldClass}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label htmlFor="nd-email" className="text-sm font-medium text-slate-200">
                      {content.email}
                    </label>
                    <input
                      id="nd-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={fieldClass}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label htmlFor="nd-phone" className="text-sm font-medium text-slate-200">
                      {content.phone}
                    </label>
                    <input
                      id="nd-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={fieldClass}
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label htmlFor="nd-location" className="text-sm font-medium text-slate-200">
                      {content.location}
                    </label>
                    <input
                      id="nd-location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="nd-guests" className="text-sm font-medium text-slate-200">
                      {content.guestsCount}
                    </label>
                    <input
                      id="nd-guests"
                      type="number"
                      min={1}
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="nd-interest" className="text-sm font-medium text-slate-200">
                      {content.interest}
                    </label>
                    <input
                      id="nd-interest"
                      type="text"
                      value={selectedInterests.join(ar ? "، " : ", ")}
                      onChange={(e) =>
                        setSelectedInterests(
                          e.target.value
                            .split(/[،,]/)
                            .map((part) => part.trim())
                            .filter(Boolean),
                        )
                      }
                      className={fieldClass}
                      placeholder={
                        ar
                          ? "مثال: شاشات العرض، أنظمة الصوت…"
                          : "e.g. Display screens, Sound systems…"
                      }
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="nd-message" className="text-sm font-medium text-slate-200">
                      {content.message}
                    </label>
                    <textarea
                      id="nd-message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>

                {error ? (
                  <p className="mt-4 text-sm text-rose-300" role="alert">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(16,185,129,0.3)] transition hover:from-emerald-400 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {loading ? content.sending : content.submit}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </SlideInEdge>
      </section>
    </div>
  );
}
