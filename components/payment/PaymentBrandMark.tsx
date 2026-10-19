import Image from "next/image";
import { cn } from "@/lib/cn";

export function paymentMethodLabel(id: string | undefined, ar: boolean): string {
  switch (id) {
    case "visa":
      return "Visa";
    case "mastercard":
    case "master":
      return "Mastercard";
    case "mada":
      return ar ? "مدى" : "mada";
    case "apple":
    case "apple_pay":
    case "applepay":
      return "Apple Pay";
    case "card":
      return ar ? "بطاقة" : "Card";
    case "google":
    case "google_pay":
      return "Google Pay";
    case "tamara":
      return "Tamara";
    case "tabby":
      return "Tabby";
    default:
      return id || "—";
  }
}

export function paymentGatewayLabel(id: string | undefined): string {
  switch (id) {
    case "geidea":
      return "Geidea";
    case "moyasar":
      return "Moyasar";
    case "tap":
      return "Tap";
    case "tamara":
      return "Tamara";
    case "tabby":
      return "Tabby";
    case "manual":
      return "Manual";
    default:
      return id || "—";
  }
}

const BRAND_LOGOS: Record<string, { src: string; alt: string; width: number; height: number }> = {
  visa: { src: "/payment-logos/visa.svg", alt: "Visa", width: 1000, height: 324 },
  mastercard: { src: "/payment-logos/mastercard.svg", alt: "Mastercard", width: 999, height: 776 },
  master: { src: "/payment-logos/mastercard.svg", alt: "Mastercard", width: 999, height: 776 },
  mada: { src: "/payment-logos/mada.svg", alt: "mada", width: 796, height: 266 },
  apple: { src: "/payment-logos/apple-pay.svg", alt: "Apple Pay", width: 512, height: 210 },
  apple_pay: { src: "/payment-logos/apple-pay.svg", alt: "Apple Pay", width: 512, height: 210 },
  applepay: { src: "/payment-logos/apple-pay.svg", alt: "Apple Pay", width: 512, height: 210 },
};

export function GeideaWordmark({ className }: { readonly className?: string }): React.ReactElement {
  return (
    <span className={cn("inline-flex items-center rounded-lg bg-white px-2.5 py-1", className)}>
      <Image src="/payment-logos/geidea.png" alt="Geidea" width={120} height={40} className="h-5 w-auto" unoptimized />
    </span>
  );
}

export function PaymentBrandMark({
  id,
  className,
}: {
  readonly id?: string;
  readonly className?: string;
}): React.ReactElement | null {
  const logo = id ? BRAND_LOGOS[id] : undefined;
  if (!logo) {
    return null;
  }

  return (
    <span
      className={cn(
        "inline-flex h-7 w-[4.5rem] items-center justify-center rounded-md bg-white px-1.5 py-1",
        className,
      )}
      title={logo.alt}
    >
      <Image
        src={logo.src}
        alt={logo.alt}
        width={logo.width}
        height={logo.height}
        className="h-full max-h-5 w-auto object-contain"
        unoptimized
      />
    </span>
  );
}
