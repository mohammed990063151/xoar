import type { TicketHighlight } from "@/types/api";
import type { Locale } from "@/lib/i18n";

const ICON_MAP: Record<string, string> = {
  ticket: "🎫",
  food: "🍽",
  transport: "🚌",
  guide: "🧭",
  photo: "📷",
  gift: "🎁",
  time: "⏱",
  group: "👥",
};

interface ActivityProductHighlightsProps {
  readonly locale: Locale;
  readonly items: readonly TicketHighlight[];
}

export function ActivityProductHighlights({
  locale,
  items,
}: ActivityProductHighlightsProps): React.ReactElement | null {
  if (!items.length) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item, index) => {
        const iconKey = item.icon?.trim().toLowerCase() ?? "";
        const emoji = ICON_MAP[iconKey] ?? "✦";

        return (
          <div
            key={`${item.title}-${index}`}
            className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-lg" aria-hidden>
              {emoji}
            </span>
            <div>
              <p className="font-semibold text-white">{item.title}</p>
              {item.description ? (
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{item.description}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
