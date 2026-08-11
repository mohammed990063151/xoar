"use client";

import { useEffect, useState } from "react";

function getThemeFromDom(): "light" | "dark" {
  const v = document.documentElement.getAttribute("data-theme");
  return v === "light" ? "light" : "dark";
}

function SunIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2.5v2.25M12 19.25V21.5M21.5 12h-2.25M4.75 12H2.5M18.72 5.28l-1.6 1.6M6.88 17.12l-1.6 1.6M18.72 18.72l-1.6-1.6M6.88 6.88l-1.6-1.6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CrescentMoonIcon(): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M20.2 13.85A7.75 7.75 0 0 1 10.15 3.8 8.5 8.5 0 1 0 20.2 13.85Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle(): React.ReactElement {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Keep the initial render identical between SSR and first client render,
    // then update after hydration to avoid hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(getThemeFromDom());
  }, []);

  const isLight = theme === "light";

  return (
    <button
      type="button"
      className={
        isLight
          ? "inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 text-amber-500 transition hover:border-amber-400/50 hover:bg-amber-50 sm:h-9 sm:w-9"
          : "inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-slate-200 transition hover:border-violet-400/40 hover:bg-white/5 hover:text-white sm:h-9 sm:w-9"
      }
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      title={isLight ? "Dark" : "Light"}
      onClick={() => {
        const next: "light" | "dark" = isLight ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        try {
          localStorage.setItem("theme", next);
        } catch {
          // ignore
        }
        setTheme(next);
      }}
    >
      {isLight ? <SunIcon /> : <CrescentMoonIcon />}
    </button>
  );
}
