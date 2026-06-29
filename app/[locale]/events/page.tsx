import { EventsGallery } from "@/components/events/EventsGallery";

import { getSiteContent } from "@/services/contentService";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.ReactElement> {
  const { locale: loc } = await params;
  if (!isLocale(loc)) notFound();
  const dict = await getSiteContent(loc);

  return (
    <EventsGallery
      locale={loc}
      copy={dict.pages.events}
      section={dict.eventsSection}
      events={dict.eventsGallery}
    />
  );
}
