"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { siteApi, ApiError } from "@/services/api";
import type { Dictionary } from "@/lib/dictionary";
import type { Locale } from "@/lib/i18n";

interface ContactFormProps {
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
      <ScrollReveal>
        <h1 className="text-4xl font-bold">{copy.title}</h1>
        <p className="mt-4 text-slate-300">{copy.intro}</p>
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-200"
        >
          WhatsApp +{whatsapp.replace(/\D/g, "")}
        </a>
      </ScrollReveal>

      <ScrollReveal>
        {sent ? (
          <p className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 text-cyan-100">
            {copy.success}
          </p>
        ) : (
          <form className="gradient-border" onSubmit={(e) => void handleSubmit(e)}>
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
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-cyan-400/50"
                />
              </label>
              <label className="text-sm text-slate-300">
                {copy.email}
                <input
                  name="email"
                  type="email"
                  required
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
                  className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-cyan-400/50"
                />
              </label>
              <motion.button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-full bg-gradient-to-l from-violet-600 to-cyan-500 py-3 font-semibold text-white disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? "..." : copy.send}
              </motion.button>
            </div>
          </form>
        )}
      </ScrollReveal>
    </div>
  );
}
