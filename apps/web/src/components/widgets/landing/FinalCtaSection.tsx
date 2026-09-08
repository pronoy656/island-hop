import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/ui";

export function FinalCtaSection() {
  return (
    <section className="relative mb-16 sm:mb-24 w-full overflow-hidden py-36 sm:py-44 text-center text-white">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/cta-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 container mx-auto max-w-4xl px-4">
        <h2 className="text-3xl font-black tracking-tight sm:text-5xl">Ready when you are.</h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-slate-200 sm:text-base">
          Find your next ferry and reserve your seat in minutes.
        </p>

        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            variant="secondary"
            className="h-12 rounded-xl px-8 font-bold shadow-xl transition-all hover:scale-105"
            asChild
          >
            <Link href="/routes">
              Find a Ferry <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
