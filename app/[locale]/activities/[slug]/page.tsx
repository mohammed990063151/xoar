import { ActivityDetailView } from "@/components/activities/ActivityDetailView";
import { normalizeActivityFromApi } from "@/lib/activity";
import { isLocale } from "@/lib/i18n";
import { serverFetch } from "@/services/api";
import type { Activity } from "@/types/api";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc, slug } = await params;
  if (!isLocale(loc)) notFound();

  const [detailRes, listRes] = await Promise.all([
    serverFetch<{ data: Activity }>(`/api/activities/${loc}/${slug}`, {
      revalidate: 15,
    }),
    serverFetch<{ data: Activity[] }>(`/api/activities/${loc}?per_page=6`),
  ]);

  const raw = detailRes?.data;
  if (!raw) {
    // #region agent log
    fetch("http://127.0.0.1:7261/ingest/e7809984-b4f1-47d5-95fe-9c98ade0e8c9", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "1e948e" },
      body: JSON.stringify({
        sessionId: "1e948e",
        runId: "post-fix",
        hypothesisId: "B",
        location: "activities/[slug]/page.tsx",
        message: "activity detail notFound — API returned no data",
        data: { locale: loc, slug, hasDetailRes: Boolean(detailRes) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    notFound();
  }

  const activity = normalizeActivityFromApi(raw);
  const related = (listRes?.data ?? [])
    .map(normalizeActivityFromApi)
    .filter((a) => a.slug !== slug)
    .slice(0, 2);

  return <ActivityDetailView activity={activity} locale={loc} related={related} />;
}
