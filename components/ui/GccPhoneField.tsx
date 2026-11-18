"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import {
  GCC_DIAL_CODES,
  splitGccPhone,
  toAsciiDigits,
  type GccDialCode,
} from "@/lib/phone";

export function gccFlagSrc(iso: string): string {
  return `/flags/${iso.toLowerCase()}.png`;
}

interface GccPhoneFieldProps {
  readonly locale: Locale;
  readonly dialCode: GccDialCode;
  readonly national: string;
  readonly onDialChange: (dial: GccDialCode) => void;
  readonly onNationalChange: (national: string) => void;
  readonly label: string;
  readonly countryLabel: string;
  readonly placeholder?: string;
  readonly invalid?: boolean;
  readonly invalidMessage?: string;
  readonly fieldClassName?: string;
  readonly required?: boolean;
  readonly id?: string;
  readonly name?: string;
}

export function GccPhoneField({
  locale,
  dialCode,
  national,
  onDialChange,
  onNationalChange,
  label,
  countryLabel,
  placeholder = "5xxxxxxxx",
  invalid = false,
  invalidMessage,
  fieldClassName,
  required = true,
  id,
  name = "phone",
}: GccPhoneFieldProps): React.ReactElement {
  const ar = locale === "ar";
  const reactId = useId();
  const phoneId = id ?? `gcc-phone-${reactId}`;
  const listId = `${phoneId}-countries`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selected =
    GCC_DIAL_CODES.find((c) => c.dial === dialCode) ?? GCC_DIAL_CODES[0];

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent): void {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleNationalChange(raw: string): void {
    const digits = toAsciiDigits(raw);
    if (
      raw.includes("+") ||
      digits.startsWith("00") ||
      digits.startsWith("0") ||
      digits.length > 9
    ) {
      const split = splitGccPhone(raw);
      onDialChange(split.dial);
      onNationalChange(split.national.replace(/^0+/, "").slice(0, 9));
      return;
    }
    onNationalChange(digits.slice(0, 9));
  }

  return (
    <div className="block text-sm" ref={rootRef}>
      <span className="block text-slate-200">{label}</span>
      <div className="mt-1.5 flex gap-2" dir="ltr">
        <div className="relative shrink-0">
          <button
            type="button"
            id={`${phoneId}-country`}
            aria-label={countryLabel}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen((v) => !v)}
            className={cn(
              fieldClassName,
              "mt-0 flex w-[11.5rem] items-center gap-2 px-2.5 py-3 text-start sm:w-[12.5rem]",
            )}
          >
            <img
              src={gccFlagSrc(selected.iso)}
              alt=""
              width={22}
              height={16}
              className="h-4 w-[22px] shrink-0 rounded-[2px] object-cover ring-1 ring-white/20"
            />
            <span className="min-w-0 flex-1 truncate text-start">
              <span className="block truncate text-[11px] leading-tight text-slate-300">
                {ar ? selected.labelAr : selected.labelEn}
              </span>
              <span className="block text-sm font-semibold leading-tight text-white">
                +{selected.dial}
              </span>
            </span>
            <span className="text-[10px] text-slate-400" aria-hidden>
              ▾
            </span>
          </button>

          {open ? (
            <ul
              id={listId}
              role="listbox"
              aria-label={countryLabel}
              className="absolute start-0 z-40 mt-1 max-h-64 w-[16rem] overflow-auto rounded-xl border border-white/12 bg-slate-950 py-1 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
            >
              {GCC_DIAL_CODES.map((c) => {
                const active = c.dial === dialCode;
                const name = ar ? c.labelAr : c.labelEn;
                return (
                  <li key={c.dial} role="option" aria-selected={active}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-start text-sm transition",
                        active
                          ? "bg-emerald-500/15 text-white"
                          : "text-slate-200 hover:bg-white/6",
                      )}
                      onClick={() => {
                        onDialChange(c.dial);
                        setOpen(false);
                      }}
                    >
                      <img
                        src={gccFlagSrc(c.iso)}
                        alt=""
                        width={24}
                        height={18}
                        className="h-[18px] w-6 shrink-0 rounded-[2px] object-cover ring-1 ring-white/15"
                      />
                      <span className="min-w-0 flex-1 truncate font-medium">{name}</span>
                      <span className="shrink-0 text-slate-400" dir="ltr">
                        +{c.dial}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <input
          required={required}
          type="tel"
          id={phoneId}
          name={name}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="tel-national"
          placeholder={placeholder}
          value={national}
          onChange={(e) => handleNationalChange(e.target.value)}
          className={cn(fieldClassName, "mt-0 min-w-0 flex-1 text-start")}
          aria-invalid={invalid}
        />
      </div>
      {invalid && invalidMessage ? (
        <p className="mt-2 text-xs text-rose-300">{invalidMessage}</p>
      ) : null}
    </div>
  );
}
