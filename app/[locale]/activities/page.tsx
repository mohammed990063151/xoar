import { ActivitiesClient } from "@/components/activities/ActivitiesClient";
import { getSiteContent } from "@/services/contentService";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function ActivitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
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
