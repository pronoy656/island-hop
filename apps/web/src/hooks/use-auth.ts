import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { ApiResponse } from "@repo/types";

import { get, post } from "@/lib/api";

import { useAuth } from "@/providers/AuthProvider";

import type { AuthUser, LoginCredentials, SignupCredentials } from "@/types";

export { useAuth };

interface LoginApiResult {
  accessToken: string;
  refreshToken?: string;
  user?: AuthUser;
}

export function useLoginMutation() {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await post<ApiResponse<LoginApiResult>>("/auth/login", credentials);
      return response;
    },
    onSuccess: (response) => {
      if (response.data?.accessToken) {
        login(response.data.accessToken, response.data.user);
        queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
        toast.success(response.message || "Welcome back! Login successful.");
      }
    },
    onError: (error: Error) => {
      if (!error.message?.toLowerCase().includes("verify your email")) {
        toast.error(error.message || "Failed to log in");
      }
    }
  });
}

export function useSignupMutation() {
  return useMutation({
    mutationFn: async (credentials: SignupCredentials) => {
      const rawPhone = (credentials.phoneNumber || credentials.phone || "").trim();
      const cleanPhone = rawPhone.replace(/[\s\-()]/g, "");
      const payload = {
        ...credentials,
        email: credentials.email.trim().toLowerCase(),
        phoneNumber: cleanPhone,
        phone: cleanPhone
      };
      const response = await post<ApiResponse<AuthUser>>("/auth/register", payload);
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Account registered successfully! Please check your email for verification.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create account");
    }
  });
}

export function useUserProfileQuery(enabled = true) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["user", "profile"],
    queryFn: async () => {
      const response = await get<ApiResponse<AuthUser>>("/user/profile");
      return response.data;
    },
    enabled: isAuthenticated && enabled,
    staleTime: 1000 * 60 * 5
  });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: async (payload: { email: string; otp: string }) => {
      const response = await post<ApiResponse<{ id: string; email: string; status: string }>>(
        "/auth/verify-email",
        {
          email: payload.email.trim().toLowerCase(),
          otp: payload.otp.trim()
        }
      );
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Email verified successfully! You can now log in.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Verification failed. Please check your OTP.");
    }
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: async (payload: { email: string }) => {
      const response = await post<ApiResponse<null>>("/auth/verify-email/resend", {
        email: payload.email.trim().toLowerCase()
      });
      return response;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Verification OTP sent! Please check your inbox.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resend verification code");
    }
  });
}
