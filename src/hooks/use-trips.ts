"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, ITripDetail, ITripSearchParams, ITripSearchResponse } from "@/types";
import { get } from "@/lib/api";

export const tripKeys = {
  all: ["trips"] as const,
  search: (params?: ITripSearchParams) => [...tripKeys.all, "search", params] as const,
  details: () => [...tripKeys.all, "detail"] as const,
  detail: (id: string) => [...tripKeys.details(), id] as const,
};

/**
 * 1. Query: Search available ferry trips by origin, destination, date & passenger count
 */
export function useTripsSearchQuery(params: ITripSearchParams, options?: { enabled?: boolean }) {
  const isRoundTrip = params.tripType === "round-trip";
  const hasRequiredDates = Boolean(
    params.departureDate && (!isRoundTrip || Boolean(params.returnDate))
  );

  return useQuery({
    queryKey: tripKeys.search(params),
    queryFn: async ({ signal }) => {
      // Guard: Do not call API if round-trip is selected without returnDate
      if (isRoundTrip && !params.returnDate) {
        return {
          pagination: { nextCursor: null, hasNextPage: false, limit: 10 },
          outboundTrips: [],
          returnTrips: [],
        };
      }

      const cleanParams: Record<string, string | number> = {};
      if (params.tripType) cleanParams.tripType = params.tripType;
      if (params.from) cleanParams.from = params.from;
      if (params.to) cleanParams.to = params.to;
      if (params.departureDate) cleanParams.departureDate = params.departureDate;
      if (params.returnDate && params.tripType === "round-trip") {
        cleanParams.returnDate = params.returnDate;
      }
      if (params.adults !== undefined) cleanParams.adults = params.adults;
      if (params.children !== undefined) cleanParams.children = params.children;
      if (params.limit !== undefined) cleanParams.limit = params.limit;
      if (params.cursor) cleanParams.cursor = params.cursor;

      const response = await get<ApiResponse<ITripSearchResponse>>("/trips/search", {
        params: cleanParams,
        signal,
      });

      return (
        response.data ?? {
          pagination: { nextCursor: null, hasNextPage: false, limit: 10 },
          outboundTrips: [],
          returnTrips: [],
        }
      );
    },
    enabled: Boolean(
      params.from &&
      params.to &&
      hasRequiredDates &&
      (options?.enabled ?? true)
    ),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * 2. Query: Fetch public trip details for checkout review
 */
export function useTripDetailsQuery(tripId: string) {
  return useQuery({
    queryKey: tripKeys.detail(tripId),
    queryFn: async ({ signal }) => {
      const response = await get<ApiResponse<ITripDetail>>(`/trips/${tripId}`, {
        signal,
      });
      return response.data ?? null;
    },
    enabled: Boolean(tripId && tripId !== "undefined"),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
