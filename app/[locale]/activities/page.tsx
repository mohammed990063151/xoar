import { ActivitiesClient } from "@/components/activities/ActivitiesClient";
import { getDictionary } from "@/lib/dictionary";
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
  const dict = getDictionary(loc);

  return (
    <Suspense fallback={<div className="min-h-[40vh]" />}>
      <ActivitiesClient
        locale={loc}
        dict={dict.pages.activities}
        activityTabs={dict.activityTabs}
        cta={dict.pages.activities.detailCta}
      />
    </Suspense>
  );
}
