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
  return pageMetadata("account.profile", loc, `/${loc}/account/profile`);
}

export default function Layout({ children }: { children: React.ReactNode }): React.ReactElement {
  return children;
}
