"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiResponse, IBookingDetail, ICreateBookingPayload } from "@/types";
import { get, patch, post } from "@/lib/api";
import { tripKeys } from "./use-trips";

export const bookingKeys = {
  all: ["bookings"] as const,
  mine: () => [...bookingKeys.all, "my"] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (reference: string) => [...bookingKeys.details(), reference] as const,
  operator: (params?: Record<string, unknown>) => [...bookingKeys.all, "operator", params] as const,
};

/**
 * 1. Mutation: Create New Booking (Guest or Authenticated Checkout)
 */
export function useCreateBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ICreateBookingPayload) => {
      return await post<ApiResponse<IBookingDetail>>("/bookings", payload);
    },
    onSuccess: async (response) => {
      // Invalidate active trips so seats update immediately for all viewers
      await queryClient.invalidateQueries({ queryKey: tripKeys.all });
      await queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      toast.success(response.message || "Booking confirmed successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to confirm booking. Please try again.");
    },
  });
}

/**
 * 2. Query: Lookup Booking by Reference (Self-Service & Confirmation)
 */
export function useBookingLookupQuery(reference: string, emailVerification?: string) {
  return useQuery({
    queryKey: bookingKeys.detail(reference),
    queryFn: async ({ signal }) => {
      const cleanParams: Record<string, string> = {};
      if (emailVerification?.trim()) {
        cleanParams.email = emailVerification.trim();
      }

      const response = await get<ApiResponse<IBookingDetail>>(`/bookings/manage/${reference}`, {
        params: cleanParams,
        signal,
      });

      return response.data ?? null;
    },
    enabled: Boolean(reference && reference.trim().length >= 4),
    staleTime: 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("not found")) return false;
      return failureCount < 1;
    },
  });
}

/**
 * 3. Mutation: Cancel Booking (Passenger or Operator)
 */
export function useCancelBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: string; reason?: string }) => {
      return await patch<ApiResponse<null>>(`/bookings/${bookingId}/cancel`, { reason });
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: bookingKeys.all });
      await queryClient.invalidateQueries({ queryKey: tripKeys.all });
      toast.success(response?.message || "Booking cancelled successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel booking.");
    },
  });
}

/**
 * 4. Query: Get Current Logged-in User's Bookings (GET /api/v1/bookings/my)
 */
export function useMyBookingsQuery() {
  return useQuery({
    queryKey: bookingKeys.mine(),
    queryFn: async ({ signal }) => {
      const response = await get<ApiResponse<IBookingDetail[]>>("/bookings/my", {
        signal,
      });
      return response.data ?? [];
    },
    staleTime: 30 * 1000,
  });
}

