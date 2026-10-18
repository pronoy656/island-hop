import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ApiResponse,
  ICreateRoutePayload,
  IPort,
  IPortListResponse,
  IRoute,
  IRouteFilterParams,
  IRouteListResponse,
  IUpdateRoutePayload
} from "@/types";

import { del, get, patch, post } from "@/lib/api";

/**
 * Route Query Key Factory
 */
export const routeKeys = {
  all: ["routes"] as const,
  lists: () => [...routeKeys.all, "list"] as const,
  list: (params?: IRouteFilterParams) => [...routeKeys.lists(), params] as const,
  details: () => [...routeKeys.all, "detail"] as const,
  detail: (id: string) => [...routeKeys.details(), id] as const,
  ports: ["ports"] as const
};

/**
 * 1. Query: Fetch Operator Routes with optional status and pagination
 */
export function useRoutesQuery(params?: IRouteFilterParams) {
  return useQuery({
    queryKey: routeKeys.list(params),
    queryFn: async ({ signal }) => {
      const cleanParams: Record<string, string | number> = {};
      if (params?.status && params.status !== "ALL" && params.status.trim()) {
        cleanParams.status = params.status;
      }
      if (params?.page) cleanParams.page = params.page;
      if (params?.limit) cleanParams.limit = params.limit;

      const response = await get<ApiResponse<IRouteListResponse>>("/routes", {
        params: cleanParams,
        signal
      });

      const routesData = response.data;
      const routesList = Array.isArray(routesData?.routes) ? routesData.routes : [];
      const pagination = routesData?.pagination;

      return {
        routes: routesList,
        pagination
      };
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
 * 2. Query: Fetch Available Ports for Route Configuration
 */
export function usePortsQuery() {
  return useQuery({
    queryKey: routeKeys.ports,
    queryFn: async ({ signal }) => {
      const response = await get<ApiResponse<IPortListResponse>>("/ports", {
        params: { limit: 100, isActive: true },
        signal
      });

      const portList = response.data?.data ?? [];
      return portList as IPort[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache for ports
    refetchOnWindowFocus: false,
    retry: 1
  });
}

/**
 * 3. Mutation: Create New Ferry Route
 */
export function useCreateRouteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ICreateRoutePayload) => {
      return await post<ApiResponse<IRoute>>("/routes", payload);
    },
    onSuccess: async (response) => {
      if (response.data) {
        const createdRoute = response.data;
        queryClient.setQueriesData<{ routes: IRoute[]; pagination?: unknown }>(
          { queryKey: routeKeys.lists() },
          (oldData) => {
            if (!oldData) return { routes: [createdRoute] };
            return {
              ...oldData,
              routes: [createdRoute, ...oldData.routes.filter((r) => r.id !== createdRoute.id)]
            };
          }
        );
      }

      await queryClient.invalidateQueries({ queryKey: routeKeys.all, refetchType: "all" });
      await queryClient.refetchQueries({ queryKey: routeKeys.all });

      toast.success(response.message || "Route created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create route");
    }
  });
}

/**
 * 4. Mutation: Update Route Details
 */
export function useUpdateRouteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload
    }: {
      id: string;
      payload: IUpdateRoutePayload;
    }) => {
      return await patch<ApiResponse<IRoute>>(`/routes/${id}`, payload);
    },
    onSuccess: async (response) => {
      if (response.data) {
        const updatedRoute = response.data;
        queryClient.setQueriesData<{ routes: IRoute[]; pagination?: unknown }>(
          { queryKey: routeKeys.lists() },
          (oldData) => {
            if (!oldData) return { routes: [updatedRoute] };
            return {
              ...oldData,
              routes: oldData.routes.map((r) => (r.id === updatedRoute.id ? updatedRoute : r))
            };
          }
        );
      }

      await queryClient.invalidateQueries({ queryKey: routeKeys.all, refetchType: "all" });
      await queryClient.refetchQueries({ queryKey: routeKeys.all });

      toast.success(response.message || "Route updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update route");
    }
  });
}

/**
 * 5. Mutation: Delete Route
 */
export function useDeleteRouteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await del<ApiResponse<null>>(`/routes/${id}`);
    },
    onSuccess: async (response, deletedId) => {
      queryClient.setQueriesData<{ routes: IRoute[]; pagination?: unknown }>(
        { queryKey: routeKeys.lists() },
        (oldData) => {
          if (!oldData) return { routes: [] };
          return {
            ...oldData,
            routes: oldData.routes.filter((r) => r.id !== deletedId)
          };
        }
      );

      await queryClient.invalidateQueries({ queryKey: routeKeys.all, refetchType: "all" });
      await queryClient.refetchQueries({ queryKey: routeKeys.all });

      toast.success(response?.message || "Route deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete route");
    }
  });
}
