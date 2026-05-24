"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { siteApi, ApiError } from "@/services/api";
import { BookButton } from "@/components/ui/BookButton";
import { siteContainer } from "@/lib/layout";
import { submitInquiry } from "@/services/inquiryService";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

interface ContactFormProps {
  readonly locale: Locale;
  readonly copy: Dictionary["pages"]["contact"];
  readonly locale: Locale;
  readonly whatsapp?: string;
}

export function ContactForm({
  copy,
  locale,
  whatsapp = "966563672097",
}: ContactFormProps): React.ReactElement {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      await siteApi.submitInquiry({
        type: "contact",
        name: String(fd.get("name")),
        email: String(fd.get("email")),
        phone: String(fd.get("phone") || ""),
        message: String(fd.get("message")),
        locale,
        source: "contact-page",
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "حدث خطأ");
  locale,
  copy,
}: ContactFormProps): React.ReactElement {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await submitInquiry({
        type: "contact",
        source: "contact-page",
        locale,
        name,
        email,
        message,
      });
      setSent(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${siteContainer} grid gap-12 py-16 lg:grid-cols-2`}>
      <ScrollReveal>
        <h1 className="text-3xl font-bold sm:text-4xl">{copy.title}</h1>
        <p className="mt-4 text-slate-300">{copy.intro}</p>
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-200"
        >
          WhatsApp +{whatsapp.replace(/\D/g, "")}
        </a>
        <BookButton
          type="booking"
          source="contact-sidebar"
          className="mt-8 inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-200"
        >
          {copy.title}
        </BookButton>
      </ScrollReveal>

      <ScrollReveal>
        {sent ? (
          <p className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 text-cyan-100">
            {copy.success}
          </p>
        ) : (
          <form className="gradient-border" onSubmit={(e) => void handleSubmit(e)}>
          <form className="gradient-border" onSubmit={handleSubmit}>
            <div className="inner flex flex-col gap-4 p-6">
              {error ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                  {error}
                </p>
              ) : null}
              <label className="text-sm text-slate-300">
                {copy.name}
                <input
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-cyan-400/50"
                />
              </label>
              <label className="text-sm text-slate-300">
                {copy.email}
                <input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-cyan-400/50"
                />
              </label>
              <label className="text-sm text-slate-300">
                {locale === "ar" ? "الهاتف" : "Phone"}
                <input
                  name="phone"
                  type="tel"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-cyan-400/50"
                />
              </label>
              <label className="text-sm text-slate-300">
                {copy.message}
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-cyan-400/50"
                />
              </label>
              {error ? <p className="text-sm text-red-300">{error}</p> : null}
              <motion.button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-full bg-gradient-to-l from-violet-600 to-cyan-500 py-3 font-semibold text-white disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? "..." : copy.send}
                className="mt-2 rounded-full bg-gradient-to-l from-violet-600 to-cyan-500 py-3 font-semibold text-white disabled:opacity-60"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? "…" : copy.send}
              </motion.button>
            </div>
          </form>
        )}
      </ScrollReveal>
    </div>
  );
}
