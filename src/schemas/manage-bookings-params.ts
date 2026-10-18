import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral
} from "nuqs/server";

export const BOOKING_STATUS_OPTIONS = ["ALL", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;
export type BookingStatusFilter = (typeof BOOKING_STATUS_OPTIONS)[number];

export const manageBookingsParsers = {
  search: parseAsString.withDefault(""),
  status: parseAsStringLiteral(BOOKING_STATUS_OPTIONS).withDefault("ALL"),
  page: parseAsInteger.withDefault(1)
};

export const manageBookingsCache = createSearchParamsCache(manageBookingsParsers);
export const serializeManageBookings = createSerializer(manageBookingsParsers);
