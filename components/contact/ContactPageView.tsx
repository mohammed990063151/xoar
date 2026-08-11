"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import { ActivityLocationMap } from "@/components/activities/ActivityLocationMap";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/ContactChannelIcons";
import { getSocialLinks, SocialIconLink } from "@/components/ui/SocialIconLink";
import { formatPhoneDisplay, phoneTelHref } from "@/lib/phone";
import { whatsappHref } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { pageBottom, siteContainer } from "@/lib/layout";
import { submitInquiry } from "@/services/inquiryService";
import { useFormProfileAutofill } from "@/hooks/useFormProfileAutofill";
import { readFormProfile } from "@/lib/form-profile-cookie";
import { useDocumentTheme } from "@/hooks/useDocumentTheme";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/services/contentService";

interface ContactPageViewProps {
  readonly locale: Locale;
  readonly copy: Dictionary["pages"]["contact"] & { mapTitle?: string };
  readonly whatsapp?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly social?: SiteSettings["social"];
  readonly address?: string;
  readonly mapLatitude?: number | null;
  readonly mapLongitude?: number | null;
  readonly mapLabel?: string;
}

function SuccessCheck({ light }: { readonly light: boolean }): React.ReactElement {
  return (
    <motion.div
      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full ring-2"
      style={{
        background: light
          ? "linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.15))"
          : "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.2))",
        borderColor: "transparent",
        boxShadow: light ? "inset 0 0 0 2px rgba(16,185,129,0.35)" : "inset 0 0 0 2px rgba(52,211,153,0.4)",
      }}
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
    >
      <motion.svg
        viewBox="0 0 24 24"
        className="h-10 w-10"
        style={{ color: light ? "#059669" : "#6ee7b7" }}
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
  address,
  mapLatitude,
  mapLongitude,
  mapLabel,
}: ContactPageViewProps): React.ReactElement {
  const ar = locale === "ar";
  const light = useDocumentTheme() === "light";
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
  const mapTitle = copy.mapTitle ?? (ar ? "موقعنا على الخريطة" : "Find us on the map");

  const socialLinks = getSocialLinks(social);
  const showMap =
    (typeof mapLatitude === "number" && typeof mapLongitude === "number") ||
    Boolean(address?.trim() || mapLabel?.trim());

  const text = {
    title: light ? "#0f172a" : "#ffffff",
    muted: light ? "#475569" : "#94a3b8",
    soft: light ? "#64748b" : "#64748b",
    label: light ? "#334155" : "#cbd5e1",
    accent: light ? "#0891b2" : "rgba(34,211,238,0.9)",
    cardBorder: light ? "rgba(15,23,42,0.1)" : "rgba(255,255,255,0.1)",
    panelBg: light ? "#ffffff" : "rgba(2,6,23,0.5)",
  };

  const fieldClass = light
    ? "mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500/60 focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)]"
    : "mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition focus:border-cyan-400/60 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.12)]";

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
    lightAccent: string;
    Icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
  }[] = [
    {
      label: ar ? "واتساب" : "WhatsApp",
      value: whatsapp ? formatPhoneDisplay(whatsapp) || whatsapp : "",
      href: whatsappHref(whatsapp),
      accent: "from-emerald-500/20 to-emerald-900/10",
      lightAccent: "from-emerald-50 to-emerald-100/80",
      Icon: WhatsAppIcon,
      iconColor: light ? "#059669" : "#6ee7b7",
    },
    {
      label: ar ? "البريد الإلكتروني" : "Email",
      value: email || "hello@xora.events",
      href: email ? `mailto:${email}` : undefined,
      accent: "from-cyan-500/20 to-blue-900/10",
      lightAccent: "from-cyan-50 to-sky-100/80",
      Icon: MailIcon,
      iconColor: light ? "#0891b2" : "#67e8f9",
    },
    {
      label: ar ? "الجوال" : "Phone",
      value: formatPhoneDisplay(phone) || phone || "",
      href: phoneTelHref(phone) || undefined,
      accent: "from-violet-500/20 to-purple-900/10",
      lightAccent: "from-violet-50 to-purple-100/80",
      Icon: PhoneIcon,
      iconColor: light ? "#7c3aed" : "#c4b5fd",
    },
  ].filter((c) => c.value);

  return (
    <div className={cn(pageBottom, "relative overflow-hidden")}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
        style={{
          background: light
            ? "radial-gradient(ellipse 80% 70% at 50% -10%, rgba(99,102,241,0.12), transparent)"
            : "radial-gradient(ellipse 80% 70% at 50% -10%, rgba(99,102,241,0.28), transparent)",
        }}
        aria-hidden
      />

      <section className={`${siteContainer} relative pt-12 sm:pt-16`}>
        <SlideInEdge from="bottom">
          <div className="mx-auto max-w-3xl text-center">
            <p
              className="text-xs font-semibold uppercase tracking-[0.22em]"
              style={{ color: text.accent }}
            >
              {ar ? "نحن هنا لمساعدتك" : "We are here to help"}
            </p>
            <h1
              className="mt-3 text-[clamp(1.5rem,5.5vw,3rem)] font-bold tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: text.title }}
            >
              {copy.title}
            </h1>
            <p
              className="mt-4 text-base leading-relaxed sm:text-lg"
              style={{ color: text.muted }}
            >
              {copy.intro}
            </p>
          </div>
        </SlideInEdge>

        {channels.length > 0 ? (
          <div className="mt-12">
            <p
              className="text-center text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: text.soft }}
            >
              {channelsTitle}
            </p>
            <div className="mx-auto mt-6 grid w-full max-w-4xl gap-3 sm:grid-cols-3 sm:gap-4">
              {channels.map((channel, i) => (
                <SlideInEdge key={channel.label} from={i % 2 === 0 ? "end" : "start"} delay={i * 0.08}>
                  <motion.div
                    className={cn(
                      "rounded-2xl border bg-gradient-to-b p-5 text-center backdrop-blur-sm",
                      light ? channel.lightAccent : channel.accent,
                    )}
                    style={{ borderColor: text.cardBorder }}
                    whileHover={{ y: -5 }}
                  >
                    <span
                      className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border"
                      style={{
                        borderColor: text.cardBorder,
                        backgroundColor: light ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.3)",
                        color: channel.iconColor,
                      }}
                      aria-hidden
                    >
                      <channel.Icon className="h-6 w-6" />
                    </span>
                    <p className="mt-2 text-xs" style={{ color: text.soft }}>
                      {channel.label}
                    </p>
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
                        className="mt-1 block text-sm font-semibold"
                        style={{ color: text.title }}
                      >
                        {channel.value}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-semibold" style={{ color: text.title }}>
                        {channel.value}
                      </p>
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

      {showMap ? (
        <section className={`${siteContainer} relative mt-14 sm:mt-16`}>
          <SlideInEdge from="bottom">
            <div className="mx-auto max-w-4xl">
              <h2
                className="mb-5 text-center text-xl font-bold sm:text-2xl"
                style={{ color: text.title }}
              >
                {mapTitle}
              </h2>
              <ActivityLocationMap
                locale={locale}
                latitude={mapLatitude}
                longitude={mapLongitude}
                locationText={mapLabel || address}
                title={mapTitle}
              />
            </div>
          </SlideInEdge>
        </section>
      ) : null}

      <section className={`${siteContainer} relative mt-14 sm:mt-16`}>
        <div className="grid gap-8 md:gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <SlideInEdge from={ar ? "end" : "start"}>
            <div
              className="rounded-3xl border p-6 sm:p-8"
              style={{
                borderColor: text.cardBorder,
                backgroundColor: text.panelBg,
                boxShadow: light ? "0 12px 36px rgba(15,23,42,0.06)" : undefined,
              }}
            >
              <h2 className="text-xl font-bold" style={{ color: text.title }}>
                {whyTitle}
              </h2>
              <ul className="mt-5 space-y-4 text-sm leading-relaxed" style={{ color: text.muted }}>
                <li className="flex gap-3">
                  <span style={{ color: light ? "#0891b2" : "#22d3ee" }} aria-hidden>
                    ◆
                  </span>
                  {ar
                    ? "تخطيط فعاليات وأنشطة مخصّصة لجمهورك."
                    : "Custom events and activities tailored to your audience."}
                </li>
                <li className="flex gap-3">
                  <span style={{ color: light ? "#7c3aed" : "#a78bfa" }} aria-hidden>
                    ◆
                  </span>
                  {ar ? "رد خلال ٢٤ ساعة من فريق زورا." : "Response within 24 hours from the Xora team."}
                </li>
                <li className="flex gap-3">
                  <span style={{ color: light ? "#059669" : "#34d399" }} aria-hidden>
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
                    className="rounded-3xl border shadow-[0_24px_80px_rgba(16,185,129,0.12)]"
                    style={{
                      borderColor: light ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.1)",
                      backgroundColor: light ? "#ecfdf5" : "rgba(2,6,23,0.7)",
                    }}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.45 }}
                    role="status"
                    aria-live="polite"
                  >
                    <div className="px-6 py-10 text-center sm:px-10 sm:py-12">
                      <SuccessCheck light={light} />
                      <h2 className="mt-6 text-2xl font-bold" style={{ color: text.title }}>
                        {successTitle}
                      </h2>
                      <p
                        className="mx-auto mt-3 max-w-md text-base leading-relaxed"
                        style={{ color: light ? "#047857" : "rgba(207,250,254,0.9)" }}
                      >
                        {copy.success}
                      </p>
                      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <motion.button
                          type="button"
                          onClick={resetForm}
                          className="rounded-full border px-6 py-3 text-sm font-semibold transition"
                          style={{
                            borderColor: text.cardBorder,
                            color: text.title,
                            backgroundColor: light ? "#ffffff" : "rgba(255,255,255,0.05)",
                          }}
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
                    className="rounded-3xl border"
                    style={{
                      borderColor: text.cardBorder,
                      backgroundColor: text.panelBg,
                      boxShadow: light
                        ? "0 16px 40px rgba(15,23,42,0.08)"
                        : "0 24px 80px rgba(0,0,0,0.35)",
                    }}
                    onSubmit={(e) => void handleSubmit(e)}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <div className="flex flex-col gap-5 p-6 sm:p-8">
                      <h2 className="text-lg font-semibold" style={{ color: text.title }}>
                        {formTitle}
                      </h2>
                      {error ? (
                        <p
                          className="rounded-xl border p-3 text-sm"
                          style={{
                            borderColor: light ? "rgba(244,63,94,0.35)" : "rgba(239,68,68,0.3)",
                            backgroundColor: light ? "#fff1f2" : "rgba(239,68,68,0.1)",
                            color: light ? "#be123c" : "#fecaca",
                          }}
                        >
                          {error}
                        </p>
                      ) : null}
                      <label className="text-sm" style={{ color: text.label }}>
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
                        <label className="text-sm" style={{ color: text.label }}>
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
                        <label className="text-sm" style={{ color: text.label }}>
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
                      <label className="text-sm" style={{ color: text.label }}>
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
