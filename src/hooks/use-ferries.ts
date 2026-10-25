import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ApiResponse,
  ICreateFerryPayload,
  IFerry,
  IFerryFilterParams,
  IFerryListResponse,
  IFerryStats,
  IUpdateFerryPayload
} from "@/types";

import { del, get, patch, post } from "@/lib/api";

/**
 * Ferry Query Key Factory
 */
export const ferryKeys = {
  all: ["ferries"] as const,
  lists: () => [...ferryKeys.all, "list"] as const,
  list: (params?: IFerryFilterParams) => [...ferryKeys.lists(), params] as const,
  stats: () => [...ferryKeys.all, "stats"] as const,
  details: () => [...ferryKeys.all, "detail"] as const,
  detail: (id: string) => [...ferryKeys.details(), id] as const
};

/**
 * 1. Query: Fetch Ferries List with optional filters (search, status, type, pagination)
 */
export function useFerriesQuery(params?: IFerryFilterParams) {
  return useQuery({
    queryKey: ferryKeys.list(params),
    queryFn: async ({ signal }) => {
      const cleanParams: Record<string, string | number> = {};
      if (params?.search && params.search.trim()) cleanParams.search = params.search.trim();
      if (params?.status && params.status !== "ALL" && params.status.trim()) {
        cleanParams.status = params.status;
      }
      if (params?.type && params.type !== "ALL" && params.type.trim()) {
        cleanParams.type = params.type;
      }
      if (params?.page) cleanParams.page = params.page;
      if (params?.limit) cleanParams.limit = params.limit;

      const response = await get<ApiResponse<IFerryListResponse | IFerry[]>>("/ferries", {
        params: cleanParams,
        signal
      });

      const items = Array.isArray(response.data)
        ? response.data
        : (response.data?.items ?? []);

      const meta =
        !Array.isArray(response.data) && response.data?.meta
          ? response.data.meta
          : response.meta;

      return {
        ferries: items,
        meta
      };
    },
    staleTime: 0, // Fresh queries immediately
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
 * 2. Query: Fetch Operator Fleet Statistics (Total, In-Service, Maintenance, Capacity)
 */
export function useFerryStatsQuery() {
  return useQuery({
    queryKey: ferryKeys.stats(),
    queryFn: async ({ signal }) => {
      const response = await get<ApiResponse<IFerryStats>>("/ferries/stats", {
        signal
      });
      return response.data;
    },
    staleTime: 0,
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
 * 3. Mutation: Register New Vessel to Operational Fleet
 */
export function useCreateFerryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ICreateFerryPayload) => {
      return await post<ApiResponse<IFerry>>("/ferries", payload);
    },
    onSuccess: async (response) => {
      // 1. Instantly inject the newly created ferry into all active list caches
      if (response.data) {
        const createdFerry = response.data;
        queryClient.setQueriesData<{ ferries: IFerry[]; meta?: unknown }>(
          { queryKey: ferryKeys.lists() },
          (oldData) => {
            if (!oldData) return { ferries: [createdFerry] };
            return {
              ...oldData,
              ferries: [createdFerry, ...oldData.ferries.filter((f) => f.id !== createdFerry.id)]
            };
          }
        );
      }

      // 2. Invalidate and re-fetch to ensure database parity
      await queryClient.invalidateQueries({ queryKey: ferryKeys.all, refetchType: "all" });
      await queryClient.refetchQueries({ queryKey: ferryKeys.all });

      toast.success(response.message || "Ferry registered successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to register ferry");
    }
  });
}

/**
 * 4. Mutation: Update Ferry Details and Status
 */
export function useUpdateFerryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: IUpdateFerryPayload }) => {
      return await patch<ApiResponse<IFerry>>(`/ferries/${id}`, payload);
    },
    onSuccess: async (response, variables) => {
      // 1. Instantly update the ferry in the local cache
      if (response.data) {
        const updatedFerry = response.data;
        queryClient.setQueriesData<{ ferries: IFerry[]; meta?: unknown }>(
          { queryKey: ferryKeys.lists() },
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              ferries: oldData.ferries.map((f) => (f.id === updatedFerry.id ? updatedFerry : f))
            };
          }
        );
      }

      // 2. Invalidate and re-fetch
      await queryClient.invalidateQueries({ queryKey: ferryKeys.all, refetchType: "all" });
      await queryClient.refetchQueries({ queryKey: ferryKeys.all });

      toast.success(response.message || "Ferry updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update ferry");
    }
  });
}

/**
 * 5. Mutation: Remove Ferry
 */
export function useDeleteFerryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await del<ApiResponse<void>>(`/ferries/${id}`);
    },
    onSuccess: async (response, id) => {
      // 1. Instantly remove the ferry from local list caches
      queryClient.setQueriesData<{ ferries: IFerry[]; meta?: unknown }>(
        { queryKey: ferryKeys.lists() },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            ferries: oldData.ferries.filter((f) => f.id !== id)
          };
        }
      );

      // 2. Invalidate and re-fetch
      await queryClient.invalidateQueries({ queryKey: ferryKeys.all, refetchType: "all" });
      await queryClient.refetchQueries({ queryKey: ferryKeys.all });

      toast.success(response.message || "Ferry successfully removed.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete ferry");
    }
  });
}
