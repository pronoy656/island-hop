import { Suspense } from "react";
import type { Metadata } from "next";

import { SignupForm } from "@/widgets";

export const metadata: Metadata = {
  title: "Sign Up | IslandHop",
  description: "Create an IslandHop account to book ferries or manage maritime fleet operations."
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground text-sm">Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
