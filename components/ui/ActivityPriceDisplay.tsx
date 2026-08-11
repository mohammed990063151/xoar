import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { extractPriceAmount, formatSarPrice } from "@/lib/format-price";

interface ActivityPriceDisplayProps {
  readonly locale: Locale;
  readonly price?: string | null;
  readonly comparePrice?: string | null;
  readonly showCompare?: boolean;
  readonly perPerson?: boolean;
  readonly size?: "sm" | "md";
  readonly className?: string;
}

export function shouldShowComparePrice(
  price?: string | null,
  comparePrice?: string | null,
): boolean {
  const current = Number.parseFloat(extractPriceAmount(price));
  const compare = Number.parseFloat(extractPriceAmount(comparePrice));

  return compare > 0 && current > 0 && compare > current;
}

export function ActivityPriceDisplay({
  locale,
  price,
  comparePrice,
  showCompare = true,
  perPerson = true,
  size = "md",
  className,
}: ActivityPriceDisplayProps): React.ReactElement | null {
  const hasPrice = Boolean(price?.trim());
  const showComparePrice =
    showCompare && shouldShowComparePrice(price, comparePrice);

  if (!hasPrice && !showComparePrice) {
    return null;
  }

  const ar = locale === "ar";
  const priceClass = size === "sm" ? "text-sm font-bold" : "text-xl font-extrabold";
  const compareClass = size === "sm" ? "text-[11px]" : "text-sm";

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <div className="flex flex-wrap items-baseline gap-2">
        {showComparePrice ? (
          <span className={cn(compareClass, "text-slate-500 line-through decoration-slate-500/80")}>
            {formatSarPrice(comparePrice, locale)}
          </span>
        ) : null}
        {hasPrice ? (
          <span className={cn(priceClass, "tracking-tight text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>
            {formatSarPrice(price, locale)}
          </span>
        ) : null}
      </div>
      {perPerson && hasPrice ? (
        <p className="text-[9px] text-slate-500">{ar ? "للشخص" : "per person"}</p>
      ) : null}
    </div>
  );
}
