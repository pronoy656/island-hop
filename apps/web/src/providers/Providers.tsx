"use client";

import type { ReactNode } from "react";

import { NuqsAdapter } from "nuqs/adapters/next/app";

import { AuthProvider, QueryProvider, ThemePresetProvider, ThemeProvider } from "@/providers";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <ThemeProvider>
        <ThemePresetProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </ThemePresetProvider>
      </ThemeProvider>
    </NuqsAdapter>
  );
}
