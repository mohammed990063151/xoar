"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/ContactChannelIcons";
import { getSocialLinks, SocialIconLink } from "@/components/ui/SocialIconLink";
import { formatPhoneDisplay, phoneTelHref } from "@/lib/phone";
import { whatsappHref } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { pageBottom, pageTitle, siteContainer } from "@/lib/layout";
import { submitInquiry } from "@/services/inquiryService";
import { useFormProfileAutofill } from "@/hooks/useFormProfileAutofill";
import { readFormProfile } from "@/lib/form-profile-cookie";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/services/contentService";

interface ContactPageViewProps {
  readonly locale: Locale;
  readonly copy: Dictionary["pages"]["contact"];
  readonly whatsapp?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly social?: SiteSettings["social"];
}

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]";

function SuccessCheck(): React.ReactElement {
  return (
    <motion.div
      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/20 ring-2 ring-emerald-400/40"
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="h-10 w-10 text-emerald-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <motion.path
          d="M5 13l4 4L19 7"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.25, duration: 0.45 }}
        />
      </motion.svg>
    </motion.div>
  );
}

export function ContactPageView({
  locale,
  copy,
  whatsapp,
  email,
  phone,
  social,
}: ContactPageViewProps): React.ReactElement {
  const ar = locale === "ar";
  const formRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useFormProfileAutofill({ setName, setEmail: setFormEmail, setPhone: setFormPhone });

  const successTitle =
    copy.successTitle ?? (ar ? "تم إرسال رسالتك بنجاح" : "Message sent successfully");
  const channelsTitle =
    copy.channelsTitle ?? (ar ? "قنوات التواصل المباشرة" : "Direct contact channels");
  const whyTitle = copy.whyTitle ?? (ar ? "لماذا تتواصل معنا؟" : "Why reach out?");
  const formTitle = copy.formTitle ?? (ar ? "نموذج التواصل" : "Contact form");
  const phoneLabel = copy.phone ?? (ar ? "رقم الجوال" : "Phone number");
  const sendingLabel = copy.sending ?? (ar ? "جاري الإرسال…" : "Sending…");
  const sendAnotherLabel = copy.sendAnother ?? (ar ? "إرسال رسالة أخرى" : "Send another message");

  const socialLinks = getSocialLinks(social);

  useEffect(() => {
    if (sent && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [sent]);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await submitInquiry({
        type: "contact",
        source: "contact-page",
        locale,
        name,
        email: formEmail,
        phone: formPhone,
        message,
      });
      setSent(true);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : ar ? "تعذّر الإرسال" : "Could not send");
    } finally {
      setLoading(false);
    }
  }

  function resetForm(): void {
    setSent(false);
    setError("");
    const saved = readFormProfile();
    setName(saved.name ?? "");
    setFormEmail(saved.email ?? "");
    setFormPhone(saved.phone ?? "");
    setMessage("");
  }

  const channels: {
    label: string;
    value: string;
    href?: string;
    accent: string;
    Icon: React.ComponentType<{ className?: string }>;
    iconClass: string;
  }[] = [
    {
      label: ar ? "واتساب" : "WhatsApp",
      value: whatsapp ? formatPhoneDisplay(whatsapp) || whatsapp : "",
      href: whatsappHref(whatsapp),
      accent: "from-emerald-500/20 to-emerald-900/10",
      Icon: WhatsAppIcon,
      iconClass: "text-emerald-300",
    },
    {
      label: ar ? "البريد الإلكتروني" : "Email",
      value: email || "hello@xora.events",
      href: email ? `mailto:${email}` : undefined,
      accent: "from-cyan-500/20 to-blue-900/10",
      Icon: MailIcon,
      iconClass: "text-cyan-300",
    },
    {
      label: ar ? "الجوال" : "Phone",
      value: formatPhoneDisplay(phone) || phone || "",
      href: phoneTelHref(phone) || undefined,
      accent: "from-violet-500/20 to-purple-900/10",
      Icon: PhoneIcon,
      iconClass: "text-violet-300",
    },
  ].filter((c) => c.value);

  return (
    <div className={cn(pageBottom, "relative overflow-hidden")}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_80%_70%_at_50%_-10%,rgba(99,102,241,0.28),transparent)]"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute start-[8%] top-32 h-48 w-48 rounded-full bg-violet-600/15 blur-3xl"
        animate={{ y: [0, 18, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute end-[10%] top-48 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl"
        animate={{ y: [0, -22, 0], opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        aria-hidden
      />

      <section className={`${siteContainer} relative pt-12 sm:pt-16`}>
        <SlideInEdge from="bottom">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90">
              {ar ? "نحن هنا لمساعدتك" : "We are here to help"}
            </p>
            <h1 className={pageTitle}>{copy.title}</h1>
            <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">{copy.intro}</p>
          </div>
        </SlideInEdge>

        {channels.length > 0 ? (
          <div className="mt-12">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {channelsTitle}
            </p>
          <div className="mt-6 grid w-full max-w-4xl gap-3 sm:grid-cols-3 sm:gap-4">
              {channels.map((channel, i) => (
                <SlideInEdge key={channel.label} from={i % 2 === 0 ? "end" : "start"} delay={i * 0.08}>
                  <motion.div
                    className={`rounded-2xl border border-white/10 bg-gradient-to-b ${channel.accent} p-5 text-center backdrop-blur-sm`}
                    whileHover={{ y: -5, borderColor: "rgba(168, 85, 247, 0.4)" }}
                  >
                    <span
                      className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/30 ${channel.iconClass}`}
                      aria-hidden
                    >
                      <channel.Icon className="h-6 w-6" />
                    </span>
                    <p className="mt-2 text-xs text-slate-500">{channel.label}</p>
                    {channel.href ? (
                      <a
                        href={channel.href}
                        target={
                          channel.label.includes("WhatsApp") || channel.label.includes("واتساب")
                            ? "_blank"
                            : undefined
                        }
                        rel="noopener noreferrer"
                        dir={channel.label.includes("الجوال") || channel.label.includes("Phone") ? "ltr" : undefined}
                        className="mt-1 block text-sm font-semibold text-white hover:text-cyan-300"
                      >
                        {channel.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-semibold text-white">{channel.value}</p>
                    )}
                  </motion.div>
                </SlideInEdge>
              ))}
            </div>
          </div>
        ) : null}

        {socialLinks.length > 0 ? (
          <SlideInEdge from="bottom" delay={0.15}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {socialLinks.map((link) => (
                <SocialIconLink key={link.key} href={link.href} label={link.label} icon={link.key} />
              ))}
            </div>
          </SlideInEdge>
        ) : null}
      </section>

      <section className={`${siteContainer} relative mt-14 sm:mt-16`}>
        <div className="grid gap-8 md:gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <SlideInEdge from={ar ? "end" : "start"}>
            <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-white">{whyTitle}</h2>
              <ul className="mt-5 space-y-4 text-sm leading-relaxed text-slate-400">
                <li className="flex gap-3">
                  <span className="text-cyan-400" aria-hidden>
                    ◆
                  </span>
                  {ar
                    ? "تخطيط فعاليات وأنشطة مخصّصة لجمهورك."
                    : "Custom events and activities tailored to your audience."}
                </li>
                <li className="flex gap-3">
                  <span className="text-violet-400" aria-hidden>
                    ◆
                  </span>
                  {ar ? "رد خلال ٢٤ ساعة من فريق زورا." : "Response within 24 hours from the Xora team."}
                </li>
                <li className="flex gap-3">
                  <span className="text-emerald-400" aria-hidden>
                    ◆
                  </span>
                  {ar
                    ? "استشارة مجانية لأفكار الحفلات والمعارض."
                    : "Free consultation for gala and exhibition ideas."}
                </li>
              </ul>
              <motion.a
                href={whatsappHref(whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-sm font-semibold text-white sm:w-auto sm:px-8"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                {ar ? "محادثة واتساب فورية" : "Chat on WhatsApp"}
              </motion.a>
            </div>
          </SlideInEdge>

          <div ref={formRef}>
            <SlideInEdge from={ar ? "start" : "end"} delay={0.1}>
              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="success"
                    className="gradient-border shadow-[0_24px_80px_rgba(16,185,129,0.12)]"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.45 }}
                    role="status"
                    aria-live="polite"
                  >
                    <div className="inner px-6 py-10 text-center sm:px-10 sm:py-12">
                      <SuccessCheck />
                      <h2 className="mt-6 text-2xl font-bold text-white">{successTitle}</h2>
                      <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-cyan-100/90">
                        {copy.success}
                      </p>
                      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <motion.button
                          type="button"
                          onClick={resetForm}
                          className="rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-violet-400/50"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {sendAnotherLabel}
                        </motion.button>
                        <motion.a
                          href={whatsappHref(whatsapp)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {ar ? "متابعة عبر واتساب" : "Continue on WhatsApp"}
                        </motion.a>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    className="gradient-border shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
                    onSubmit={(e) => void handleSubmit(e)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <div className="inner flex flex-col gap-5 p-6 sm:p-8">
                      <h2 className="text-lg font-semibold text-white">{formTitle}</h2>
                      {error ? (
                        <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                          {error}
                        </p>
                      ) : null}
                      <label className="text-sm text-slate-300">
                        {copy.name}
                        <input
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={fieldClass}
                          autoComplete="name"
                        />
                      </label>
                      <div className="grid gap-5 sm:grid-cols-2">
                        <label className="text-sm text-slate-300">
                          {copy.email}
                          <input
                            type="email"
                            required
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            className={fieldClass}
                            autoComplete="email"
                          />
                        </label>
                        <label className="text-sm text-slate-300">
                          {phoneLabel}
                          <input
                            type="tel"
                            value={formPhone}
                            onChange={(e) => setFormPhone(e.target.value)}
                            className={fieldClass}
                            autoComplete="tel"
                            dir="ltr"
                          />
                        </label>
                      </div>
                      <label className="text-sm text-slate-300">
                        {copy.message}
                        <textarea
                          required
                          rows={5}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          className={fieldClass}
                        />
                      </label>
                      <motion.button
                        type="submit"
                        disabled={loading}
                        className="rounded-full bg-gradient-to-l from-violet-600 to-cyan-500 py-3.5 font-semibold text-white disabled:opacity-60"
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                      >
                        {loading ? sendingLabel : copy.send}
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </SlideInEdge>
          </div>
        </div>
      </section>
    </div>
  );
}
