"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Ship,
  Ticket,
  X
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useAuth } from "@/hooks";
import { Button } from "@/ui";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Book", href: "/", icon: Ticket },
  { name: "Routes", href: "/routes", icon: Compass },
  { name: "Manage Booking", href: "/manage-booking", icon: Ticket },
  { name: "Help", href: "/help", icon: HelpCircle }
];

export function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 15);
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
    <header className="sticky top-0 z-50 block w-full md:hidden">
      {/* Top Bar */}
      <div
        className={cn(
          "relative z-50 transition-all duration-300",
          isScrolled || isOpen
            ? "border-b border-border/60 bg-background/85 shadow-sm shadow-slate-950/5 backdrop-blur-xl supports-backdrop-filter:bg-background/70"
            : "border-b border-border/30 bg-background/50 backdrop-blur-md supports-backdrop-filter:bg-background/30"
        )}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5"
            onClick={() => setIsOpen(false)}
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 transition-all group-hover:scale-105">
              <Ship className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-foreground text-lg font-extrabold tracking-tight leading-none">
                Island<span className="text-blue-600 dark:text-blue-400">Hop</span>
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/80 leading-tight">
                Ferry Express
              </span>
            </div>
          </Link>

          {/* Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="h-9 w-9 rounded-xl text-foreground hover:bg-muted/80 hover:text-blue-600 transition-colors"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Slide down panel with Motion animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="border-border/60 bg-background/95 fixed inset-x-0 top-16 z-40 overflow-hidden border-b shadow-2xl backdrop-blur-2xl"
          >
            <div className="flex max-h-[calc(100vh-4rem)] flex-col justify-between overflow-y-auto p-4 space-y-4">
              {/* Navigation Links */}
              <nav className="flex flex-col gap-1 pt-2">
                {visibleNavLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all",
                        isActive
                          ? "bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 ring-1 ring-blue-600/20"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      <div className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg",
                        isActive ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Auth Action Buttons */}
              <div className="border-border/60 border-t pt-4 pb-6 space-y-2.5">
                {isAuthenticated ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-center gap-2 rounded-xl font-bold h-10 border-border/80 shadow-xs"
                      asChild
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-4 w-4 text-blue-600" />
                        <span>{user?.name || "Dashboard"}</span>
                        {user?.role && (
                          <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-auto">
                            {user.role}
                          </span>
                        )}
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 w-full justify-center gap-2 rounded-xl h-9 text-xs font-semibold"
                      onClick={() => {
                        setIsOpen(false);
                        logout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log Out</span>
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full justify-center rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-sm h-10 text-xs"
                    asChild
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/login">Log in</Link>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

