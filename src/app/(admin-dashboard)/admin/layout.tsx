import type { ReactNode } from "react";
import { AdminLayoutWrapper } from "@/components/layouts";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}

