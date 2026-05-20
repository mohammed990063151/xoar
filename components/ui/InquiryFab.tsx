"use client";

import { motion } from "framer-motion";
import { useBookingModal } from "@/components/providers/BookingModalProvider";

interface InquiryFabProps {
  readonly label: string;
  readonly aria: string;
}

export function InquiryFab({
  label,
  aria,
}: InquiryFabProps): React.ReactElement {
  const { openBooking } = useBookingModal();

  return (
    <motion.button
      type="button"
      aria-label={aria}
      onClick={() => openBooking({ type: "booking" })}
      className="fixed bottom-6 z-[60] flex items-center gap-2 rounded-full bg-gradient-to-l from-violet-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 end-6"
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
  );
}
