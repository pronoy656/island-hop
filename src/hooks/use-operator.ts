import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, IOperatorOverviewData } from "@/types";
import { get } from "@/lib/api";

/**
 * Operator Query Key Factory
 */
export const operatorKeys = {
  all: ["operator"] as const,
  overview: () => [...operatorKeys.all, "overview"] as const
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
