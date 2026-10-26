"use client";

import * as React from "react";
import { PortManagementView } from "@/widgets";

export default function AdminPortsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-xs text-muted-foreground animate-pulse">Loading ports...</div>}>
      <PortManagementView />
    </React.Suspense>
  );
}
