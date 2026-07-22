type LenisLike = {
  scrollTo: (
    target: number | string | HTMLElement,
    options?: { offset?: number; immediate?: boolean; duration?: number },
  ) => void;
};

let lenisInstance: LenisLike | null = null;

export function setLenisInstance(instance: LenisLike | null): void {
  lenisInstance = instance;
}

export function getLenisInstance(): LenisLike | null {
  return lenisInstance;
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
