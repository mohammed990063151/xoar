"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";
import { XoraLogo } from "@/components/brand/XoraLogo";

interface HeaderProps {
  readonly locale: Locale;
  readonly nav: Dictionary["nav"];
}

const navKeys = [
  { href: "/", key: "home" as const },
  { href: "/about", key: "about" as const },
  { href: "/services", key: "services" as const },
  { href: "/events", key: "events" as const },
  { href: "/activities", key: "activities" as const },
] satisfies ReadonlyArray<{ href: string; key: keyof Dictionary["nav"] }>;

function ArrowOutIcon({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6 3h7v7M13 3L3 13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavTextLink({
  href,
  children,
  active,
}: {
  readonly href: string;
  readonly children: React.ReactNode;
  readonly active: boolean;
}): React.ReactElement {
  return (
    <Link
      href={href}
      className={cn(
        "relative pb-1 text-sm font-medium transition-colors",
        active ? "text-white" : "text-slate-400 hover:text-white",
      )}
    >
      {children}
      <span
        className={cn(
          "absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-opacity",
          active ? "opacity-100" : "opacity-0 hover:opacity-60",
        )}
        aria-hidden
      />
    </Link>
  );
}

export function Header({
  locale,
  nav,
}: HeaderProps): React.ReactElement {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px animate-header-line opacity-70" />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <Link
          href={localizedPath(locale, "/")}
          className="shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500/80"
          aria-label="xora"
        >
          <XoraLogo size="md" />
        </Link>

        <nav className="hidden items-center gap-5 xl:gap-7 lg:flex">
          {navKeys.map(({ href, key }) => (
            <NavTextLink
              key={href}
              href={localizedPath(locale, href)}
              active={isActive(href)}
            >
              {nav[key]}
            </NavTextLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={switchHref}
            className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300 transition hover:border-purple-400/40 hover:text-white sm:px-3 sm:text-xs"
            prefetch
          >
            {locale === "ar" ? "EN" : "عربي"}
          </Link>
          <Link
            href={localizedPath(locale, "/contact")}
            className="hidden items-center gap-2 rounded-full border border-purple-500/55 bg-purple-500/5 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(168,85,247,0.15)] transition hover:border-blue-400/50 hover:shadow-[0_0_28px_rgba(59,130,246,0.2)] sm:inline-flex"
          >
            {nav.cta}
            <ArrowOutIcon className="text-purple-300 rtl:rotate-180" />
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
                className={cn("h-0.5 w-5 bg-white transition", open && "opacity-0")}
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

      {open ? (
        <div className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 lg:hidden">
          {navKeys.map(({ href, key }) => (
            <Link
              key={href}
              href={localizedPath(locale, href)}
              className="rounded-xl px-2 py-2.5 text-slate-100"
              onClick={() => setOpen(false)}
            >
              {nav[key]}
            </Link>
          ))}
          <Link
            href={localizedPath(locale, "/contact")}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-full border border-purple-500/50 px-4 py-2.5 text-sm font-semibold text-white"
            onClick={() => setOpen(false)}
          >
            {nav.cta}
            <ArrowOutIcon className="text-purple-300 rtl:rotate-180" />
          </Link>
        </div>
      ) : null}
    </header>
  );
}
