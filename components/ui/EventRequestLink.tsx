"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";
import { cn } from "@/lib/cn";
interface EventRequestLinkProps {
  readonly locale: Locale;
  readonly label: string;
  readonly variant?: "hero" | "section";
  readonly className?: string;
}

function EventRequestIcon({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      <path d="M12 14v4M10 16h4" strokeLinecap="round" />
    </svg>
  );
}

export function EventRequestLink({
  locale,
  label,
  variant = "section",
  className,
}: EventRequestLinkProps): React.ReactElement {
  const href = localizedPath(locale, "/request-event");

  if (variant === "hero") {
    return (
      <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
        <Link
          href={href}
          className={cn(
            "group inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-6 py-3 text-sm font-semibold text-emerald-50 transition hover:border-emerald-400/50 hover:bg-emerald-500/20 sm:w-auto sm:px-7 sm:py-3.5",
            className,
          )}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600/35" aria-hidden>
            <EventRequestIcon className="h-4 w-4" />
          </span>
          {label}
          <span className="text-lg transition group-hover:translate-x-0.5 rtl:-scale-x-100" aria-hidden>
            →
          </span>
        </Link>
      </motion.span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-100 transition hover:border-emerald-400/50 hover:bg-emerald-500/20",
        className,
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600/35" aria-hidden>
        <EventRequestIcon className="h-4 w-4" />
      </span>
      {label}
      <span className="text-lg rtl:rotate-180" aria-hidden>
        →
      </span>
    </Link>
  );
}
