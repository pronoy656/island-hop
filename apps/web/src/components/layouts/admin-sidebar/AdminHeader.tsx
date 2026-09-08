"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Ship } from "lucide-react";
import { ThemeSelector } from "@/widgets";
import { Button } from "@/ui";

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export function AdminHeader({
  onToggleMobileMenu,
  isMobileMenuOpen
}: AdminHeaderProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (
      pathname === "/dashboard/admin" ||
      pathname === "/dashboard/admin/overview" ||
      pathname === "/admin" ||
      pathname === "/admin/dashboard"
    ) {
      return "Overview";
    }
    if (pathname.startsWith("/dashboard/admin/providers") || pathname.startsWith("/admin/providers"))
      return "Providers Management";
    if (pathname.startsWith("/dashboard/admin/bookings") || pathname.startsWith("/admin/bookings"))
      return "Bookings Management";
    if (pathname.startsWith("/dashboard/admin/payments") || pathname.startsWith("/admin/payments"))
      return "Payments & Commissions";
    if (pathname.startsWith("/dashboard/admin/settings") || pathname.startsWith("/admin/settings"))
      return "Settings";
    return "Admin Portal";
  };

  return (
    <header className="bg-card/80 border-border/80 sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobileMenu}
          className="md:hidden h-9 w-9 text-muted-foreground"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        {/* Mobile brand logo */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
            <Ship className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm text-foreground">FerryGo</span>
        </div>

        {/* Desktop breadcrumb / section */}
        <div className="hidden items-center gap-2 text-xs md:flex">
          <span className="text-muted-foreground">Admin</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-semibold text-foreground">{getPageTitle()}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeSelector />
      </div>
    </header>
  );
}
