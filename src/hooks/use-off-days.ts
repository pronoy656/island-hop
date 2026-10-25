import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ApiResponse,
  ICreateOffDayPayload,
  IOffDay,
  IOffDayFilterParams,
  IOffDayListResponse,
  IUpdateOffDayPayload
} from "@/types";
import { del, get, patch, post } from "@/lib/api";

export const offDayKeys = {
  all: ["operator", "off-days"] as const,
  lists: () => [...offDayKeys.all, "list"] as const,
  list: (params?: IOffDayFilterParams) => [...offDayKeys.lists(), params] as const,
  details: () => [...offDayKeys.all, "detail"] as const,
  detail: (id: string) => [...offDayKeys.details(), id] as const
};

export function useOffDaysQuery(params?: IOffDayFilterParams) {
  return useQuery({
    queryKey: offDayKeys.list(params),
    queryFn: async ({ signal }) => {
      const cleanParams: Record<string, string | number> = {};
      if (params?.year) cleanParams.year = params.year;
      if (params?.ferryId && params.ferryId !== "ALL") cleanParams.ferryId = params.ferryId;
      if (params?.category && params.category !== ("ALL" as any)) cleanParams.category = params.category;
      if (params?.page) cleanParams.page = params.page;
      if (params?.limit) cleanParams.limit = params.limit;

      const response = await get<ApiResponse<IOffDayListResponse>>("/off-days", {
        params: cleanParams,
        signal
      });

      const dataObj = response.data;
      const offDays = Array.isArray(dataObj?.data) ? dataObj.data : [];
      const meta = dataObj?.meta;

      return {
        offDays,
        meta
      };
    },
    staleTime: 0,
    refetchOnWindowFocus: true
  });
}

export function useCreateOffDayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ICreateOffDayPayload) => {
      return await post<ApiResponse<IOffDay>>("/off-days", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: offDayKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to schedule blackout date.");
    }
  });
}

export function useUpdateOffDayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: IUpdateOffDayPayload }) => {
      return await patch<ApiResponse<IOffDay>>(`/off-days/${id}`, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: offDayKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update blackout date.");
    }
  });
}

export function useDeleteOffDayMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await del<ApiResponse<null>>(`/off-days/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: offDayKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove blackout date.");
    }
  });
}
