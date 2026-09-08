"use client";

import * as React from "react";
import { ProviderSidebar } from "./ProviderSidebar";
import { ProviderHeader } from "./ProviderHeader";

export interface ProviderLayoutWrapperProps {
  children: React.ReactNode;
}

export function ProviderLayoutWrapper({ children }: ProviderLayoutWrapperProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
