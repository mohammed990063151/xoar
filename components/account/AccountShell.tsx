"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { pageBottom, siteContainer } from "@/lib/layout";

const TABS = [
  { href: "/account/bookings", key: "bookings" },
  { href: "/account/wishlist", key: "wishlist" },
  { href: "/account/profile", key: "profile" },
] as const;

interface AccountShellProps {
  readonly locale: Locale;
  readonly title: string;
  readonly children: React.ReactNode;
}

export function AccountShell({
  locale,
  title,
  children,
}: AccountShellProps): React.ReactElement {
  const pathname = usePathname();
  const ar = locale === "ar";

  const labels: Record<(typeof TABS)[number]["key"], string> = {
    bookings: ar ? "حجوزاتي" : "My bookings",
    wishlist: ar ? "المفضلة" : "Wishlist",
    profile: ar ? "الملف الشخصي" : "Profile",
  };

  return (
    <div className={cn(siteContainer, pageBottom, "py-10 sm:py-14")}>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
      <nav className="mt-6 flex flex-wrap gap-2 border-b border-white/10 pb-px">
        {TABS.map((tab) => {
          const href = localizedPath(locale, tab.href);
          const active = pathname?.includes(tab.href);
          return (
            <Link
              key={tab.href}
              href={href}
              className={
                active
                  ? "rounded-t-xl border border-b-0 border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-cyan-100"
                  : "px-4 py-2.5 text-sm text-slate-500 transition hover:text-white"
              }
            >
              {labels[tab.key]}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8">{children}</div>
    </div>
  );
}
