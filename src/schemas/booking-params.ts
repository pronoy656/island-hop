import {
  createSearchParamsCache,
  parseAsString,
  parseAsStringEnum
} from "nuqs/server";

export const tripTypeValues = ["one-way", "round-trip"] as const;
export type TripType = (typeof tripTypeValues)[number];

export const bookingSearchParamsParsers = {
  tripType: parseAsStringEnum<TripType>(["one-way", "round-trip"]).withDefault("one-way"),
  from: parseAsString.withDefault("Malé"),
  to: parseAsString.withDefault("Maafushi"),
  departureDate: parseAsString.withDefault("2026-05-24"),
  passengers: parseAsString.withDefault("1 Passenger"),
  bookingRef: parseAsString.withDefault("")
};

export const bookingSearchParamsCache = createSearchParamsCache(bookingSearchParamsParsers);

/**
 * Helper to reliably parse numeric passenger count from strings like "1 Passenger", "2 Passengers", "4"
 */
export function extractPassengerCount(passengersStr: string | null | undefined): number {
  if (!passengersStr) return 1;
  const match = passengersStr.match(/\d+/);
  const count = match ? parseInt(match[0], 10) : 1;
  return isNaN(count) || count < 1 ? 1 : count;
}
