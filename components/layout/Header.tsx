"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";

interface HeaderProps {
  readonly locale: Locale;
  readonly nav: Dictionary["nav"];
  readonly activityTabs: Dictionary["activityTabs"];
}

const navKeys = [
  { href: "/", key: "home" as const },
  { href: "/about", key: "about" as const },
  { href: "/services", key: "services" as const },
  { href: "/events", key: "events" as const },
  { href: "/activities", key: "activities" as const },
  { href: "/contact", key: "contact" as const },
] satisfies ReadonlyArray<{ href: string; key: keyof Dictionary["nav"] }>;

export function Header({
  locale,
  nav,
  activityTabs,
}: HeaderProps): React.ReactElement {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  const switchLocale: Locale = locale === "ar" ? "en" : "ar";
  const switchHref =
    pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${switchLocale}`) ||
    `/${switchLocale}`;

  const isActive = (href: string): boolean => {
    const full = localizedPath(locale, href);
    if (href === "/") return pathname === full;
    return pathname.startsWith(full);
  };

  return (
    <header className="relative sticky top-0 z-50 border-b border-white/10 glass">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px animate-header-line opacity-60" />
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={localizedPath(locale, "/")}
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="gradient-text text-xl sm:text-2xl">Xora</span>
            <span className="hidden text-xs text-slate-400 sm:inline">
              Events
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navKeys.map(({ href, key }) => (
              <Link
                key={href}
                href={localizedPath(locale, href)}
                className={cn(
                  "rounded-full px-3 py-2 text-sm transition-colors",
                  isActive(href)
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white",
                )}
              >
                {nav[key]}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={switchHref}
              className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-slate-200 transition hover:border-cyan-400/50 hover:text-cyan-200"
              prefetch
            >
              {locale === "ar" ? "EN" : "عربي"}
            </Link>
            <Link
              href={localizedPath(locale, "/contact")}
              className="hidden rounded-full bg-gradient-to-l from-violet-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 sm:inline-flex"
            >
              {nav.cta}
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 lg:hidden"
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">Menu</span>
              <span className="flex flex-col gap-1">
                <span
                  className={cn(
                    "h-0.5 w-5 bg-white transition",
                    open && "translate-y-1.5 rotate-45",
                  )}
                />
                <span
                  className={cn(
                    "h-0.5 w-5 bg-white transition",
                    open && "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "h-0.5 w-5 bg-white transition",
                    open && "-translate-y-1.5 -rotate-45",
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        <div className="relative hidden border-t border-white/5 pt-3 lg:block">
          <div className="flex items-center justify-center gap-2">
            {activityTabs.map((tab) => {
              const activeGlow = hoveredTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={`${localizedPath(locale, "/activities")}?focus=${tab.id}`}
                  onMouseEnter={() => setHoveredTab(tab.id)}
                  onMouseLeave={() => setHoveredTab(null)}
                  className="relative"
                >
                  <motion.span
                    layout
                    className={cn(
                      "flex min-w-[7.5rem] items-center justify-center rounded-2xl border px-3 py-2 text-xs font-medium transition-colors sm:text-sm",
                      activeGlow
                        ? "border-transparent text-white"
                        : "border-white/10 text-slate-300 hover:text-white",
                    )}
                    animate={{
                      boxShadow: activeGlow
                        ? "0 0 28px rgba(168,85,247,0.55), 0 0 48px rgba(34,211,238,0.25)"
                        : "0 0 0 rgba(0,0,0,0)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 26 }}
                  >
                    {activeGlow ? (
                      <motion.span
                        layoutId="tabGlow"
                        className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-l from-violet-600/40 to-cyan-500/30"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    ) : null}
                    <span className="relative z-10">{tab.label}</span>
                  </motion.span>
                </Link>
              );
            })}
          </div>
        </div>

        {open ? (
          <div className="flex flex-col gap-2 border-t border-white/10 pb-2 lg:hidden">
            {navKeys.map(({ href, key }) => (
              <Link
                key={href}
                href={localizedPath(locale, href)}
                className="rounded-xl px-2 py-2 text-slate-100"
                onClick={() => setOpen(false)}
              >
                {nav[key]}
              </Link>
            ))}
            <div className="flex flex-wrap gap-2 pt-2">
              {activityTabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={`${localizedPath(locale, "/activities")}?focus=${tab.id}`}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-slate-200"
                  onClick={() => setOpen(false)}
                >
                  {tab.short}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
