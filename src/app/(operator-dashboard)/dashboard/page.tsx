"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks";

export default function DashboardRootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoading || (isAuthenticated && !user)) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    const role = (user?.role || "").toUpperCase();
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      router.replace("/dashboard/admin");
    } else if (role === "OPERATOR") {
      router.replace("/dashboard/operator");
    } else {
      router.replace("/manage-booking");
    }
  }, [user, isAuthenticated, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-xs text-muted-foreground font-medium">Redirecting to your portal...</span>
      </div>
    </div>
  );
}
