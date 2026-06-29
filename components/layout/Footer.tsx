"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { XoraLogo } from "@/components/brand/XoraLogo";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/ContactChannelIcons";
import { getFooterSocialLinks, SocialIconLink } from "@/components/ui/SocialIconLink";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";
import { formatPhoneDisplay, phoneTelHref } from "@/lib/phone";
import { whatsappHref } from "@/lib/whatsapp";
import type { SiteSettings } from "@/services/contentService";
import { siteContainer } from "@/lib/layout";
import { cn } from "@/lib/cn";

interface FooterProps {
  readonly locale: Locale;
  readonly footer: Dictionary["footer"];
  readonly nav: Dictionary["nav"];
  readonly settings?: SiteSettings;
}

const navLinks = [
  { href: "/", key: "home" as const },
  { href: "/about", key: "about" as const },
  { href: "/services", key: "services" as const },
  { href: "/events", key: "events" as const },
  { href: "/activities", key: "activities" as const },
  { href: "/partners", key: "partners" as const },
  { href: "/blog", key: "blog" as const },
  { href: "/careers", key: "careers" as const },
  { href: "/contact", key: "contact" as const },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function FooterHeading({
  children,
  accentTowardStart,
}: {
  readonly children: React.ReactNode;
  readonly accentTowardStart: boolean;
}): React.ReactElement {
  return (
    <h3 className="flex items-center gap-3">
      <span
        className={cn(
          "h-px w-10 shrink-0",
          accentTowardStart
            ? "bg-gradient-to-l from-violet-500/70 to-transparent"
            : "bg-gradient-to-r from-violet-500/70 to-transparent",
        )}
        aria-hidden
      />
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-200/90">
        {children}
      </span>
    </h3>
  );
}

export function Footer({
  locale,
  footer,
  nav,
  settings,
}: FooterProps): React.ReactElement {
  const ar = locale === "ar";
  const accentTowardStart = ar;
  const email = settings?.email?.trim() || footer.email;
  const phoneRaw = settings?.phone?.trim() || footer.phone;
  const phoneDisplay = formatPhoneDisplay(phoneRaw) || phoneRaw;
  const phoneHref = phoneTelHref(phoneRaw);
  const waHref = whatsappHref(settings?.whatsapp);
  const footerSocial = footer.social as Partial<Record<string, string>> | undefined;
  const socialLinks = getFooterSocialLinks(settings?.social, footerSocial);

  return (
    <footer className="relative mt-20 border-t border-white/10 bg-[#020617]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-80"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute start-1/4 top-8 h-40 w-40 -translate-x-1/2 rounded-full bg-violet-600/10 blur-[90px]"
        animate={{ opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute end-1/4 bottom-24 h-48 w-48 rounded-full bg-cyan-500/8 blur-[100px]"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        aria-hidden
      />

      <div className={cn(siteContainer, "relative py-12 sm:py-14")}>
        <motion.div
          className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 shadow-[0_24px_64px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:rounded-3xl"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-6%" }}
        >
          <div className="grid gap-0 lg:grid-cols-12">
            {/* Brand */}
            <motion.div
              variants={fadeUp}
              className="border-b border-white/8 px-6 py-8 sm:px-8 lg:col-span-4 lg:border-b-0 lg:border-e lg:py-10"
            >
              <Link
                href={localizedPath(locale, "/")}
                className="inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500/80"
                aria-label="xora"
              >
                <XoraLogo size="lg" />
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">{footer.about}</p>
              <Link
                href={localizedPath(locale, "/contact")}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-100 transition hover:border-purple-400/60 hover:bg-purple-500/20 hover:text-white"
              >
                {nav.contact}
              </Link>
            </motion.div>

            {/* Quick links */}
            <motion.div
              variants={fadeUp}
              className="border-b border-white/8 px-6 py-8 sm:px-8 lg:col-span-3 lg:border-b-0 lg:border-e lg:py-10"
            >
              <FooterHeading accentTowardStart={accentTowardStart}>{footer.quickLinks}</FooterHeading>
              <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                {navLinks.map(({ href, key }) => (
                  <li key={href}>
                    <Link
                      href={localizedPath(locale, href)}
                      className="text-slate-400 transition hover:text-cyan-300"
                    >
                      {nav[key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact + social */}
            <motion.div variants={fadeUp} className="px-6 py-8 sm:px-8 lg:col-span-5 lg:py-10">
              <FooterHeading accentTowardStart={accentTowardStart}>{footer.contactTitle}</FooterHeading>

              <div className="mt-5 space-y-2">
                <a
                  href={`mailto:${email}`}
                  className="group flex items-center gap-3 rounded-xl border border-white/8 bg-black/30 px-3 py-2.5 transition hover:border-cyan-500/30 hover:bg-cyan-500/5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                    <MailIcon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      {ar ? "البريد" : "Email"}
                    </span>
                    <span
                      dir="ltr"
                      className="mt-0.5 block truncate text-sm font-medium text-slate-100 group-hover:text-cyan-200"
                    >
                      {email}
                    </span>
                  </span>
                </a>

                {phoneDisplay ? (
                  <a
                    href={phoneHref}
                    className="group flex items-center gap-3 rounded-xl border border-white/8 bg-black/30 px-3 py-2.5 transition hover:border-violet-500/30 hover:bg-violet-500/5"
                    dir="ltr"
                    style={{ unicodeBidi: "isolate" }}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10 text-violet-300">
                      <PhoneIcon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="min-w-0 flex-1 text-start">
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-slate-500">
                        {ar ? "الجوال" : "Phone"}
                      </span>
                      <span className="mt-0.5 block text-sm font-medium text-slate-100 group-hover:text-violet-200">
                        {phoneDisplay}
                      </span>
                    </span>
                  </a>
                ) : null}
              </div>

              <div className="mt-6 border-t border-white/8 pt-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {footer.follow}
                </p>
                <div className="mt-3 grid w-full max-w-[min(100%,18rem)] grid-cols-5 gap-2 sm:max-w-xs">
                  <motion.a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={footer.whatsapp ?? (ar ? "واتساب" : "WhatsApp")}
                    title={footer.whatsapp ?? (ar ? "واتساب" : "WhatsApp")}
                    className="flex aspect-square items-center justify-center rounded-xl border border-emerald-500/35 bg-emerald-500/12 text-emerald-300 transition hover:border-emerald-400/60 hover:bg-emerald-500/22 hover:text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <WhatsAppIcon className="h-5 w-5" />
                  </motion.a>

                  {socialLinks.map(({ key, href, label, active }) => (
                    <motion.div
                      key={key}
                      className="flex aspect-square items-stretch justify-stretch"
                      whileHover={active ? { scale: 1.05 } : undefined}
                      whileTap={active ? { scale: 0.97 } : undefined}
                    >
                      <SocialIconLink
                        href={href}
                        label={label}
                        icon={key}
                        inactive={!active}
                        className="!h-full !w-full !rounded-xl"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/8 pt-6 text-center text-xs text-slate-500 sm:flex-row sm:text-start">
          <p>
            © {new Date().getFullYear()} xora. {footer.rights}
          </p>
          <p className="text-slate-600">
            {ar ? "تجارب فعاليات لا تُنسى" : "Unforgettable event experiences"}
          </p>
        </div>
      </div>
    </footer>
  );
}
