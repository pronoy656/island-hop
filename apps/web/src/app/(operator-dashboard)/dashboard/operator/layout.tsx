import type { ReactNode } from "react";
import { ProviderLayoutWrapper } from "@/components/layouts";

export default function OperatorLayout({ children }: { children: ReactNode }) {
  return <ProviderLayoutWrapper>{children}</ProviderLayoutWrapper>;
}
