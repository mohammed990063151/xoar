"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { MailIcon, PhoneIcon, WhatsAppIcon } from "@/components/ui/ContactChannelIcons";
import { getFooterSocialLinks, icons, SocialIconLink } from "@/components/ui/SocialIconLink";
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
  { href: "/works", key: "works" as const },
  { href: "/events", key: "events" as const },
  { href: "/activities", key: "activities" as const },
  { href: "/national-day", key: "nationalDay" as const },
  { href: "/partners", key: "partners" as const },
  { href: "/blog", key: "blog" as const },
  { href: "/careers", key: "careers" as const },
  { href: "/contact", key: "contact" as const },
];

function footerNavLabel(
  locale: Locale,
  key: (typeof navLinks)[number]["key"],
  nav: Dictionary["nav"],
): string {
  if (key === "works") return locale === "ar" ? "أعمالنا" : "Our work";
  if (key === "events") return locale === "ar" ? "فعالياتنا" : "Our events";
  return nav[key];
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function SectionTitle({
  children,
  ar,
}: {
  readonly children: React.ReactNode;
  readonly ar: boolean;
}): React.ReactElement {
  return (
    <h3 className="flex items-center gap-3">
      <span
        className={cn(
          "h-px w-8 shrink-0 bg-gradient-to-r from-violet-500/70 to-transparent",
          ar && "bg-gradient-to-l",
        )}
        aria-hidden
      />
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-200/90">
        {children}
      </span>
    </h3>
  );
}

function ContactCard({
  href,
  label,
  value,
  icon,
  accent,
}: {
  readonly href: string;
  readonly label: string;
  readonly value: string;
  readonly icon: React.ReactNode;
  readonly accent: string;
}): React.ReactElement {
  return (
    <a
      href={href}
      className={cn(
        "group flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-white/8 bg-slate-950/50 px-4 py-3 transition",
        "hover:border-white/15 hover:bg-slate-900/70",
        accent,
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/35">
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-start">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </span>
        <span
          dir="ltr"
          className="mt-1 block truncate text-sm font-medium text-slate-100 group-hover:text-white"
          style={{ unicodeBidi: "plaintext" }}
        >
          {value}
        </span>
      </span>
    </a>
  );
}

export function Footer({
  locale,
  footer,
  nav,
  settings,
}: FooterProps): React.ReactElement {
  const ar = locale === "ar";
  const companyName = settings?.companyName?.trim() || "xora";
  const tagline = settings?.tagline?.trim() || (ar ? "تجارب فعاليات لا تُنسى" : "Unforgettable event experiences");
  const email = settings?.email?.trim() || footer.email;
  const phoneRaw = settings?.phone?.trim() || footer.phone;
  const phoneDisplay = formatPhoneDisplay(phoneRaw) || phoneRaw;
  const phoneHref = phoneTelHref(phoneRaw);
  const waHref = whatsappHref(settings?.whatsapp);
  const footerSocial = footer.social as Partial<Record<string, string>> | undefined;
  const socialLinks = getFooterSocialLinks(settings?.social, footerSocial);

  return (
    <footer className="relative mt-20 border-t border-white/8 bg-[#020617]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/45 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_70%_80%_at_50%_0%,rgba(99,102,241,0.12),transparent)]"
        aria-hidden
      />

      <div className={cn(siteContainer, "relative py-12 sm:py-16")}>
        <motion.div
          className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-950/90 to-slate-950/50 shadow-[0_28px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-6%" }}
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
        >
          <div className="grid gap-0 lg:grid-cols-12">
            {/* Brand */}
            <motion.div
              variants={fadeUp}
              className="border-b border-white/8 px-6 py-8 sm:px-8 lg:col-span-4 lg:border-b-0 lg:border-e lg:py-10"
            >
              <Link
                href={localizedPath(locale, "/")}
                scroll={false}
                className="inline-block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500/80"
                aria-label={companyName}
              >
                <SiteLogo
                  logoUrl={settings?.logo}
                  alt={companyName}
                  size="xl"
                />
              </Link>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
                {footer.about}
              </p>
              {tagline ? (
                <p className="mt-3 text-xs font-medium text-violet-300/80">{tagline}</p>
              ) : null}
              <Link
                href={localizedPath(locale, "/contact")}
                scroll={false}
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-5 py-2.5 text-xs font-semibold text-violet-100 transition hover:border-violet-300/50 hover:bg-violet-500/20 hover:text-white"
              >
                {nav.contact}
              </Link>
            </motion.div>

            {/* Quick links */}
            <motion.div
              variants={fadeUp}
              className="border-b border-white/8 px-6 py-8 sm:px-8 lg:col-span-3 lg:border-b-0 lg:border-e lg:py-10"
            >
              <SectionTitle ar={ar}>{footer.quickLinks}</SectionTitle>
              <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                {navLinks.map(({ href, key }) => (
                  <li key={href}>
                    <Link
                      href={localizedPath(locale, href)}
                      scroll={false}
                      className="text-slate-400 transition hover:text-cyan-300"
                    >
                      {footerNavLabel(locale, key, nav)}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact + social */}
            <motion.div variants={fadeUp} className="px-6 py-8 sm:px-8 lg:col-span-5 lg:py-10">
              <SectionTitle ar={ar}>{footer.contactTitle}</SectionTitle>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ContactCard
                  href={`mailto:${email}`}
                  label={ar ? "البريد الإلكتروني" : "Email"}
                  value={email}
                  accent="hover:border-cyan-500/25 hover:bg-cyan-500/5"
                  icon={<MailIcon className="h-[18px] w-[18px] text-cyan-300" />}
                />
                {phoneDisplay ? (
                  <ContactCard
                    href={phoneHref ?? "#"}
                    label={ar ? "الجوال" : "Phone"}
                    value={phoneDisplay}
                    accent="hover:border-violet-500/25 hover:bg-violet-500/5"
                    icon={<PhoneIcon className="h-[18px] w-[18px] text-violet-300" />}
                  />
                ) : null}
              </div>

              <div className="mt-7 border-t border-white/8 pt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {footer.follow}
                </p>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {/* WhatsApp */}
                  <motion.a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={footer.whatsapp ?? (ar ? "واتساب" : "WhatsApp")}
                    title={footer.whatsapp ?? (ar ? "واتساب" : "WhatsApp")}
                    className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 py-3 text-emerald-300 transition-all duration-300 hover:border-emerald-400/60 hover:bg-emerald-500/25 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    whileHover={{ y: -3, scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <WhatsAppIcon className="h-6 w-6" />
                    <span className="text-[9px] font-semibold uppercase tracking-wide opacity-70 group-hover:opacity-100">WA</span>
                  </motion.a>

                  {socialLinks.map(({ key, href, label, active }) => {
                    const colorMap: Record<string, { border: string; bg: string; text: string; hover: string; glow: string; short: string }> = {
                      instagram: {
                        border: "border-pink-500/30",
                        bg: "bg-gradient-to-br from-purple-600/15 via-pink-500/15 to-orange-400/10",
                        text: "text-pink-300",
                        hover: "hover:border-pink-400/60 hover:from-purple-600/30 hover:via-pink-500/30 hover:to-orange-400/20 hover:text-white",
                        glow: "hover:shadow-[0_0_20px_rgba(236,72,153,0.35)]",
                        short: "IG",
                      },
                      x: {
                        border: "border-slate-400/25",
                        bg: "bg-slate-800/40",
                        text: "text-slate-200",
                        hover: "hover:border-white/50 hover:bg-slate-700/70 hover:text-white",
                        glow: "hover:shadow-[0_0_20px_rgba(148,163,184,0.25)]",
                        short: "X",
                      },
                      facebook: {
                        border: "border-blue-500/30",
                        bg: "bg-blue-600/10",
                        text: "text-blue-300",
                        hover: "hover:border-blue-400/60 hover:bg-blue-600/25 hover:text-white",
                        glow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.35)]",
                        short: "FB",
                      },
                      snapchat: {
                        border: "border-yellow-400/30",
                        bg: "bg-yellow-500/10",
                        text: "text-yellow-300",
                        hover: "hover:border-yellow-300/60 hover:bg-yellow-500/25 hover:text-yellow-50",
                        glow: "hover:shadow-[0_0_20px_rgba(250,204,21,0.35)]",
                        short: "SC",
                      },
                    };
                    const c = colorMap[key] ?? {
                      border: "border-white/15", bg: "bg-white/5", text: "text-slate-300",
                      hover: "hover:border-violet-400/50 hover:bg-violet-500/15 hover:text-white",
                      glow: "", short: key.slice(0, 2).toUpperCase(),
                    };
                    const Icon = icons[key];

                    if (!active || !href) {
                      return (
                        <div
                          key={key}
                          className={cn(
                            "flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-3 opacity-30 cursor-default",
                            c.border, c.bg, c.text,
                          )}
                          title={label}
                        >
                          <Icon className="h-6 w-6" />
                          <span className="text-[9px] font-semibold uppercase tracking-wide">{c.short}</span>
                        </div>
                      );
                    }

                    return (
                      <motion.a
                        key={key}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        title={label}
                        className={cn(
                          "group flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-3 transition-all duration-300",
                          c.border, c.bg, c.text, c.hover, c.glow,
                        )}
                        whileHover={{ y: -3, scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-[9px] font-semibold uppercase tracking-wide opacity-70 group-hover:opacity-100">{c.short}</span>
                      </motion.a>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/8 pt-6 text-center text-xs text-slate-500 sm:flex-row sm:text-start">
          <p>
            © {new Date().getFullYear()} {companyName}. {footer.rights}
          </p>
          <p className="text-slate-600">{tagline}</p>
        </div>
      </div>
    </footer>
  );
}
