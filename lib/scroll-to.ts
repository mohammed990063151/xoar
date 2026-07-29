type LenisLike = {
  scrollTo: (
    target: number | string | HTMLElement,
    options?: { offset?: number; immediate?: boolean; duration?: number },
  ) => void;
  scroll?: number;
};

let lenisInstance: LenisLike | null = null;
let scrollTopTimers: ReturnType<typeof setTimeout>[] = [];

export function setLenisInstance(instance: LenisLike | null): void {
  lenisInstance = instance;
}

export function getLenisInstance(): LenisLike | null {
  return lenisInstance;
}

export function enableManualScrollRestoration(): void {
  if (typeof window === "undefined") return;
  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }
}

/** Scroll the viewport to the top (works with Lenis and native scroll). */
export function scrollToTop(options?: { immediate?: boolean }): void {
  if (typeof window === "undefined") return;

  const immediate = options?.immediate ?? true;
  const lenis = getLenisInstance();

  if (lenis) {
    lenis.scrollTo(0, { immediate });
    if (typeof lenis.scroll === "number" && lenis.scroll > 0 && immediate) {
      lenis.scrollTo(0, { immediate: true });
    }
  }

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: immediate ? "auto" : "smooth",
  });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Force top-of-page after route changes (retries beat Lenis / late layout). */
export function scheduleScrollToTop(): void {
  if (typeof window === "undefined") return;

  scrollTopTimers.forEach(clearTimeout);
  scrollTopTimers = [];

  scrollToTop({ immediate: true });

  for (const ms of [0, 16, 50, 100, 200, 400, 600, 900]) {
    scrollTopTimers.push(
      window.setTimeout(() => {
        scrollToTop({ immediate: true });
      }, ms),
    );
  }
}

export function cancelScheduledScrollToTop(): void {
  scrollTopTimers.forEach(clearTimeout);
  scrollTopTimers = [];
}

const HEADER_OFFSET = -100;

export function scrollToHashTarget(
  id: string,
  options?: { offset?: number; behavior?: ScrollBehavior },
): boolean {
  if (typeof document === "undefined") return false;

  const el = document.getElementById(id.replace(/^#/, ""));
  if (!el) return false;

  const offset = options?.offset ?? HEADER_OFFSET;
  const lenis = getLenisInstance();

  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.1 });
  } else {
    el.scrollIntoView({
      behavior: options?.behavior ?? "smooth",
      block: "start",
    });
  }

  return true;
}

/** Retry hash scroll until the target element exists (async layouts). */
export function scrollToHashWhenReady(
  hash: string,
  options?: { offset?: number; maxAttempts?: number },
): () => void {
  const id = hash.replace(/^#/, "");
  if (!id) return () => {};

  let attempts = 0;
  const maxAttempts = options?.maxAttempts ?? 12;
  let frameId = 0;
  let timeoutId = 0;

  const tryScroll = (): void => {
    if (scrollToHashTarget(id, { offset: options?.offset })) return;
    attempts += 1;
    if (attempts < maxAttempts) {
      timeoutId = window.setTimeout(tryScroll, 80);
    }
  };

  frameId = requestAnimationFrame(tryScroll);

  return () => {
    cancelAnimationFrame(frameId);
    window.clearTimeout(timeoutId);
  };
}
