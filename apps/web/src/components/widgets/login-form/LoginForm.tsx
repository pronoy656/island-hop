"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Anchor,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Ship,
  Sparkles,
  User
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginInput } from "@repo/validators";

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

type UserRole = "passenger" | "operator";

const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string; label: string }> = {
  passenger: {
    email: "jane@islandhop.com",
    pass: "123456",
    label: "Passenger Demo"
  },
  operator: {
    email: "operator@islandhop.com",
    pass: "123456",
    label: "Ferry Operator Demo"
  }
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<UserRole>("passenger");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const from = searchParams.get("from") || (role === "operator" ? "/dashboard" : "/");
  const loginMutation = useLoginMutation();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    form.reset({
      email: "",
      password: ""
    });
  };

  const handleFillAndSubmitDemo = () => {
    const creds = DEMO_CREDENTIALS[role];
    form.setValue("email", creds.email, { shouldValidate: true });
    form.setValue("password", creds.pass, { shouldValidate: true });

    loginMutation.mutate(
      { email: creds.email, password: creds.pass },
      {
        onSuccess: () => {
          router.push(from);
        }
      }
    );
  };

  const onSubmit = (values: LoginInput) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        router.push(from);
      }
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Brand */}
      <div className="space-y-4">
        {/* Brand with Badge for Desktop */}
        <div className="hidden items-center gap-3 lg:flex">
          <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl shadow-md">
            <Anchor className="h-5 w-5" />
          </div>
          <div>
            <div className="text-foreground text-lg font-black tracking-tight">IslandHop</div>
            <div className="text-primary text-[10px] font-extrabold tracking-wider uppercase">
              {role === "operator" ? "PROVIDER PORTAL" : "PASSENGER PORTAL"}
            </div>
          </div>
        </div>

        {/* Role Toggle Switcher */}
        <div className="bg-muted/60 border-border flex rounded-xl border p-1">
          <button
            type="button"
            onClick={() => handleRoleChange("passenger")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              role === "passenger"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Passenger
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("operator")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              role === "operator"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Ship className="h-3.5 w-3.5" />
            Ferry Operator
          </button>
        </div>

        {/* Dynamic Titles */}
        <div className="space-y-1 pt-2">
          <h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
            Welcome back
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {role === "operator"
              ? "Sign in to manage your ferries, routes, schedules, bookings, and passenger operations."
              : "Sign in to view your tickets, manage bookings, and enjoy easy ferry travel."}
          </p>
        </div>
      </div>

      {/* Demo Credentials Quick Fill Action */}
      <div className="border-primary/20 bg-primary/5 rounded-xl border p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="text-primary flex items-center gap-1.5 text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{DEMO_CREDENTIALS[role].label}</span>
            </div>
            <div className="text-muted-foreground font-mono text-[11px]">
              {DEMO_CREDENTIALS[role].email} &bull; {DEMO_CREDENTIALS[role].pass}
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleFillAndSubmitDemo}
            disabled={loginMutation.isPending}
            className="border-primary/30 hover:bg-primary hover:text-primary-foreground h-8 text-xs font-bold transition-all"
          >
            <KeyRound className="mr-1.5 h-3.5 w-3.5" />
            1-Click Demo
          </Button>
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
        {role === "operator" ? "Don't have a provider account? " : "Don't have an account? "}
        <Link href={`/signup?role=${role}`} className="text-primary font-bold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}
