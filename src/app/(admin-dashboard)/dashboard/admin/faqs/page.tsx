import type { Metadata } from "next";
import { Suspense } from "react";
import { FaqManagementView } from "@/widgets";

export const metadata: Metadata = {
  title: "FAQ Management | Admin Dashboard | IslandHop",
  description: "Create, edit, and organize frequently asked questions for passenger help portal."
};

export default function AdminFaqsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-xs text-muted-foreground animate-pulse">
          Loading FAQ Management...
        </div>
      }
    >
      <FaqManagementView />
    </Suspense>
  );
}
