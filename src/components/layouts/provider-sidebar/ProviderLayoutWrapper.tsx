"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks";
import { ProviderSidebar } from "./ProviderSidebar";
import { ProviderHeader } from "./ProviderHeader";

export interface ProviderLayoutWrapperProps {
  children: React.ReactNode;
}

export function ProviderLayoutWrapper({ children }: ProviderLayoutWrapperProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
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

    if (isAdmin) {
      router.replace("/dashboard/admin");
      return;
    }

    if (isPassenger) {
      router.replace("/manage-booking");
      return;
    }
  }, [user, isAuthenticated, isLoading, isAdmin, isPassenger, router, pathname]);

  if (isLoading || !isAuthenticated || !isOperator) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
          <span className="text-xs text-muted-foreground font-medium">
            {!isAuthenticated
              ? "Redirecting to login..."
              : isAdmin
              ? "Redirecting to admin portal..."
              : isPassenger
              ? "Redirecting to passenger portal..."
              : "Verifying operator credentials..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 flex min-h-screen">
      {/* Desktop Sidebar (Fixed / Sticky) */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
        <ProviderSidebar />
      </div>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 z-50 w-72 max-w-[80vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <ProviderSidebar onItemClick={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        <ProviderHeader
          isMobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
        />
        <main className="flex-1 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
