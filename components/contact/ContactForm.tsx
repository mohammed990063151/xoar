"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import type { Dictionary } from "@/lib/dictionary";

interface ContactFormProps {
  readonly copy: Dictionary["pages"]["contact"];
}

export function ContactForm({ copy }: ContactFormProps): React.ReactElement {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
      <ScrollReveal>
        <h1 className="text-4xl font-bold">{copy.title}</h1>
        <p className="mt-4 text-slate-300">{copy.intro}</p>
        <a
          href="https://wa.me/966563672097"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-200"
        >
          WhatsApp +966563672097
        </a>
      </ScrollReveal>

      <ScrollReveal>
        {sent ? (
          <p className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6 text-cyan-100">
            {copy.success}
          </p>
        ) : (
          <form
            className="gradient-border"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="inner flex flex-col gap-4 p-6">
              <label className="text-sm text-slate-300">
                {copy.name}
                <input
                  required
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-cyan-400/50"
                />
              </label>
              <label className="text-sm text-slate-300">
                {copy.email}
                <input
                  type="email"
                  required
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-cyan-400/50"
                />
              </label>
              <label className="text-sm text-slate-300">
                {copy.message}
                <textarea
                  required
                  rows={4}
                  className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-cyan-400/50"
                />
              </label>
              <motion.button
                type="submit"
                className="mt-2 rounded-full bg-gradient-to-l from-violet-600 to-cyan-500 py-3 font-semibold text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {copy.send}
              </motion.button>
            </div>
          </form>
        )}
      </ScrollReveal>
    </div>
  );
}
