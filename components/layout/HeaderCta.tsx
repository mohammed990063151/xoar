"use client";

import { BookButton } from "@/components/ui/BookButton";

interface HeaderCtaProps {
  readonly label: string;
}

export function HeaderCta({ label }: HeaderCtaProps): React.ReactElement {
  return (
    <BookButton
      type="booking"
      source="header"
      className="hidden items-center gap-2 rounded-full border border-purple-500/55 bg-purple-500/5 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(168,85,247,0.15)] transition hover:border-blue-400/50 sm:inline-flex"
    >
      {label}
    </BookButton>
  );
}
