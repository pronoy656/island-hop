"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Anchor } from "lucide-react";
import { ThemeSelector } from "@/widgets";
import { Button } from "@/ui";
import { PROVIDER_MOCK_DATA } from "@/data";

interface ProviderHeaderProps {
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
}

export function ProviderHeader({
  onToggleMobileMenu,
  isMobileMenuOpen
}: ProviderHeaderProps) {
  const pathname = usePathname();
  const { profile } = PROVIDER_MOCK_DATA;

  const getPageTitle = () => {
    if (
      pathname === "/dashboard/operator" ||
      pathname === "/dashboard/operator/overview" ||
      pathname === "/dashboard" ||
      pathname === "/dashboard/overview"
    ) {
      return "Overview";
    }
    if (pathname.startsWith("/dashboard/operator/ferries") || pathname.startsWith("/dashboard/ferries"))
      return "Ferries & Fleet";
    if (pathname.startsWith("/dashboard/operator/routes") || pathname.startsWith("/dashboard/routes"))
      return "Operating Routes";
    if (pathname.startsWith("/dashboard/operator/schedules") || pathname.startsWith("/dashboard/schedules"))
      return "Trip Schedules";
    if (pathname.startsWith("/dashboard/operator/off-days") || pathname.startsWith("/dashboard/off-days"))
      return "Off Days & Maintenance";
    if (pathname.startsWith("/dashboard/operator/bookings") || pathname.startsWith("/dashboard/bookings"))
      return "Bookings & Passengers";
    if (pathname.startsWith("/dashboard/operator/manifest") || pathname.startsWith("/dashboard/manifest"))
      return "Passenger Manifest";
    if (pathname.startsWith("/dashboard/operator/settings") || pathname.startsWith("/dashboard/settings"))
      return "Operator Settings";
    return "Operator Portal";
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
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-600 text-white">
            <Anchor className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm text-foreground truncate max-w-[140px]">
            {profile.companyName}
          </span>
        </div>

        {/* Desktop breadcrumb */}
        <div className="hidden items-center gap-2 text-xs md:flex">
          <span className="text-muted-foreground font-medium">{profile.companyName}</span>
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
