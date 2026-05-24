import { cn } from "@/lib/cn";

interface BookingStepperProps {
  readonly labels: readonly string[];
  readonly current: number;
}

export function BookingStepper({
  labels,
  current,
}: BookingStepperProps): React.ReactElement {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      {labels.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex items-center gap-2">
            {index > 0 ? (
              <span
                className={cn(
                  "hidden h-px w-6 sm:block sm:w-10",
                  done ? "bg-cyan-400/60" : "bg-white/10",
                )}
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium sm:text-sm",
                active && "border-cyan-400/50 bg-cyan-500/15 text-cyan-100",
                done && !active && "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
                !done && !active && "border-white/10 bg-white/5 text-slate-500",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                  active && "bg-cyan-500 text-white",
                  done && !active && "bg-emerald-500 text-white",
                  !done && !active && "bg-slate-700 text-slate-400",
                )}
              >
                {done && !active ? "✓" : index + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
