"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarCheck,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Settings,
  Ship,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks";
import { Button } from "@/ui";

export interface AdminNavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    name: "Overview",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
    exact: false
  },
  {
    name: "Providers",
    href: "/dashboard/admin/providers",
    icon: Building2
  },
  {
    name: "Bookings",
    href: "/dashboard/admin/bookings",
    icon: CalendarCheck
  },
  {
    name: "Payments & Commissions",
    href: "/dashboard/admin/payments",
    icon: CircleDollarSign
  },
  {
    name: "Settings",
    href: "/dashboard/admin/settings",
    icon: Settings
  }
];

interface AdminSidebarProps {
  onItemClick?: () => void;
  className?: string;
}

export function AdminSidebar({ onItemClick, className }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isItemActive = (item: AdminNavItem) => {
    if (item.name === "Overview") {
      return (
        pathname === "/dashboard/admin" ||
        pathname === "/dashboard/admin/overview" ||
        pathname === "/admin"
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
      {/* Brand & Portal Header */}
      <div className="border-border/80 flex h-16 items-center justify-between border-b px-6">
        <Link
          href="/dashboard/admin"
          onClick={onItemClick}
          className="group flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <Ship className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-foreground">
              FerryGo
            </span>
            <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Admin Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-3 px-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          Menu
        </div>
        <nav className="space-y-2">
          {ADMIN_NAV_ITEMS.map((item) => {
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
                    ? "bg-blue-600 text-white shadow-xs font-bold"
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
            <div className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-bold text-foreground">
                {user?.name || "Admin User"}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {user?.email || "admin@ferrygo.com"}
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
