"use client";

import { motion } from "framer-motion";
import { useBookingModal } from "@/components/providers/BookingModalProvider";
import type { InquiryType } from "@/services/inquiryService";
import { cn } from "@/lib/cn";

interface BookButtonProps {
  readonly children: React.ReactNode;
  readonly type?: InquiryType;
  readonly variant?: "default" | "event";
  readonly source?: string;
  readonly title?: string;
  readonly activityId?: number;
  readonly className?: string;
}

export function BookButton({
  children,
  type = "contact",
  variant = "default",
  source,
  title,
  activityId,
  className,
}: BookButtonProps): React.ReactElement {
  const { openBooking } = useBookingModal();

  return (
    <motion.button
      type="button"
      className={cn(className)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => openBooking({ type, source, title, variant, activityId })}
    >
      {children}
    </motion.button>
  );
}
