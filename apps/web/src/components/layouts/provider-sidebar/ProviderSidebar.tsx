"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Anchor,
  CalendarX,
  ClipboardList,
  Clock,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  Ship,
  Ticket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks";
import { Button } from "@/ui";
import { PROVIDER_MOCK_DATA } from "@/data";

export interface ProviderNavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

export const PROVIDER_NAV_ITEMS: ProviderNavItem[] = [
  {
    name: "Overview",
    href: "/dashboard/operator",
    icon: LayoutDashboard
  },
  {
    name: "Ferries",
    href: "/dashboard/operator/ferries",
    icon: Ship
  },
  {
    name: "Routes",
    href: "/dashboard/operator/routes",
    icon: MapPin
  },
  {
    name: "Schedules",
    href: "/dashboard/operator/schedules",
    icon: Clock
  },
  {
    name: "Off Days",
    href: "/dashboard/operator/off-days",
    icon: CalendarX
  },
  {
    name: "Bookings",
    href: "/dashboard/operator/bookings",
    icon: Ticket
  },
  {
    name: "Manifest",
    href: "/dashboard/operator/manifest",
    icon: ClipboardList
  },
  {
    name: "Settings",
    href: "/dashboard/operator/settings",
    icon: Settings
  }
];

interface ProviderSidebarProps {
  onItemClick?: () => void;
  className?: string;
}

export function ProviderSidebar({ onItemClick, className }: ProviderSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { profile } = PROVIDER_MOCK_DATA;

  const isItemActive = (item: ProviderNavItem) => {
    if (item.name === "Overview") {
      return (
        pathname === "/dashboard/operator" ||
        pathname === "/dashboard/operator/overview" ||
        pathname === "/dashboard"
      );
    }
    return pathname.startsWith(item.href);
  };

  return (
    <aside
      className={cn(
        "bg-card text-card-foreground border-border/80 flex h-full w-64 flex-col border-r shadow-xs",
        className
      )}
    >
      {/* Brand & Provider Portal Header */}
      <div className="border-border/80 flex h-16 items-center justify-between border-b px-6">
        <Link
          href="/dashboard/operator"
          onClick={onItemClick}
          className="group flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <Anchor className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-foreground truncate max-w-[150px]">
              {profile.companyName}
            </span>
            <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              Operator Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mb-3 px-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Operator Console
        </div>
        <nav className="space-y-2">
          {PROVIDER_NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-semibold transition-all",
                  active
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    active ? "text-white" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Actions */}
      <div className="border-border/80 border-t p-4 space-y-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2.5 text-xs font-medium h-9.5"
          asChild
        >
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <span>View Public Site</span>
          </Link>
        </Button>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-sm">
              {profile.contactPerson.charAt(0)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-bold text-foreground">
                {profile.contactPerson}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {profile.email}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-muted-foreground hover:text-destructive h-8.5 w-8.5 shrink-0"
            title="Log Out"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span className="sr-only">Log Out</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
