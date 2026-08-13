import { isLocale, localizedPath } from "@/lib/i18n";
import { redirect, notFound } from "next/navigation";

export default async function ActivityBookRedirectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<never> {
  const { locale: loc, slug } = await params;
  if (!isLocale(loc)) notFound();
  redirect(localizedPath(loc, `/activities/${slug}`));
}
