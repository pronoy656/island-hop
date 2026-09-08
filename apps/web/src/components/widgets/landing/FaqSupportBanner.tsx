import Link from "next/link";
import { ArrowRight, Headphones } from "lucide-react";

import { Button } from "@/ui";

export function FaqSupportBanner() {
  return (
    <section className="py-10 sm:py-12">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-50/60 via-card to-indigo-50/40 dark:from-blue-950/30 dark:via-card dark:to-indigo-950/20 p-6 sm:p-7 shadow-xs">
          {/* Subtle Ambient Decorative Glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl" />

          <div className="relative z-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
            {/* Left Content with Icon */}
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
                <Headphones className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold tracking-tight text-foreground sm:text-lg">
                  Questions before you travel?
                </h3>
                <p className="text-xs font-normal leading-relaxed text-muted-foreground sm:text-sm">
                  Find answers about booking, payments, cancellations, luggage and boarding.
                </p>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-xl border-border/80 bg-background/80 px-4 text-xs font-bold text-foreground shadow-2xs hover:bg-muted transition-all"
                asChild
              >
                <Link href="/help">Visit Help Center</Link>
              </Button>
              <Button
                size="sm"
                className="group relative h-10 gap-1.5 overflow-hidden rounded-xl bg-blue-600 hover:bg-blue-700 px-5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-[0.98]"
                asChild
              >
                <Link href="/help" className="flex items-center gap-1.5">
                  <span>Contact Support</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

