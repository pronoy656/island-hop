"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Ship,
  Ticket
} from "lucide-react";

import { useAuth } from "@/hooks";
import { Button } from "@/ui";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Book", href: "/", icon: Ticket },
  { name: "Routes", href: "/routes", icon: Compass },
  { name: "Manage Booking", href: "/manage-booking", icon: Ticket },
  { name: "Help", href: "/help", icon: HelpCircle }
];

export function DesktopNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isPassenger =
    isAuthenticated &&
    (user?.role?.toUpperCase() === "PASSENGER" || user?.role?.toUpperCase() === "USER");

  const visibleNavLinks = NAV_LINKS.filter((link) => {
    if (link.href === "/manage-booking") {
      return isPassenger;
    }
    return true;
  });

  return (
    <header
      className={cn(
        "sticky top-0 z-50 hidden w-full transition-all duration-300 md:block",
        isScrolled
          ? "border-b border-border/60 bg-background/85 shadow-sm shadow-slate-950/5 backdrop-blur-xl supports-backdrop-filter:bg-background/70"
          : "border-b border-border/30 bg-background/50 backdrop-blur-md supports-backdrop-filter:bg-background/30"
      )}
    >
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 transition-all duration-300 group-hover:scale-105">
              <Ship className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-xl font-extrabold tracking-tight leading-none">
                Island<span className="text-blue-600 dark:text-blue-400">Hop</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80 leading-tight">
                Ferry Express
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Navigation Pill Links */}
        <nav className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 p-1 backdrop-blur-sm">
          {visibleNavLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                  isActive
                    ? "bg-background text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-border/60"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground/70")} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 rounded-xl border-border/80 bg-background/60 px-3.5 text-xs font-bold shadow-xs hover:bg-accent/80 hover:text-foreground backdrop-blur-xs transition-all"
                asChild
              >
                <Link href="/dashboard">
                  <div className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                  </div>
                  <span>{user?.name || "Dashboard"}</span>
                  {user?.role && (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {user.role}
                    </span>
                  )}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                onClick={logout}
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log Out</span>
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 shadow-sm hover:shadow transition-all active:scale-[0.98]"
              asChild
            >
              <Link href="/login">Log in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

