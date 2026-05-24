"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { BookingModal } from "@/components/ui/BookingModal";
import type { InquiryType } from "@/services/inquiryService";
import type { Locale } from "@/lib/i18n";

export interface BookingModalOptions {
  type?: InquiryType;
  source?: string;
  title?: string;
}

interface BookingModalContextValue {
  openBooking: (options?: BookingModalOptions) => void;
  closeBooking: () => void;
}

const BookingModalContext = createContext<BookingModalContextValue | null>(
  null,
);

interface BookingModalProviderProps {
  readonly locale: Locale;
  readonly labels: {
    readonly name: string;
    readonly email: string;
    readonly phone: string;
    readonly message: string;
    readonly send: string;
    readonly success: string;
    readonly error: string;
    readonly defaultTitle: string;
    readonly close: string;
  };
  readonly children: ReactNode;
}

export function BookingModalProvider({
  locale,
  labels,
  children,
}: BookingModalProviderProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<BookingModalOptions>({});

  const openBooking = useCallback((next?: BookingModalOptions) => {
    setOptions(next ?? {});
    setOpen(true);
  }, []);

  const closeBooking = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo(
    () => ({ openBooking, closeBooking }),
    [openBooking, closeBooking],
  );

  return (
    <BookingModalContext.Provider value={value}>
      {children}
      <BookingModal
        open={open}
        locale={locale}
        labels={labels}
        options={options}
        onClose={closeBooking}
      />
    </BookingModalContext.Provider>
  );
}

export function useBookingModal(): BookingModalContextValue {
  const ctx = useContext(BookingModalContext);
  if (!ctx) {
    throw new Error("useBookingModal must be used within BookingModalProvider");
  }
  return ctx;
}
