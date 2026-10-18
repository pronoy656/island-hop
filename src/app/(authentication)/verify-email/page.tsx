import { Suspense } from "react";
import type { Metadata } from "next";

import { VerifyEmailView } from "@/widgets";

export const metadata: Metadata = {
  title: "Verify Email | IslandHop",
  description: "Verify your email address using the 6-digit OTP code sent to you."
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm">Loading verification...</div>}>
      <VerifyEmailView />
    </Suspense>
  );
}
