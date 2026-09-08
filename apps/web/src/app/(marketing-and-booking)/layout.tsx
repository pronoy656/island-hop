import type { ReactNode } from "react";

import { DesktopNavbar, Footer, MobileNavbar } from "@/components/layouts";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <DesktopNavbar />
      <MobileNavbar />
      <main className="-mt-(--header-h) flex-1">{children}</main>
      <Footer />
    </div>
  );
}
