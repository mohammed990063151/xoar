import { ActivitiesDiscover } from "@/components/activities/ActivitiesDiscover";
import { normalizeActivityFromApi } from "@/lib/activity";
import { isLocale } from "@/lib/i18n";
import { getActivitiesListingContent } from "@/lib/site-page";
import { serverFetch } from "@/services/api";
import type { Activity } from "@/types/api";
import { notFound } from "next/navigation";

export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();

  const [page, res] = await Promise.all([
    getActivitiesListingContent(loc),
    serverFetch<{ data: Activity[] }>(`/api/activities/${loc}?per_page=24`),
  ]);
  const activities = (res?.data ?? []).map(normalizeActivityFromApi);

  return (
    <ActivitiesDiscover locale={loc} page={page} initialActivities={activities} />
  );
}
