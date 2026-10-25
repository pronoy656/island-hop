import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ApiResponse,
  IAdminAnalyticsOverview,
  IAdminBookingFilterParams,
  IAdminBookingItem,
  IAdminBookingsResponseData,
  IAdminProviderDetail,
  IAdminProviderItem,
  IProviderStatusUpdatePayload,
  ProviderFilterParams
} from "@/types";

import { del, get, patch, post } from "@/lib/api";

/**
 * Admin Query Key Factory
 */
export const adminKeys = {
  all: ["admin"] as const,
  analytics: () => [...adminKeys.all, "analytics"] as const,
  providers: () => [...adminKeys.all, "providers"] as const,
  providerLists: () => [...adminKeys.providers(), "list"] as const,
  providerList: (params?: ProviderFilterParams) => [...adminKeys.providerLists(), params] as const,
  providerDetails: () => [...adminKeys.providers(), "detail"] as const,
  providerDetail: (id: string) => [...adminKeys.providerDetails(), id] as const,
  bookings: () => [...adminKeys.all, "bookings"] as const,
  bookingLists: () => [...adminKeys.bookings(), "list"] as const,
  bookingList: (params?: IAdminBookingFilterParams) => [...adminKeys.bookingLists(), params] as const
};

/**
 * 1. Query: Fetch Admin Platform Analytics & Real-Time Overview
 */
export function useAdminAnalyticsQuery() {
  return useQuery({
    queryKey: adminKeys.analytics(),
    queryFn: async ({ signal }) => {
      const response = await get<ApiResponse<IAdminAnalyticsOverview>>("/admin/analytics/overview", {
        signal
      });
      return response.data;
    },
    staleTime: 1000 * 60 * 3, // Fresh for 3 minutes
    placeholderData: (previousData) => previousData
  });
}

/**
 * 2. Query: Fetch Paginated & Filtered Registered Ferry Providers
 */
export function useAdminProvidersQuery(params?: ProviderFilterParams) {
  return useQuery({
    queryKey: adminKeys.providerList(params),
    queryFn: async ({ signal }) => {
      const cleanParams: Record<string, string | number> = {};
      if (params?.searchTerm && params.searchTerm.trim()) {
        cleanParams.searchTerm = params.searchTerm.trim();
      }
      if (params?.status && params.status !== "ALL" && params.status !== "all" && params.status.trim()) {
        cleanParams.status = params.status;
      }
      if (params?.page) cleanParams.page = params.page;
      if (params?.limit) cleanParams.limit = params.limit;
      if (params?.sortOrder) cleanParams.sortOrder = params.sortOrder;

      const response = await get<
        ApiResponse<IAdminProviderItem[]> & {
          pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPage?: number;
            totalPages?: number;
          };
        }
      >("/admin/providers", {
        params: cleanParams,
        signal
      });

      const pagination = response.pagination;
      const normalizedMeta = pagination
        ? {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: pagination.totalPages ?? pagination.totalPage ?? 1
          }
        : response.meta;

      return {
        providers: response.data ?? [],
        meta: normalizedMeta
      };
    },
    staleTime: 0,
    placeholderData: (previousData) => previousData
  });
}

/**
 * 3. Query: Fetch Single Provider Details with Fleet, Routes, and Bookings
 */
export function useAdminProviderDetailQuery(providerId: string, enabled = true) {
  return useQuery({
    queryKey: adminKeys.providerDetail(providerId),
    queryFn: async ({ signal }) => {
      const response = await get<ApiResponse<IAdminProviderDetail>>(`/admin/providers/${providerId}`, {
        signal
      });
      return response.data;
    },
    enabled: Boolean(providerId) && enabled,
    staleTime: 1000 * 60 * 5
  });
}

/**
 * 4. Mutation: Update Provider Operational Status (Active / Suspended)
 */
export function useUpdateProviderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      providerId,
      payload
    }: {
      providerId: string;
      payload: IProviderStatusUpdatePayload;
    }) => {
      return await patch<ApiResponse<{ provider: unknown; deactivatedTripsCount?: number }>>(
        `/admin/providers/${providerId}/status`,
        payload
      );
    },
    onSuccess: (response, variables) => {
      // Invalidate both the provider list and specific provider detail
      queryClient.invalidateQueries({ queryKey: adminKeys.providers() });
      queryClient.invalidateQueries({ queryKey: adminKeys.providerDetail(variables.providerId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.analytics() });

      const newStatus = variables.payload.status;
      toast.success(
        response.message ||
          `Operator status successfully updated to ${newStatus === "ACTIVE" ? "Active" : "Suspended"}`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update operator status");
    }
  });
}

/**
 * 5. Query: Fetch Paginated & Filtered Admin Platform Bookings
 */
export function useAdminBookingsQuery(params?: IAdminBookingFilterParams) {
  return useQuery({
    queryKey: adminKeys.bookingList(params),
    queryFn: async ({ signal }) => {
      const cleanParams: Record<string, string | number> = {};
      if (params?.search && params.search.trim()) {
        cleanParams.search = params.search.trim();
      }
      if (params?.status && params.status !== "ALL" && params.status !== "all" && params.status.trim()) {
        cleanParams.status = params.status.toUpperCase();
      }
      if (params?.page) cleanParams.page = params.page;
      if (params?.limit) cleanParams.limit = params.limit;

      const response = await get<ApiResponse<IAdminBookingsResponseData>>("/admin/bookings", {
        params: cleanParams,
        signal
      });

      return (
        response.data ?? {
          meta: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: 0,
            totalPages: 1
          },
          data: []
        }
      );
    },
    staleTime: 1000 * 30, // 30 seconds
    placeholderData: (previousData) => previousData
  });
}

