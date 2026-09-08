import type { ReactNode } from "react";
import { AdminLayoutWrapper } from "@/components/layouts";

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
