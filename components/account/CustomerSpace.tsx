"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { customerCache } from "@/lib/customer-cache";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { pageBottom, siteContainer } from "@/lib/layout";
import { customerService, getCustomerToken } from "@/services/customerService";
import type { Customer } from "@/types/customer";

const DESTINATIONS = [
  { href: "/account", key: "home", exact: true },
  { href: "/account/bookings", key: "bookings" },
  { href: "/account/group-bookings", key: "groups" },
  { href: "/account/wallet", key: "wallet" },
  { href: "/account/referrals", key: "referrals" },
  { href: "/account/notifications", key: "notifications" },
  { href: "/account/inquiries", key: "inquiries" },
  { href: "/account/profile", key: "profile" },
] as const;

interface CustomerSpaceProps {
  readonly locale: Locale;
  readonly children: React.ReactNode;
  readonly requireAuth?: boolean;
  /** Shorter header for focused pages like bookings */
  readonly compact?: boolean;
  readonly title?: string;
  readonly subtitle?: string;
}

export function CustomerSpace({
  locale,
  children,
  requireAuth = true,
  compact = false,
  title,
  subtitle,
}: CustomerSpaceProps): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const ar = locale === "ar";
  /** Auth/token checks run only after mount to avoid SSR/client HTML mismatch. */
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [ready, setReady] = useState(!requireAuth);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [, startTransition] = useTransition();

  const labels: Record<(typeof DESTINATIONS)[number]["key"], string> = {
    home: ar ? "مساحتي" : "My space",
    bookings: ar ? "حجوزاتي" : "Bookings",
    groups: ar ? "مجموعات" : "Groups",
    wallet: ar ? "محفظتي" : "Wallet",
    referrals: ar ? "إحالات" : "Referrals",
    notifications: ar ? "إشعارات" : "Alerts",
    inquiries: ar ? "استفسارات" : "Inquiries",
    profile: ar ? "حسابي" : "Profile",
  };

  useEffect(() => {
    if (!requireAuth) {
      setReady(true);
      return;
    }

    const cached = customerCache.getMe();
    if (cached) {
      setCustomer(cached);
    }

    if (!getCustomerToken()) {
      setNeedsLogin(true);
      setReady(true);
      router.replace(
        `${localizedPath(locale, "/account/login")}?returnTo=${encodeURIComponent(pathname || localizedPath(locale, "/account"))}`,
      );
      return;
    }

    setReady(true);

    void customerService.me().then((profile) => {
      if (!profile) {
        router.replace(localizedPath(locale, "/account/login"));
        return;
      }
      startTransition(() => setCustomer(profile));
    });
  }, [locale, pathname, requireAuth, router]);

  function logout(): void {
    customerService.logout();
    router.replace(localizedPath(locale, "/account/login"));
  }

  if (requireAuth && needsLogin && !customer) {
    return (
      <div className={cn(siteContainer, pageBottom, "flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center")}>
        <p className="text-slate-400">
          {ar ? "جاري تحويلك لتسجيل الدخول…" : "Redirecting you to sign in…"}
        </p>
        <Link
          href={`${localizedPath(locale, "/account/login")}?returnTo=${encodeURIComponent(pathname || localizedPath(locale, "/account"))}`}
          className="rounded-full bg-gradient-to-l from-cyan-500 to-teal-400 px-5 py-2.5 text-sm font-bold text-slate-950"
        >
          {ar ? "تسجيل الدخول" : "Sign in"}
        </Link>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className={cn(siteContainer, pageBottom, "flex min-h-[40vh] items-center justify-center")}>
        <div className="h-8 w-8 animate-pulse rounded-full bg-cyan-400/25" />
      </div>
    );
  }

  const firstName = customer?.name?.split(" ")[0];
  const heading =
    title ??
    (firstName
      ? ar
        ? `أهلاً، ${firstName}`
        : `Hi, ${firstName}`
      : ar
        ? "مساحتي"
        : "My space");
  const lead =
    subtitle ??
    (ar
      ? "تجاربك وتذاكرك في مكان هادئ — بلا قوائم جانبية."
      : "Your experiences and tickets in one calm place.");

  return (
    <div className="relative min-h-[70vh] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_42%_at_50%_-8%,rgba(34,211,238,0.15),transparent),radial-gradient(ellipse_45%_35%_at_100%_20%,rgba(251,191,36,0.07),transparent),radial-gradient(ellipse_40%_30%_at_0%_85%,rgba(16,185,129,0.1),transparent)]"
        aria-hidden
      />

      <div className={cn(siteContainer, pageBottom, compact ? "pt-6 sm:pt-8" : "pt-8 sm:pt-12")}>
        <header className={cn(compact ? "mb-5 sm:mb-6" : "mb-8 sm:mb-10")}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300/90">
            Xoar
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1
                className={cn(
                  "font-bold tracking-tight text-white",
                  compact
                    ? "text-[clamp(1.45rem,4vw,2.1rem)]"
                    : "text-[clamp(1.75rem,5vw,2.75rem)]",
                )}
              >
                {heading}
              </h1>
              {!compact ? <p className="mt-2 max-w-xl text-sm text-slate-400">{lead}</p> : null}
            </div>
            {customer ? (
              <button
                type="button"
                onClick={logout}
                className="rounded-full border border-white/15 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-rose-400/40 hover:text-rose-200"
              >
                {ar ? "خروج" : "Sign out"}
              </button>
            ) : null}
          </div>
        </header>

        <nav
          className="mb-8 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mb-10"
          aria-label={ar ? "أقسام الحساب" : "Account sections"}
        >
          {DESTINATIONS.map((dest) => {
            const href = localizedPath(locale, dest.href);
            const active =
              "exact" in dest && dest.exact
                ? pathname === href || pathname === `${href}/`
                : Boolean(pathname?.includes(dest.href) && dest.href !== "/account");
            return (
              <Link
                key={dest.key}
                href={href}
                prefetch
                className={cn(
                  "inline-flex whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition",
                  active
                    ? "bg-gradient-to-l from-cyan-500 to-teal-400 text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.25)]"
                    : "border border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-400/30 hover:text-white",
                )}
              >
                {labels[dest.key]}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </div>
  );
}
