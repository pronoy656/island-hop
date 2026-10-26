import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ApiResponse,
  IManifestPassengerRecord,
  IOperatorBookingFilterParams,
  IOperatorBookingItem,
  IOperatorBookingsResponseData,
  IOperatorOverviewData,
  ITripManifestResponse
} from "@/types";
import { get, patch } from "@/lib/api";

/**
 * Operator Query Key Factory
 */
export const operatorKeys = {
  all: ["operator"] as const,
  overview: () => [...operatorKeys.all, "overview"] as const,
  bookings: () => [...operatorKeys.all, "bookings"] as const,
  bookingLists: () => [...operatorKeys.bookings(), "list"] as const,
  bookingList: (params?: IOperatorBookingFilterParams) => [...operatorKeys.bookingLists(), params] as const,
  bookingDetails: () => [...operatorKeys.bookings(), "detail"] as const,
  bookingDetail: (id: string) => [...operatorKeys.bookingDetails(), id] as const,
  manifests: () => [...operatorKeys.all, "manifest"] as const,
  manifest: (tripId: string, search?: string, status?: string) =>
    [...operatorKeys.manifests(), tripId, { search, status }] as const
};

/**
 * Hook to fetch live operator overview metrics, departures, and recent bookings
 * GET /api/v1/operator/overview
 */
export function useOperatorOverviewQuery() {
  return useQuery({
    queryKey: operatorKeys.overview(),
    queryFn: async ({ signal }) => {
      const response = await get<ApiResponse<IOperatorOverviewData>>("/operator/overview", {
        signal
      });
      return response.data;
    },
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        (error.message.includes("token") ||
          error.message.includes("Authorization") ||
          error.message.includes("401"))
      ) {
        return false;
      }
      return failureCount < 1;
    }
  });
}

/**
 * Hook to fetch paginated & filtered operator bookings
 * GET /api/v1/operator/bookings
 */
export function useOperatorBookingsQuery(params?: IOperatorBookingFilterParams) {
  return useQuery({
    queryKey: operatorKeys.bookingList(params),
    queryFn: async ({ signal }) => {
      const cleanParams: Record<string, string | number> = {};
      if (params?.page) cleanParams.page = params.page;
      if (params?.limit) cleanParams.limit = params.limit;
      if (params?.status && params.status !== "ALL") cleanParams.status = params.status;
      if (params?.search && params.search.trim()) cleanParams.search = params.search.trim();

      const response = await get<ApiResponse<IOperatorBookingsResponseData>>("/operator/bookings", {
        params: cleanParams,
        signal
      });

      const responseData = response.data;
      return {
        bookings: responseData?.data ?? [],
        meta: responseData?.meta ?? {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          total: responseData?.data?.length ?? 0,
          totalPages: 1
        }
      };
    },
    staleTime: 1000 * 30, // 30 seconds
    placeholderData: (previousData) => previousData
  });
}

/**
 * Mutation to check-in an operator booking
 * PATCH /api/v1/operator/bookings/:id/check-in
 */
export function useOperatorCheckInMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await patch<ApiResponse<IOperatorBookingItem>>(
        `/operator/bookings/${bookingId}/check-in`,
        {}
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: operatorKeys.bookings() });
      await queryClient.invalidateQueries({ queryKey: operatorKeys.overview() });
      toast.success("Passenger booking checked in successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to check in passenger.");
    }
  });
}

/**
 * Hook to fetch live passenger manifest for a trip
 * GET /api/v1/operator/manifest?tripId=...
 */
export function useTripManifestQuery(params?: {
  tripId?: string;
  search?: string;
  boardingStatus?: string;
}) {
  return useQuery({
    queryKey: operatorKeys.manifest(params?.tripId ?? "", params?.search, params?.boardingStatus),
    queryFn: async ({ signal }) => {
      if (!params?.tripId) return null;
      const cleanParams: Record<string, string> = { tripId: params.tripId };
      if (params.search && params.search.trim()) cleanParams.search = params.search.trim();
      if (params.boardingStatus && params.boardingStatus !== "ALL") cleanParams.boardingStatus = params.boardingStatus;

      const response = await get<ApiResponse<ITripManifestResponse>>("/operator/manifest", {
        params: cleanParams,
        signal
      });
      return response.data ?? null;
    },
    enabled: Boolean(params?.tripId),
    staleTime: 1000 * 15, // 15 seconds
    refetchOnWindowFocus: true
  });
}

/**
 * Mutation to confirm passenger boarded on vessel
 * PATCH /api/v1/operator/manifest/:ticketId/board
 */
export function useBoardPassengerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, luggageCount }: { ticketId: string; luggageCount?: number }) => {
      const response = await patch<ApiResponse<IManifestPassengerRecord>>(
        `/operator/manifest/${ticketId}/board`,
        typeof luggageCount === "number" ? { luggageCount } : {}
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: operatorKeys.manifests() });
      toast.success("Passenger boarding confirmed!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to board passenger.");
    }
  });
}

/**
 * Mutation to revert passenger boarding
 * PATCH /api/v1/operator/manifest/:ticketId/unboard
 */
export function useUnboardPassengerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await patch<ApiResponse<IManifestPassengerRecord>>(
        `/operator/manifest/${ticketId}/unboard`,
        {}
      );
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: operatorKeys.manifests() });
      toast.success("Passenger boarding reverted.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revert boarding.");
    }
  });
}

