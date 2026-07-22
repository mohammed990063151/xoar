"use client";

import { CustomerSpace } from "@/components/account/CustomerSpace";
import type { Locale } from "@/lib/i18n";

interface AccountShellProps {
  readonly locale: Locale;
  readonly title: string;
  readonly children: React.ReactNode;
}

/** @deprecated Prefer CustomerSpace — kept for wishlist pages. */
export function AccountShell({
  locale,
  children,
}: AccountShellProps): React.ReactElement {
  return <CustomerSpace locale={locale}>{children}</CustomerSpace>;
}
