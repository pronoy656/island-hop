"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiResponse, IDigitalPassResponse } from "@/types";
import { get } from "@/lib/api";

export const ticketKeys = {
  all: ["tickets"] as const,
  pass: (identifier: string) => [...ticketKeys.all, "pass", identifier] as const,
};

/**
 * Query: Fetch digital boarding pass by ticket number or booking reference
 */
export function useDigitalPassQuery(identifier: string) {
  return useQuery({
    queryKey: ticketKeys.pass(identifier),
    queryFn: async ({ signal }) => {
      const response = await get<ApiResponse<IDigitalPassResponse>>(`/tickets/pass/${identifier}`, {
        signal,
      });
      return response.data ?? null;
    },
    enabled: Boolean(identifier && identifier.trim().length >= 4),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
