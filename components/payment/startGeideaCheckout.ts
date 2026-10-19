import type { Locale } from "@/lib/i18n";
import { localizedPath } from "@/lib/i18n";

interface GeideaClientResult {
  responseCode?: string;
  responseMessage?: string;
  orderId?: string;
  reference?: string;
}

interface GeideaCheckoutClient {
  startPayment: (sessionId: string, options?: null, containerId?: string) => void;
}

type GeideaCheckoutCtor = new (
  onSuccess: (data: GeideaClientResult) => void,
  onError: (data: GeideaClientResult) => void,
  onCancel: (data: GeideaClientResult) => void,
) => GeideaCheckoutClient;

declare global {
  interface Window {
    GeideaCheckout?: GeideaCheckoutCtor;
  }
}

const DEFAULT_SCRIPT = "https://www.ksamerchant.geidea.net/hpp/geideaCheckout.min.js";

function loadScript(src: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Geidea checkout is only available in the browser."));
  }

  if (window.GeideaCheckout) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-geidea-checkout="1"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Geidea script failed")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.geideaCheckout = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Geidea script failed"));
    document.head.appendChild(script);
  });
}

export async function startGeideaCheckout(options: {
  sessionId: string;
  confirmationCode: string;
  locale: Locale;
  scriptUrl?: string | null;
  /** Element id to embed Geidea's page into (drop-in); popup mode when omitted. */
  containerId?: string;
  onCancel: () => void;
  onError: (message: string) => void;
}): Promise<void> {
  const src = options.scriptUrl?.trim() || DEFAULT_SCRIPT;
  await loadScript(src);

  const Ctor = window.GeideaCheckout;
  if (!Ctor) {
    throw new Error("Geidea checkout is unavailable.");
  }

  const goToSuccess = (): void => {
    const path = localizedPath(options.locale, "/payment/success");
    window.location.assign(`${path}?code=${encodeURIComponent(options.confirmationCode)}`);
  };

  const payment = new Ctor(
    () => {
      goToSuccess();
    },
    () => {
      options.onError(
        options.locale === "ar"
          ? "تعذّر إتمام الدفع. حاول مرة أخرى."
          : "Payment could not be completed. Please try again.",
      );
    },
    () => {
      options.onCancel();
    },
  );

  if (options.containerId) {
    payment.startPayment(options.sessionId, null, options.containerId);
    return;
  }

  payment.startPayment(options.sessionId);
}
