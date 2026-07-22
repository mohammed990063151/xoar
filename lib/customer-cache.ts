import type { Customer, CustomerBooking } from "@/types/customer";

type CacheEntry<T> = { value: T; at: number };

const ME_TTL_MS = 60_000;
const BOOKINGS_TTL_MS = 30_000;

let meCache: CacheEntry<Customer | null> | null = null;
let bookingsCache: CacheEntry<CustomerBooking[]> | null = null;

function fresh<T>(entry: CacheEntry<T> | null, ttl: number): T | undefined {
  if (!entry) return undefined;
  if (Date.now() - entry.at > ttl) return undefined;
  return entry.value;
}

export const customerCache = {
  getMe(): Customer | null | undefined {
    return fresh(meCache, ME_TTL_MS);
  },
  setMe(value: Customer | null): void {
    meCache = { value, at: Date.now() };
  },
  getBookings(): CustomerBooking[] | undefined {
    return fresh(bookingsCache, BOOKINGS_TTL_MS);
  },
  setBookings(value: CustomerBooking[]): void {
    bookingsCache = { value, at: Date.now() };
  },
  clear(): void {
    meCache = null;
    bookingsCache = null;
  },
};
