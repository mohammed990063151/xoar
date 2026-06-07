function formatIcsUtc(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

export function buildActivityIcs(params: {
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end?: Date;
  url?: string;
}): string {
  const end = params.end ?? new Date(params.start.getTime() + 2 * 60 * 60 * 1000);
  const uid = `${Date.now()}@xora.app`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Xora//Activities//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatIcsUtc(new Date())}`,
    `DTSTART:${formatIcsUtc(params.start)}`,
    `DTEND:${formatIcsUtc(end)}`,
    `SUMMARY:${params.title.replace(/\n/g, " ")}`,
  ];
  if (params.description) {
    lines.push(`DESCRIPTION:${params.description.replace(/\n/g, "\\n")}`);
  }
  if (params.location) {
    lines.push(`LOCATION:${params.location.replace(/\n/g, " ")}`);
  }
  if (params.url) {
    lines.push(`URL:${params.url}`);
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadIcsFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
