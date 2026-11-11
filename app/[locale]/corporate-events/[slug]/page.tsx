import { isLocale } from "@/lib/i18n";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CorporateEventDetailRedirect({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<never> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  redirect(`/${loc}/corporate-events`);
}
