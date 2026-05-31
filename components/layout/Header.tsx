"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HeaderCta } from "@/components/layout/HeaderCta";
import { XoraLogo } from "@/components/brand/XoraLogo";
import { cn } from "@/lib/cn";
import { siteContainer } from "@/lib/layout";
import { useHeaderPinned } from "@/hooks/useHeaderPinned";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";

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
  { href: "/contact", key: "contact" as const },
] satisfies ReadonlyArray<{ href: string; key: keyof Dictionary["nav"] }>;

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
  const { pinned, scrolled } = useHeaderPinned(open);

  const switchLocale: Locale = locale === "ar" ? "en" : "ar";
  const switchHref =
    pathname.replace(/^\/(ar|en)(?=\/|$)/, `/${switchLocale}`) ||
    `/${switchLocale}`;

  const isActive = (href: string): boolean => {
    const full = localizedPath(locale, href);
    if (href === "/") return pathname === full;
    return pathname.startsWith(full);
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-white/10 glass transition-[transform,box-shadow] duration-300 ease-out will-change-transform",
          scrolled && "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
          !pinned && "-translate-y-full pointer-events-none",
        )}
      >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px animate-header-line opacity-70" />

      <div className={cn(siteContainer, "flex items-center justify-between gap-3 py-3 sm:gap-4 sm:py-3.5")}>
        <Link
          href={localizedPath(locale, "/")}
          className="min-w-0 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500/80"
          aria-label="xora"
        >
          <XoraLogo size="md" />
        </Link>

        <nav className="hidden min-w-0 items-center gap-4 lg:flex xl:gap-6" aria-label="Main">
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

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href={switchHref}
            className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300 transition hover:border-purple-400/40 hover:text-white sm:px-3 sm:text-xs"
            prefetch
          >
            {locale === "ar" ? "EN" : "عربي"}
          </Link>
          <HeaderCta locale={locale} label={nav.cta} />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
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
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <nav
            className={cn(
              siteContainer,
              "relative z-50 flex max-h-[min(70dvh,520px)] flex-col gap-1 overflow-y-auto border-t border-white/10 py-3 pb-5 lg:hidden",
            )}
            aria-label="Mobile"
          >
            {navKeys.map(({ href, key }) => {
              const active = isActive(href);
              const isContact = href === "/contact";

              return (
                <Link
                  key={href}
                  href={localizedPath(locale, href)}
                  className={cn(
                    "block w-full rounded-xl px-4 py-3.5 text-base font-medium transition",
                    active
                      ? "bg-purple-500/15 text-white ring-1 ring-purple-400/40"
                      : isContact
                        ? "border border-purple-500/35 bg-purple-500/10 text-purple-100 hover:bg-purple-500/15"
                        : "text-slate-100 hover:bg-white/5",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {nav[key]}
                </Link>
              );
            })}
          </nav>
        </>
      ) : null}
      </header>

      {/* Reserve space for fixed header bar */}
      <div className="h-14 shrink-0 sm:h-[3.625rem]" aria-hidden />
    </>
  );
}
