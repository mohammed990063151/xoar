import { EventRequestPageView } from "@/components/events/EventRequestPageView";
import { getDictionary } from "@/lib/dictionary";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function RequestEventPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const dict = getDictionary(loc);

  return <EventRequestPageView locale={loc} copy={dict.pages.requestEvent} />;
}
