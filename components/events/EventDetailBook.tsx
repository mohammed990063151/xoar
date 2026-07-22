"use client";

import { BookButton } from "@/components/ui/BookButton";

interface EventDetailBookProps {
  readonly label: string;
  readonly source: string;
  readonly title: string;
}

export function EventDetailBook({
  label,
  source,
  title,
}: EventDetailBookProps): React.ReactElement {
  return (
    <BookButton
      type="service"
      variant="event"
      source={source}
      title={title}
      className="mt-10 inline-flex rounded-full bg-gradient-to-l from-violet-600 to-cyan-500 px-8 py-3 font-semibold text-white"
    >
      {label}
    </BookButton>
  );
}
