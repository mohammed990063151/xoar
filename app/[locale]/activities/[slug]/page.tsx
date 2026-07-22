import type { Metadata } from "next";
import { ActivityDetailView } from "@/components/activities/ActivityDetailView";
import { normalizeActivityFromApi } from "@/lib/activity";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo-service";
import { serverFetch } from "@/services/api";
import type { PlatformFeature } from "@/services/featureService";
import type { Activity } from "@/types/api";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: loc, slug } = await params;
  if (!isLocale(loc)) return {};
  const detailRes = await serverFetch<{ data: Activity }>(
    `/api/activities/${loc}/${slug}`,
    { revalidate: 15 },
  );
  const raw = detailRes?.data;
  if (!raw) return {};
  const activity = normalizeActivityFromApi(raw);
  return pageMetadata("activities.detail", loc, `/${loc}/activities/${slug}`, {
    title: activity.title,
    description: activity.description,
  });
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc, slug } = await params;
  if (!isLocale(loc)) notFound();

  const [detailRes, listRes, featuresRes] = await Promise.all([
    serverFetch<{ data: Activity }>(`/api/activities/${loc}/${slug}`, {
      revalidate: 15,
    }),
    serverFetch<{ data: Activity[] }>(`/api/activities/${loc}?per_page=3`),
    serverFetch<{ data: PlatformFeature[] }>(`/api/site/${loc}/features`, {
      revalidate: 300,
    }),
  ]);

  const raw = detailRes?.data;
  if (!raw) notFound();

  const activity = normalizeActivityFromApi(raw);
  const related = (listRes?.data ?? [])
    .map(normalizeActivityFromApi)
    .filter((a) => a.slug !== slug)
    .slice(0, 2);

  return (
    <ActivityDetailView
      activity={activity}
      locale={loc}
      related={related}
      initialFeatures={featuresRes?.data}
    />
  );
}
