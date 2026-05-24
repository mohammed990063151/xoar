import { ActivitiesDiscover } from "@/components/activities/ActivitiesDiscover";
import { ActivitiesClient } from "@/components/activities/ActivitiesClient";
import { getSiteContent } from "@/services/contentService";
import { isLocale } from "@/lib/i18n";
import { getActivitiesListingContent } from "@/lib/site-page";
import { serverFetch } from "@/services/api";
import type { Activity } from "@/types/api";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

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
  const activities = res?.data ?? [];

  return (
    <Suspense fallback={<div className="min-h-[50vh]" />}>
      <ActivitiesDiscover locale={loc} page={page} initialActivities={activities} />
  const dict = await getSiteContent(loc);

  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <ActivitiesClient
        dict={dict.pages.activities}
        activityTabs={dict.activityTabs}
        activityCards={dict.activityCards}
        cta={dict.eventsSection.book}
        formTitle={dict.inquiryForm.defaultTitle}
      />
    </Suspense>
  );
}
