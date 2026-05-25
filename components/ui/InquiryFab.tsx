"use client";

import { motion } from "framer-motion";
import { useBookingModal } from "@/components/providers/BookingModalProvider";
import { whatsappHref } from "@/lib/whatsapp";
import type { Locale } from "@/lib/i18n";

interface InquiryFabProps {
  readonly label: string;
  readonly aria: string;
  readonly whatsappAria: string;
  readonly locale: Locale;
  readonly whatsapp?: string;
}

function WhatsAppIcon(): React.ReactElement {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-6 w-6"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function InquiryFab({
  label,
  aria,
  whatsappAria,
  locale,
  whatsapp,
}: InquiryFabProps): React.ReactElement {
  const { openBooking } = useBookingModal();
  const waLink = whatsappHref(whatsapp);

  return (
    <div
      className="safe-fab fixed z-[60] flex flex-col items-end gap-2.5 sm:gap-3"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <motion.a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={whatsappAria}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald-900/30 transition hover:bg-[#20bd5a] sm:h-12 sm:w-12"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 22, delay: 0.05 }}
      >
        <WhatsAppIcon />
      </motion.a>

      <motion.button
        type="button"
        aria-label={aria}
        onClick={() => openBooking({ type: "booking" })}
        className="flex max-w-[calc(100vw-5rem)] items-center gap-2 rounded-full bg-gradient-to-l from-violet-600 to-cyan-500 px-3.5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-900/40 sm:max-w-none sm:px-4 sm:py-3 sm:text-sm"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
          aria-hidden
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="hidden sm:inline">{label}</span>
      </motion.button>
    </div>
  );
}
