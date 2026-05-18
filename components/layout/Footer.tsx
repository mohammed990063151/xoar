"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { XoraLogo } from "@/components/brand/XoraLogo";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";
import { siteContainer } from "@/lib/layout";
import { cn } from "@/lib/cn";

interface FooterProps {
  readonly locale: Locale;
  readonly footer: Dictionary["footer"];
  readonly nav: Dictionary["nav"];
}

const links = [
  { href: "/", key: "home" as const },
  { href: "/about", key: "about" as const },
  { href: "/services", key: "services" as const },
  { href: "/events", key: "events" as const },
  { href: "/activities", key: "activities" as const },
  { href: "/contact", key: "contact" as const },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export function Footer({
  locale,
  footer,
  nav,
}: FooterProps): React.ReactElement {
  return (
    <footer className="relative mt-16 overflow-hidden border-t border-white/10 bg-[#020617]/90">
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 h-px animate-header-line opacity-60"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -end-40 bottom-0 h-64 w-64 rounded-full bg-purple-600/12 blur-[100px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className={cn(siteContainer, "relative grid gap-10 py-14 lg:grid-cols-3")}
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-8%" }}
      >
        <motion.div variants={fadeUp}>
          <Link
            href={localizedPath(locale, "/")}
            className="inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500/80"
            aria-label="xora"
          >
            <XoraLogo size="lg" />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            {footer.about}
          </p>
        </motion.div>
        <motion.div variants={fadeUp}>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-200/90">
            {footer.quickLinks}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            {links.map(({ href, key }) => (
              <li key={href}>
                <Link
                  href={localizedPath(locale, href)}
                  className="transition hover:text-blue-300"
                >
                  {nav[key]}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div variants={fadeUp}>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-200/90">
            {footer.contactTitle}
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>
              <a
                href={`mailto:${footer.email}`}
                className="transition hover:text-blue-300"
              >
                {footer.email}
              </a>
            </li>
            <li>
              <a
                href="tel:+966563672097"
                className="transition hover:text-blue-300"
              >
                {footer.phone}
              </a>
            </li>
            <li className="pt-2 text-xs text-slate-500">{footer.follow}</li>
            <li className="flex gap-3 pt-1">
              {["in", "tw", "ig"].map((s, i) => (
                <motion.span
                  key={s}
                  className="flex h-9 w-9 cursor-default items-center justify-center rounded-full border border-white/10 text-[10px] uppercase text-slate-500"
                  whileHover={{
                    scale: 1.08,
                    borderColor: "rgba(168, 85, 247, 0.45)",
                    color: "rgb(196 181 253)",
                  }}
                  transition={{ delay: i * 0.02 }}
                >
                  {s}
                </motion.span>
              ))}
            </li>
          </ul>
        </motion.div>
      </motion.div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} xora. {footer.rights}
      </div>
    </footer>
  );
}
