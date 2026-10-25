import { useQuery } from "@tanstack/react-query";
import type {
  ApiResponse,
  IAdminUserItem,
  UserFilterParams
} from "@/types";
import { get } from "@/lib/api";

/**
 * Users Query Key Factory
 */
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params?: UserFilterParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const
};

/**
 * 1. Query: Fetch Paginated & Filtered Platform Users (Customers, Operators, Admins)
 */
export function useUsersQuery(params?: UserFilterParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async ({ signal }) => {
      const cleanParams: Record<string, string | number> = {};

      const searchVal = (params?.searchTerm || params?.search || "").trim();
      if (searchVal) {
        cleanParams.searchTerm = searchVal;
      }

      if (params?.role && params.role !== "ALL" && params.role !== "all" && params.role.trim()) {
        cleanParams.role = params.role.trim();
      }

      if (params?.status && params.status !== "ALL" && params.status !== "all" && params.status.trim()) {
        cleanParams.status = params.status.trim();
      }

      if (params?.page) cleanParams.page = params.page;
      if (params?.limit) cleanParams.limit = Math.min(params.limit, 100);
      if (params?.sortOrder) cleanParams.sortOrder = params.sortOrder;

      const response = await get<
        ApiResponse<IAdminUserItem[]> & {
          pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPage?: number;
            totalPages?: number;
          };
        }
      >("/users", {
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
        : response.meta ?? {
            page: 1,
            limit: 10,
            total: (response.data ?? []).length,
            totalPages: 1
          };

      return {
        users: response.data ?? [],
        meta: normalizedMeta
      };
    },
    staleTime: 0,
    placeholderData: (previousData) => previousData
  });
}

/**
 * 2. Query: Fetch Single User Details by ID
 */
export function useUserDetailQuery(userId: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: async ({ signal }) => {
      const response = await get<ApiResponse<IAdminUserItem>>(`/users/${userId}`, {
        signal
      });
      return response.data;
    },
    enabled: Boolean(userId) && enabled,
    staleTime: 1000 * 60 * 3
  });
}
