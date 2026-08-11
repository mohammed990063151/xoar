"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HeaderAccountLink } from "@/components/layout/HeaderAccountLink";
import { HeaderCta } from "@/components/layout/HeaderCta";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { cn } from "@/lib/cn";
import { siteContainer } from "@/lib/layout";
import { useHeaderPinned } from "@/hooks/useHeaderPinned";
import type { Locale } from "@/lib/i18n";
import { localizedPath, resolveHref } from "@/lib/i18n";
import type { Dictionary } from "@/lib/dictionary";
import type { SiteSettings } from "@/services/contentService";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface HeaderProps {
  readonly locale: Locale;
  readonly nav: Dictionary["nav"];
  readonly settings?: SiteSettings;
}

const navKeys = [
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
] satisfies ReadonlyArray<{ href: string; key: keyof Dictionary["nav"] }>;

/** Fixed split: أعمالنا ≠ فعالياتنا (CMS/cache must not blur them). */
function navLabel(
  locale: Locale,
  key: keyof Dictionary["nav"],
  nav: Dictionary["nav"],
): string {
  if (key === "works") return locale === "ar" ? "أعمالنا" : "Our work";
  if (key === "events") return locale === "ar" ? "فعالياتنا" : "Our events";
  return nav[key];
}

const accountActive = (pathname: string): boolean => pathname.includes("/account");

const prefetchRoutes = process.env.NODE_ENV === "production";

function NavTextLink({
  href,
  pathname,
  children,
  active,
}: {
  readonly href: string;
  readonly pathname: string;
  readonly children: React.ReactNode;
  readonly active: boolean;
}): React.ReactElement {
  const isExactPage = pathname === href;

  return (
    <Link
      href={href}
      prefetch={prefetchRoutes}
      scroll={false}
      onClick={(e) => {
        if (isExactPage) e.preventDefault();
      }}
      className={cn(
        "relative pb-1 text-sm font-medium transition-colors",
        active
          ? "text-[color:var(--text)]"
          : "text-[color:var(--text-muted)] hover:text-[color:var(--text)]",
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
  settings,
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
    return pathname === full || pathname.startsWith(`${full}/`);
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
          open && "mobile-menu-open",
        )}
      >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px animate-header-line opacity-70" />

      <div className={cn(siteContainer, "flex items-center justify-between gap-3 py-3 sm:gap-4 sm:py-3.5")}>
        <Link
          href={localizedPath(locale, "/")}
          className="min-w-0 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500/80"
          aria-label={settings?.companyName?.trim() || "xora"}
        >
          <SiteLogo
            logoUrl={settings?.logo}
            alt={settings?.companyName?.trim() || "xora"}
            size="md"
          />
        </Link>

        <nav className="hidden min-w-0 items-center gap-4 lg:flex xl:gap-6" aria-label="Main">
          {navKeys.map(({ href, key }) => {
            const resolved = resolveHref(locale, href);
            return (
              <NavTextLink
                key={href}
                href={resolved}
                pathname={pathname}
                active={isActive(href)}
              >
                {navLabel(locale, key, nav)}
              </NavTextLink>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <HeaderAccountLink
            locale={locale}
            label={nav.account}
            active={accountActive(pathname)}
          />
          <Link
            href={switchHref}
            className="rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--text-muted)] transition hover:border-purple-400/40 hover:text-[color:var(--text)] sm:px-3 sm:text-xs"
            prefetch={prefetchRoutes}
          >
            {locale === "ar" ? "EN" : "عربي"}
          </Link>
          <ThemeToggle />
          <HeaderCta locale={locale} label={nav.cta} />
          <button
            type="button"
            className="mobile-menu-btn inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span className="flex flex-col gap-1">
              <span
                className={cn(
                  "mobile-menu-bar h-0.5 w-5 bg-[color:var(--text)] transition",
                  open && "translate-y-1.5 rotate-45",
                )}
              />
              <span
                className={cn(
                  "mobile-menu-bar h-0.5 w-5 bg-[color:var(--text)] transition",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "mobile-menu-bar h-0.5 w-5 bg-[color:var(--text)] transition",
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
            className="mobile-nav-panel relative z-50 flex w-full max-h-[min(70dvh,520px)] flex-col items-center overflow-y-auto border-t border-white/10 px-5 py-4 pb-5 sm:px-6 lg:hidden"
            aria-label="Mobile"
          >
            <div className="flex w-full max-w-sm flex-col gap-1.5">
              <HeaderAccountLink
                locale={locale}
                label={nav.account}
                active={accountActive(pathname)}
                compact
              />
              <div className="mobile-nav-divider my-1 h-px w-full bg-white/10" role="separator" aria-hidden />
              {navKeys.map(({ href, key }) => {
                const resolved = resolveHref(locale, href);
                const active = isActive(href);
                const isContact = href === "/contact";
                const isExactPage = pathname === resolved;

                return (
                  <Link
                    key={href}
                    href={resolved}
                    prefetch={prefetchRoutes}
                    scroll={false}
                    onClick={(e) => {
                      if (isExactPage) e.preventDefault();
                      setOpen(false);
                    }}
                    className={cn(
                      "mobile-nav-link flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-center text-base font-semibold transition",
                      active
                        ? "mobile-nav-link--active bg-purple-600 text-white ring-1 ring-purple-400/50"
                        : isContact
                          ? "mobile-nav-link--cta border border-purple-500/40 bg-purple-500/15 text-purple-100 hover:bg-purple-500/25"
                          : "text-slate-100 hover:bg-white/8",
                    )}
                  >
                    {navLabel(locale, key, nav)}
                  </Link>
                );
              })}
            </div>
          </nav>
        </>
      ) : null}
      </header>

      {/* Reserve space for fixed header bar */}
      <div className="h-14 shrink-0 sm:h-[3.625rem]" aria-hidden />
    </>
  );
}
