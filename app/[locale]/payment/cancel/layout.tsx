import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo-service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) return {};
  return pageMetadata("payment.cancel", loc, `/${loc}/payment/cancel`);
}

export default function PaymentCancelLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode {
  return children;
}
