"use client";

import { motion } from "framer-motion";

const WHATSAPP_URL = "https://wa.me/966563672097";

interface WhatsAppFloatProps {
  readonly label: string;
  readonly aria: string;
}

export function WhatsAppFloat({
  label,
  aria,
}: WhatsAppFloatProps): React.ReactElement {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={aria}
      className="fixed bottom-6 z-[60] flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 end-6"
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="h-6 w-6 shrink-0"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M16.003 3C9.374 3 4 8.373 4 15c0 2.385.628 4.637 1.825 6.606L4 29l7.62-1.96A12.9 12.9 0 0016.003 27C22.632 27 28 21.627 28 15S22.632 3 16.003 3m0 2.4c5.52 0 10 4.48 10 10s-4.48 10-10 10c-2.07 0-4.02-.63-5.64-1.72l-.4-.27-4.7 1.21 1.26-4.58-.26-.42A9.55 9.55 0 016.003 15c0-5.52 4.48-10 10-10m5.59 13.88c-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.24-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-1.1-.98-1.84-2.2-2.06-2.58-.22-.36-.02-.56.17-.74.17-.17.38-.44.56-.66.19-.22.25-.38.38-.64.12-.26.06-.48-.03-.66-.09-.18-.54-1.3-.74-1.78-.19-.48-.4-.42-.54-.43h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.52.58.18 1.1.16 1.52.1.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"
        />
      </svg>
      <span className="hidden sm:inline">{label}</span>
    </motion.a>
  );
}
