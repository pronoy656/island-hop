import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  ApiResponse,
  ICreateSchedulePayload,
  IOperatorSchedule,
  IOperatorScheduleListResponse,
  IScheduleFilterParams,
  IUpdateSchedulePayload,
  OperatorScheduleStatus
} from "@/types";
import { del, get, patch, post } from "@/lib/api";

/**
 * Schedule Query Key Factory
 */
export const scheduleKeys = {
  all: ["operator", "schedules"] as const,
  lists: () => [...scheduleKeys.all, "list"] as const,
  list: (params?: IScheduleFilterParams) => [...scheduleKeys.lists(), params] as const,
  details: () => [...scheduleKeys.all, "detail"] as const,
  detail: (id: string) => [...scheduleKeys.details(), id] as const
};

/**
 * 1. Query: Fetch Operator Schedules with optional filters (date, status, routeId, pagination)
 */
export function useOperatorSchedulesQuery(params?: IScheduleFilterParams) {
  return useQuery({
    queryKey: scheduleKeys.list(params),
    queryFn: async ({ signal }) => {
      const cleanParams: Record<string, string | number> = {};
      if (params?.date && params.date.trim()) cleanParams.date = params.date.trim();
      if (params?.status && params.status !== "ALL" && params.status.trim()) {
        cleanParams.status = params.status;
      }
      if (params?.routeId && params.routeId !== "ALL" && params.routeId.trim()) {
        cleanParams.routeId = params.routeId;
      }
      if (params?.page) cleanParams.page = params.page;
      if (params?.limit) cleanParams.limit = params.limit;

      const response = await get<ApiResponse<IOperatorScheduleListResponse | IOperatorSchedule[]>>(
        "/operator/schedules",
        {
          params: cleanParams,
          signal
        }
      );

      let items: IOperatorSchedule[] = [];
      let meta: IOperatorScheduleListResponse["meta"] | undefined;

      if (response.data) {
        if (Array.isArray(response.data)) {
          items = response.data;
        } else if (Array.isArray((response.data as IOperatorScheduleListResponse).data)) {
          items = (response.data as IOperatorScheduleListResponse).data;
          meta = (response.data as IOperatorScheduleListResponse).meta;
        }
      }

      return {
        schedules: items,
        meta
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
 * 2. Mutation: Create New Departure Schedule Slot
 */
export function useCreateScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ICreateSchedulePayload) => {
      return await post<ApiResponse<IOperatorSchedule>>("/operator/schedules", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success("Departure schedule slot created successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create departure schedule slot.");
    }
  });
}

/**
 * 3. Mutation: Update Existing Schedule Slot
 */
export function useUpdateScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: IUpdateSchedulePayload }) => {
      return await patch<ApiResponse<IOperatorSchedule>>(`/operator/schedules/${id}`, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success("Departure schedule updated successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update departure schedule.");
    }
  });
}

/**
 * 4. Mutation: Update Live Operational Status (ON_TIME, BOARDING, DEPARTED, DELAYED, CANCELLED)
 */
export function useUpdateScheduleStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OperatorScheduleStatus }) => {
      return await patch<ApiResponse<IOperatorSchedule>>(`/operator/schedules/${id}/status`, {
        status
      });
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success(`Schedule status changed to ${variables.status.replace("_", " ")}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change schedule status.");
    }
  });
}

/**
 * 5. Mutation: Delete Schedule Slot
 */
export function useDeleteScheduleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await del<ApiResponse<null>>(`/operator/schedules/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast.success("Schedule slot deleted successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete schedule slot.");
    }
  });
}
