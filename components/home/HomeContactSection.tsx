"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SlideInEdge } from "@/components/motion/SlideInEdge";
import { submitInquiry } from "@/services/inquiryService";
import { useFormProfileAutofill } from "@/hooks/useFormProfileAutofill";
import { whatsappHref } from "@/lib/whatsapp";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";
import { homeSection, homeSectionTitle, siteContainer } from "@/lib/layout";

interface HomeContactSectionProps {
  readonly locale: Locale;
  readonly eyebrow: string;
  readonly title: string;
  readonly subtitle: string;
  readonly formCopy: Dictionary["pages"]["contact"];
  readonly whatsapp?: string;
}

export function HomeContactSection({
  locale,
  eyebrow,
  title,
  subtitle,
  formCopy,
  whatsapp,
}: HomeContactSectionProps): React.ReactElement {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useFormProfileAutofill({ setName, setEmail, setPhone });

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await submitInquiry({
        type: "contact",
        source: "home-footer",
        locale,
        name,
        email,
        phone,
        message,
      });
      setSent(true);
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : locale === "ar" ? "تعذّر الإرسال" : "Could not send");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={homeSection}>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(59,130,246,0.18),transparent)]"
        aria-hidden
      />
      <div className={siteContainer}>
        <div className="grid gap-8 md:gap-10 lg:grid-cols-2 lg:items-center">
          <SlideInEdge from={locale === "ar" ? "end" : "start"}>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-400/90">
              {eyebrow}
            </p>
            <h2 className={`mt-2 ${homeSectionTitle}`}>{title}</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-400">{subtitle}</p>
            <a
              href={whatsappHref(whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
            >
              WhatsApp
            </a>
          </SlideInEdge>

          <SlideInEdge from={locale === "ar" ? "start" : "end"} delay={0.12}>
            {sent ? (
              <motion.p
                className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-8 text-center text-cyan-100"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {formCopy.success}
              </motion.p>
            ) : (
              <form className="gradient-border" onSubmit={(e) => void handleSubmit(e)}>
                <div className="inner flex flex-col gap-4 p-6 sm:p-8">
                  {error ? (
                    <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                      {error}
                    </p>
                  ) : null}
                  <label className="text-sm text-slate-300">
                    {formCopy.name}
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-cyan-400/50"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm text-slate-300">
                      {formCopy.email}
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-cyan-400/50"
                      />
                    </label>
                    <label className="text-sm text-slate-300">
                      {locale === "ar" ? "الجوال" : "Phone"}
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-cyan-400/50"
                      />
                    </label>
                  </div>
                  <label className="text-sm text-slate-300">
                    {formCopy.message}
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-white outline-none focus:border-cyan-400/50"
                    />
                  </label>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="mt-1 rounded-full bg-gradient-to-l from-violet-600 to-cyan-500 py-3.5 font-semibold text-white disabled:opacity-60"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? "…" : formCopy.send}
                  </motion.button>
                </div>
              </form>
            )}
          </SlideInEdge>
        </div>
      </div>
    </section>
  );
}
