"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import { useFormProfileAutofill } from "@/hooks/useFormProfileAutofill";
import { submitInquiry } from "@/services/inquiryService";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { pageBottom, siteContainer } from "@/lib/layout";
import { cn } from "@/lib/cn";

type Copy = Dictionary["pages"]["annualCorporateEvent"];

interface AnnualCorporateLandingViewProps {
  readonly locale: Locale;
  readonly copy: Copy;
}

/**
 * Realistic event photos (local copies):
 * venues — قاعة مارايا / العلا (سعودية)
 * decor — ديكور قاعة حفل حقيقي
 * catering — تقديم قهوة عربية / ضيافة خليجية
 * entertainment — عرضة سعودية من فعالية بالرياض (TARTEEB)
 * production — مسرح وإضاءة سعودية (4 Stars International)
 * gifts — هدايا شركات
 * hosts — مقدّم فعالية بزيّ سعودي (TARTEEB — الرياض)
 */
const HERO_IMAGE = "/landing/annual-corporate/venue-maraya-1.jpg";

const SERVICE_IMAGES: Record<string, string> = {
  // قاعة مارايا — العلا (قاعة حفلات سعودية)
  venues: "/landing/annual-corporate/venue-maraya-3.jpg",
  // ديكور قاعة حفل حقيقية
  decor: "/landing/annual-corporate/pexels-ballroom-decor.jpg",
  // تقديم قهوة عربية / ضيافة صبابين
  catering: "/landing/annual-corporate/catering-arabic-coffee-served.png",
  // عرض ترفيهي سعودي (عرضة) — فعالية في الرياض
  entertainment: "/landing/annual-corporate/sa-svc-entertainment.jpg",
  // إنتاج فني فخم: سماعات + تروس إضاءة + شاشة LED (ZONEX الرياض)
  production: "/landing/annual-corporate/sa-svc-production-av.webp",
  // هدايا شركات
  gifts: "/landing/annual-corporate/gifts-corporate.jpg",
  // مقدّم فعالية بزيّ سعودي على المنصة — فعالية في الرياض
  hosts: "/landing/annual-corporate/sa-svc-hosts.jpg",
};

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/12 bg-black/45 px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/55 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]";

