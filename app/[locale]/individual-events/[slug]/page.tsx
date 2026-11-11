import { isLocale } from "@/lib/i18n";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function IndividualEventDetailRedirect({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<never> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  redirect(`/${loc}/individual-events`);
}
