"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LayoutDashboard, LogOut, Ship } from "lucide-react";

import { useAuth } from "@/hooks";

import { Button } from "@/ui";

const NAV_LINKS = [
  { name: "Book", href: "/" },
  { name: "Routes", href: "/routes" },
  { name: "Manage Booking", href: "/manage-booking" },
  { name: "Help", href: "/help" }
];

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();

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
    <header className="border-border/60 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
              <Ship className="h-5 w-5" />
            </div>
            <span className="text-foreground text-xl font-bold tracking-tight">
              Island<span className="text-blue-600">Hop</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="text-muted-foreground hidden items-center gap-6 text-[13px] font-medium md:flex">
            {visibleNavLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`transition-colors hover:text-blue-600 ${
                    isActive ? "font-semibold text-blue-600" : ""
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* <ThemeSelector />
          <AnimatedThemeToggler /> */}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs font-semibold"
                asChild
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>{user?.name || "Dashboard"}</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive h-9 w-9"
                onClick={logout}
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground px-2 py-1 text-[13px] font-medium transition-colors"
              >
                Log in
              </Link>
              <Button
                size="sm"
                className="h-9 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
                asChild
              >
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
