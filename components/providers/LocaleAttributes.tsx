"use client";

import { useLayoutEffect } from "react";

interface LocaleAttributesProps {
  readonly locale: string;
  readonly children: React.ReactNode;
}

export function LocaleAttributes({
  locale,
  children,
}: LocaleAttributesProps): React.ReactElement {
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return <>{children}</>;
}
