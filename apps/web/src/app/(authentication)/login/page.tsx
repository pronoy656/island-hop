import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "@/widgets";

export const metadata: Metadata = {
  title: "Sign In | IslandHop",
  description: "Sign in to access your ferry bookings or operator dashboard."
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
