import type { Metadata } from "next";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo-service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}): Promise<Metadata> {
  const { locale: loc, code } = await params;
  if (!isLocale(loc)) return {};
  return pageMetadata("group", loc, `/${loc}/group/${code}`);
}

export default function GroupJoinLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return children;
}
