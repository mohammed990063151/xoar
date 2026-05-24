"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n";

interface LocaleAttributesProps {
  readonly locale: Locale;
  readonly children: React.ReactNode;
}

export function LocaleAttributes({
  locale,
  children,
}: LocaleAttributesProps): React.ReactElement {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return <>{children}</>;
}
