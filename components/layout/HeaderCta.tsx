import Link from "next/link";
import { localizedPath, type Locale } from "@/lib/i18n";

interface HeaderCtaProps {
  readonly locale: Locale;
  readonly label: string;
}

export function HeaderCta({ locale, label }: HeaderCtaProps): React.ReactElement {
  return (
    <Link
      href={localizedPath(locale, "/contact")}
      className="hidden items-center justify-center gap-2 rounded-full border border-purple-500/55 bg-purple-500/5 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(168,85,247,0.15)] transition hover:border-blue-400/50 hover:bg-purple-500/10 lg:inline-flex"
    >
      {label}
    </Link>
  );
}