function scrollToForm(): void {
  document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function AnnualCorporateLandingView({
  locale,
  copy,
}: AnnualCorporateLandingViewProps): React.ReactElement {
  const ar = locale === "ar";
  const reduceMotion = useReducedMotion();

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useFormProfileAutofill({
    setName: setContactName,
    setEmail,
    setPhone,
  });

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    setLoading(true);

    const message = [
      ar ? "[طلب حفل سنوي للشركات]" : "[Annual corporate event lead]",
      `${ar ? "الشركة" : "Company"}: ${companyName.trim()}`,
      `${ar ? "المسؤول" : "Contact"}: ${contactName.trim()}`,
      `${ar ? "المسمى الوظيفي" : "Job title"}: ${jobTitle.trim()}`,
      `${ar ? "الجوال" : "Phone"}: ${phone.trim()}`,
      `${ar ? "البريد" : "Email"}: ${email.trim()}`,
    ].join("\n");

    try {
      await submitInquiry({
        type: "service",
        source: "annual-corporate-landing",
        locale,
        name: contactName.trim(),
        company_name: companyName.trim(),
        job_title: jobTitle.trim(),
        email: email.trim(),
        phone: phone.trim(),
        event_type: "corporate",
        title: ar
          ? `حفل سنوي — ${companyName.trim()}`
          : `Annual event — ${companyName.trim()}`,
        message,
      });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : ar
            ? "تعذّر الإرسال. حاول مرة أخرى."
            : "Could not send. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("annual-corporate-landing", pageBottom)}>
      <section className="annual-corporate-hero relative isolate min-h-[calc(100svh-3.5rem)] overflow-hidden sm:min-h-[calc(100svh-3.625rem)]">
        <Image
          src={HERO_IMAGE}
          alt={ar ? "مركز مؤتمرات في الرياض" : "Conference center in Riyadh"}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#05050c]/75 via-[#05050c]/82 to-[#05050c]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(34,211,238,0.16),transparent)]"
          aria-hidden
        />

        <div className={cn(siteContainer, "relative flex min-h-[inherit] flex-col justify-center py-10 sm:py-14 lg:py-16")}>
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12 xl:gap-16">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl"
            >
              <p
                className={cn(
                  "text-[10px] font-semibold text-cyan-300/90 sm:text-xs",
                  ar ? "tracking-normal" : "uppercase tracking-[0.22em]",
                )}
              >
                {copy.eyebrow}
              </p>
              <p className="mt-3 text-3xl font-extrabold tracking-normal text-white sm:text-4xl lg:text-5xl">
                {copy.brand}
              </p>
              <h1 className="mt-3 text-[clamp(1.45rem,4.8vw,2.65rem)] font-bold leading-tight tracking-normal text-white">
                {copy.title}
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
                {copy.intro}
              </p>
              <ul className="mt-6 flex flex-col gap-2.5 sm:mt-7">
                {copy.trust.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-slate-200 sm:text-[15px]"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              id="lead-form"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="scroll-mt-24"
            >
              <div className="rounded-[1.5rem] border border-white/12 bg-slate-950/75 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-6 lg:p-7">
                {sent ? (
                  <div className="py-6 text-center sm:py-8">
                    <p className="text-lg font-bold text-cyan-100 sm:text-xl">
                      {copy.successTitle}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                      {copy.success}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSent(false);
                        setCompanyName("");
                        setContactName("");
                        setJobTitle("");
                        setPhone("");
                        setEmail("");
                      }}
                      className="mt-6 inline-flex rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:text-white"
                    >
                      {copy.sendAnother}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                    <div>
                      <h2 className="text-lg font-bold text-white sm:text-xl">
                        {copy.formTitle}
                      </h2>
                      <p className="mt-1 text-sm text-slate-400">{copy.formHint}</p>
                    </div>

                    {error ? (
                      <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                        {error}
                      </p>
                    ) : null}

                    <label className="block text-sm text-slate-300">
                      {copy.companyName}
                      <input
                        required
                        name="company"
                        autoComplete="organization"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className={fieldClass}
                      />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm text-slate-300">
                        {copy.contactName}
                        <input
                          required
                          name="name"
                          autoComplete="name"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          className={fieldClass}
                        />
                      </label>
                      <label className="block text-sm text-slate-300">
                        {copy.jobTitle}
                        <input
                          required
                          name="jobTitle"
                          autoComplete="organization-title"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          className={fieldClass}
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block text-sm text-slate-300">
                        {copy.phone}
                        <input
                          required
                          type="tel"
                          name="phone"
                          autoComplete="tel"
                          inputMode="tel"
                          dir="ltr"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={cn(fieldClass, "text-start")}
                        />
                      </label>
                      <label className="block text-sm text-slate-300">
                        {copy.email}
                        <input
                          required
                          type="email"
                          name="email"
                          autoComplete="email"
                          dir="ltr"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={cn(fieldClass, "text-start")}
                        />
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-1 flex w-full items-center justify-center rounded-xl bg-gradient-to-l from-violet-600 via-blue-500 to-cyan-400 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(99,102,241,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? copy.sending : copy.submit}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="services" className="annual-corporate-services relative border-t border-white/5 py-12 sm:py-16 lg:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(139,92,246,0.1),transparent)]"
          aria-hidden
        />
        <div className={cn(siteContainer, "relative")}>
          <SlideInEdge from="bottom" amount={28}>
            <div className="mx-auto max-w-2xl text-center">
              <p
                className={cn(
                  "text-[10px] font-semibold text-cyan-400/90 sm:text-xs",
                  ar ? "tracking-normal" : "uppercase tracking-[0.2em]",
                )}
              >
                {copy.servicesEyebrow}
              </p>
              <h2 className="mt-3 text-[clamp(1.35rem,4vw,2.25rem)] font-bold tracking-normal text-white">
                {copy.servicesTitle}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                {copy.servicesIntro}
              </p>
            </div>
          </SlideInEdge>

          <div className="mt-10 grid gap-6 sm:mt-12 sm:gap-8 md:grid-cols-2 xl:grid-cols-3">
            {copy.services.map((service, index) => {
              const image = SERVICE_IMAGES[service.id] ?? HERO_IMAGE;
              return (
                <SlideInEdge
                  key={service.id}
                  from="bottom"
                  delay={Math.min(index * 0.05, 0.25)}
                  amount={36}
                >
                  <article className="group h-full overflow-hidden">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 shadow-sm">
                      <Image
                        src={image}
                        alt={service.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"
                        aria-hidden
                      />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-white sm:text-xl">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-[15px]">
                      {service.description}
                    </p>
                  </article>
                </SlideInEdge>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center sm:mt-14">
            <button
              type="button"
              onClick={scrollToForm}
              className="annual-service-cta inline-flex items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
            >
              {copy.ctaBack}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
