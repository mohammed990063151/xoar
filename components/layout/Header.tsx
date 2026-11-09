"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
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

type NavKey = "home" | "about" | "services" | "activities" | "events" | "partners";

const navKeys = [
  { href: "/", key: "home" as const },
  { href: "/about", key: "about" as const },
  { href: "/services", key: "services" as const, dropdown: true },
  { href: "/activities", key: "activities" as const },
  { href: "/events", key: "events" as const },
  { href: "/partners", key: "partners" as const },
] satisfies ReadonlyArray<{ href: string; key: NavKey; dropdown?: boolean }>;

const servicesChildren = [
  { href: "/individual-events", key: "individualEvents" as const },
  { href: "/corporate-events", key: "corporateEvents" as const },
  { href: "/equipment", key: "equipment" as const },
] as const;

function navLabel(locale: Locale, key: NavKey, nav: Dictionary["nav"]): string {
  if (key === "events") return locale === "ar" ? "فعالياتنا" : "Our events";
  return nav[key];
}

function servicesChildLabel(
  key: (typeof servicesChildren)[number]["key"],
  nav: Dictionary["nav"],
): string {
  return nav.servicesMenu[key];
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
        "relative inline-flex h-9 items-center whitespace-nowrap pb-0.5 text-sm font-medium transition-colors",
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
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const servicesActive =
    isActive("/services") ||
    servicesChildren.some((child) => isActive(child.href));

  function openServices(): void {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setServicesOpen(true);
  }

  function scheduleCloseServices(): void {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setServicesOpen(false), 120);
  }

  useEffect(() => {
    setOpen(false);
    setServicesOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!servicesOpen) return;
    function onPointerDown(event: MouseEvent): void {
      if (!servicesRef.current?.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    }
    function onKey(event: KeyboardEvent): void {
      if (event.key === "Escape") setServicesOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [servicesOpen]);

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

        <div
          className={cn(
            siteContainer,
            "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 py-3 sm:gap-x-4 sm:py-3.5 lg:gap-x-6",
          )}
        >
          <Link
            href={localizedPath(locale, "/")}
            className="min-w-0 shrink-0 justify-self-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500/80"
            aria-label={settings?.companyName?.trim() || "xora"}
          >
            <SiteLogo
              logoUrl={settings?.logo}
              alt={settings?.companyName?.trim() || "xora"}
              size="md"
            />
          </Link>

          <nav
            className="hidden min-w-0 items-center justify-center gap-4 xl:gap-6 2xl:gap-7 lg:flex"
            aria-label="Main"
          >
            {navKeys.map(({ href, key, dropdown }) => {
              if (dropdown) {
                return (
                  <div
                    key={href}
                    ref={servicesRef}
                    className="relative"
                    onMouseEnter={openServices}
                    onMouseLeave={scheduleCloseServices}
                  >
                    <button
                      type="button"
                      className={cn(
                        "relative inline-flex h-9 items-center gap-1.5 whitespace-nowrap pb-0.5 text-sm font-medium transition-colors",
                        servicesActive || servicesOpen
                          ? "text-[color:var(--text)]"
                          : "text-[color:var(--text-muted)] hover:text-[color:var(--text)]",
                      )}
                      aria-expanded={servicesOpen}
                      aria-controls={menuId}
                      aria-haspopup="menu"
                      onClick={() => setServicesOpen((v) => !v)}
                    >
                      {navLabel(locale, key, nav)}
                      <span
                        className={cn("text-[10px] leading-none transition-transform", servicesOpen && "rotate-180")}
                        aria-hidden
                      >
                        ▾
                      </span>
                      <span
                        className={cn(
                          "absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-opacity",
                          servicesActive || servicesOpen ? "opacity-100" : "opacity-0",
                        )}
                        aria-hidden
                      />
                    </button>

                    <div
                      id={menuId}
                      role="menu"
                      hidden={!servicesOpen}
                      className="absolute top-full start-1/2 z-[60] w-max -translate-x-1/2 pt-3 rtl:translate-x-1/2"
                    >
                      <div className="min-w-[16rem] overflow-hidden rounded-2xl border border-white/12 bg-slate-950/98 p-2 shadow-[0_20px_55px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                        {servicesChildren.map((child) => {
                          const resolved = resolveHref(locale, child.href);
                          return (
                            <Link
                              key={child.href}
                              href={resolved}
                              role="menuitem"
                              prefetch={prefetchRoutes}
                              className={cn(
                                "block rounded-xl px-3.5 py-2.5 text-sm transition",
                                isActive(child.href)
                                  ? "bg-purple-600/30 text-white"
                                  : "text-slate-200 hover:bg-white/8 hover:text-white",
                              )}
                              onClick={() => setServicesOpen(false)}
                            >
                              {servicesChildLabel(child.key, nav)}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

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

          <div className="flex shrink-0 items-center justify-self-end gap-1.5 sm:gap-2.5">
            <HeaderAccountLink
              locale={locale}
              label={nav.account}
              active={accountActive(pathname)}
            />
            <Link
              href={switchHref}
              className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-white/15 px-2.5 text-[11px] font-semibold uppercase tracking-wide text-[color:var(--text-muted)] transition hover:border-purple-400/40 hover:text-[color:var(--text)] sm:px-3 sm:text-xs"
              prefetch={prefetchRoutes}
            >
              {locale === "ar" ? "EN" : "عربي"}
            </Link>
            <ThemeToggle />
            <HeaderCta locale={locale} label={nav.cta} />
            <button
              type="button"
              className="mobile-menu-btn inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 lg:hidden"
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
                {navKeys.map(({ href, key, dropdown }) => {
                  if (dropdown) {
                    return (
                      <div key={href} className="w-full">
                        <button
                          type="button"
                          className={cn(
                            "mobile-nav-link flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold transition",
                            servicesActive
                              ? "mobile-nav-link--active bg-purple-600 text-white ring-1 ring-purple-400/50"
                              : "text-slate-100 hover:bg-white/8",
                          )}
                          aria-expanded={mobileServicesOpen}
                          onClick={() => setMobileServicesOpen((v) => !v)}
                        >
                          <span>{navLabel(locale, key, nav)}</span>
                          <span aria-hidden>{mobileServicesOpen ? "▴" : "▾"}</span>
                        </button>
                        {mobileServicesOpen ? (
                          <div className="mt-1 space-y-1 rounded-xl border border-white/10 bg-black/25 p-2">
                            {servicesChildren.map((child) => (
                              <Link
                                key={child.href}
                                href={resolveHref(locale, child.href)}
                                prefetch={prefetchRoutes}
                                onClick={() => setOpen(false)}
                                className={cn(
                                  "block rounded-lg px-3 py-2.5 text-sm font-medium",
                                  isActive(child.href) ? "bg-purple-600/30 text-white" : "text-slate-200",
                                )}
                              >
                                {servicesChildLabel(child.key, nav)}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  }

                  const resolved = resolveHref(locale, href);
                  const active = isActive(href);
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

      <div className="h-14 shrink-0 sm:h-[3.625rem]" aria-hidden />
    </>
  );
}
