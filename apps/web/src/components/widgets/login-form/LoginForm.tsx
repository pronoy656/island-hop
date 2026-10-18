"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Anchor,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginInput } from "@repo/validators";
import { toast } from "sonner";

import { useLoginMutation } from "@/hooks";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input
} from "@/ui";

const DEMO_ACCOUNTS = [
  { label: "Passenger", email: "user001@testmail.com", pass: "Password123!" },
  { label: "Operator", email: "khaledahmednayeem.dev@gmail.com", pass: "Test@123" },
  { label: "Admin", email: "admin@example.com", pass: "strong_password_here" }
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const loginMutation = useLoginMutation();

  const defaultEmail = searchParams.get("email") || "";
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: defaultEmail,
      password: ""
    }
  });

  const getDestination = (resUserRole?: string) => {
    const fromParam = searchParams.get("redirect") || searchParams.get("from");
    if (fromParam) return fromParam;
    const normalizedRole = (resUserRole || "").toLowerCase();
    if (normalizedRole === "admin" || normalizedRole === "super_admin") {
      return "/dashboard/admin";
    }
    if (normalizedRole === "operator") {
      return "/dashboard/operator/ferries";
    }
    return "/";
  };

  const handleFillDemo = (email: string, pass: string) => {
    form.setValue("email", email, { shouldValidate: true });
    form.setValue("password", pass, { shouldValidate: true });
  };

  const onSubmit = (values: LoginInput) => {
    loginMutation.mutate(values, {
      onSuccess: (res) => {
        router.push(getDestination(res?.data?.user?.role));
      },
      onError: (err: Error) => {
        if (err.message?.toLowerCase().includes("verify your email")) {
          toast.error("Please verify your email before signing in.", {
            action: {
              label: "Verify OTP",
              onClick: () =>
                router.push(
                  `/verify-email?email=${encodeURIComponent(values.email)}`
                )
            }
          });
        }
      }
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Brand */}
      <div className="space-y-4">
        {/* Brand for Desktop */}
        <div className="hidden items-center gap-3 lg:flex">
          <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl shadow-md">
            <Anchor className="h-5 w-5" />
          </div>
          <div>
            <div className="text-foreground text-lg font-black tracking-tight">IslandHop</div>
            <div className="text-primary text-[10px] font-extrabold tracking-wider uppercase">
              SECURE PORTAL
            </div>
          </div>
        </div>

        {/* Unified Titles */}
        <div className="space-y-1">
          <h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
            Welcome back
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Sign in with your email to access your bookings, tickets, or management dashboard.
          </p>
        </div>
      </div>

      {/* Demo Credentials Quick Fill Pills */}
      <div className="border-border/60 bg-muted/40 rounded-xl border p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Quick Demo:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DEMO_ACCOUNTS.map((acc) => (
              <Button
                key={acc.label}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleFillDemo(acc.email, acc.pass)}
                disabled={loginMutation.isPending}
                className="h-7 px-2.5 text-[11px] font-medium"
              >
                {acc.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Login Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-foreground text-xs font-bold">Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="text-muted-foreground absolute top-3 left-3.5 h-4 w-4" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      className="border-input bg-card placeholder:text-muted-foreground/60 focus-visible:ring-primary h-11 rounded-xl pl-10 text-xs font-medium"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-foreground text-xs font-bold">Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-primary text-xs font-semibold hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock className="text-muted-foreground absolute top-3 left-3.5 h-4 w-4" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="border-input bg-card placeholder:text-muted-foreground/60 focus-visible:ring-primary h-11 rounded-xl pr-10 pl-10 text-xs font-medium"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-muted-foreground hover:text-foreground absolute top-3 right-3.5"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Keep me signed in Checkbox */}
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="border-border text-primary focus:ring-primary accent-primary h-4 w-4 rounded"
            />
            <label
              htmlFor="remember"
              className="text-muted-foreground cursor-pointer text-xs font-medium select-none"
            >
              Keep me signed in
            </label>
          </div>

          {/* Submit Action */}
          <Button
            type="submit"
            className="h-12 w-full rounded-xl text-sm font-bold shadow-md transition-all hover:shadow-lg"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>

      {/* Switch to Signup */}
      <div className="text-muted-foreground pt-2 text-center text-xs">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-bold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}
