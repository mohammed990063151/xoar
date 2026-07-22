import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

interface HeaderAccountLinkProps {
  readonly locale: Locale;
  readonly label: string;
  readonly active?: boolean;
  readonly compact?: boolean;
}

function UserIcon(): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4 shrink-0"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.75" />
      <path strokeLinecap="round" d="M5.5 19.5c.9-3 3.6-4.75 6.5-4.75s5.6 1.75 6.5 4.75" />
    </svg>
  );
}

export function HeaderAccountLink({
  locale,
  label,
  active = false,
  compact = false,
}: HeaderAccountLinkProps): React.ReactElement {
  const loginHint = locale === "ar" ? "الدخول إلى حسابك" : "Sign in to your account";

  return (
    <Link
      href={localizedPath(locale, "/account")}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border font-semibold transition",
        compact
          ? "w-full px-4 py-3.5 text-base"
          : "px-2.5 py-2 text-[11px] sm:px-3 sm:text-xs",
        active
          ? "border-cyan-400/50 bg-cyan-500/15 text-white"
          : compact
            ? "border-cyan-400/35 bg-cyan-500/10 text-cyan-50 hover:bg-cyan-500/15"
            : "border-white/15 text-slate-300 hover:border-cyan-400/40 hover:bg-white/5 hover:text-white",
      )}
      aria-label={`${label} — ${loginHint}`}
      title={loginHint}
    >
      <UserIcon />
      <span className={compact ? "inline" : "hidden sm:inline"}>{label}</span>
    </Link>
  );
}
