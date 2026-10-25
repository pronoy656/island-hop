"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks";

export default function ManageBookingLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const role = (user?.role || "").toUpperCase();
  const isOperator = isAuthenticated && role === "OPERATOR";
  const isAdmin = isAuthenticated && (role === "ADMIN" || role === "SUPER_ADMIN");
  const isPassenger = isAuthenticated && (role === "USER" || role === "PASSENGER");

  React.useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isOperator) {
      router.replace("/dashboard/operator");
      return;
    }

    if (isAdmin) {
      router.replace("/dashboard/admin");
      return;
    }
  }, [user, isAuthenticated, isLoading, isOperator, isAdmin, router, pathname]);

  if (isLoading || !isAuthenticated || isOperator || isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-xs text-muted-foreground font-medium">
            {!isAuthenticated
              ? "Redirecting to login..."
              : isOperator
              ? "Redirecting to operator portal..."
              : isAdmin
              ? "Redirecting to admin portal..."
              : "Loading passenger portal..."}
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
