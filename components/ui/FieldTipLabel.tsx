"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/cn";

interface FieldTipLabelProps {
  readonly htmlFor?: string;
  readonly label: string;
  readonly tip: string;
  readonly required?: boolean;
  readonly className?: string;
}

/** Label with an (i) tip — Tamam/Balady-style field guidance for customers. */
export function FieldTipLabel({
  htmlFor,
  label,
  tip,
  required = false,
  className,
}: FieldTipLabelProps): React.ReactElement {
  const tipId = useId();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "event-cfg-field-head mb-1.5 flex items-center justify-between gap-2",
        className,
      )}
    >
      {htmlFor ? (
        <label htmlFor={htmlFor} className="event-cfg-label text-sm font-medium text-slate-200">
          {label}
          {required ? <span className="ms-1 text-emerald-300">*</span> : null}
        </label>
      ) : (
        <span className="event-cfg-label text-sm font-medium text-slate-200">
          {label}
          {required ? <span className="ms-1 text-emerald-300">*</span> : null}
        </span>
      )}
      <div className="relative shrink-0">
        <button
          type="button"
          className="event-cfg-tip-btn inline-flex h-5 w-5 items-center justify-center rounded-full border border-cyan-400/45 bg-cyan-500/15 text-[11px] font-bold leading-none text-cyan-100 transition hover:scale-105 hover:bg-cyan-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          aria-label={tip}
          aria-describedby={open ? tipId : undefined}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          onBlur={() => setOpen(false)}
        >
          i
        </button>
        {open ? (
          <div
            id={tipId}
            role="tooltip"
            className="event-cfg-tip-popover absolute end-0 z-30 mt-2 w-[min(18.5rem,calc(100vw-2.5rem))] rounded-xl border border-cyan-400/30 bg-slate-950/95 px-3.5 py-2.5 text-start text-xs leading-relaxed text-slate-100 shadow-[0_14px_36px_rgba(0,0,0,0.5)] backdrop-blur"
          >
            {tip}
          </div>
        ) : null}
      </div>
    </div>
  );
}
