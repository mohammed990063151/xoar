"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n";

const InquiryFab = dynamic(
  () => import("@/components/ui/InquiryFab").then((m) => ({ default: m.InquiryFab })),
  { ssr: false, loading: () => null },
);

const LiveVisitorBeacon = dynamic(
  () =>
    import("@/components/analytics/LiveVisitorBeacon").then((m) => ({
      default: m.LiveVisitorBeacon,
    })),
  { ssr: false, loading: () => null },
);

interface DeferredClientWidgetsProps {
  readonly locale: Locale;
  readonly inquiryFab: {
    readonly label: string;
    readonly aria: string;
    readonly whatsappAria: string;
  };
  readonly whatsapp?: string;
}

export function DeferredClientWidgets({
  locale,
  inquiryFab,
  whatsapp,
}: DeferredClientWidgetsProps): React.ReactElement {
  return (
    <>
      <InquiryFab
        locale={locale}
        whatsappAria={inquiryFab.whatsappAria}
        whatsapp={whatsapp}
      />
      <LiveVisitorBeacon />
    </>
  );
}
