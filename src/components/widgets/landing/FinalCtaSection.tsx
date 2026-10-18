import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, ShieldCheck, Ship, Sparkles } from "lucide-react";

import ctaBg from "@/assets/landing-page/cta-bg.png";
import { Button } from "@/ui";

const GUARANTEES = [
  "Instant QR Confirmation",
  "No Hidden Booking Fees",
  "100% Weather Refund Guarantee",
  "24/7 Island Harbor Support"
];

export function FinalCtaSection() {
  return (
    <section className="relative mb-16 sm:mb-24 w-full overflow-hidden py-32 sm:py-40 text-center text-white">
      {/* Background Video with Image Fallback */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/assets/landing-page/cta-bg.png"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/cta-bg.mp4" type="video/mp4" />
      </video>

      {/* Fallback Image if video doesn't render */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={ctaBg}
          alt="IslandHop tropical ocean background"
          fill
          className="object-cover object-center"
        />
      </div>

      {/* Dark overlay with subtle blue tint */}
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1.5px]" />

      <div className="relative z-10 container mx-auto max-w-4xl px-4 sm:px-6">
        {/* Top Tag Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-wider text-white shadow-lg backdrop-blur-md uppercase">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span>START YOUR TROPICAL ISLAND ADVENTURE</span>
        </div>

        {/* Main Heading */}
        <h2 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
          Ready to set sail across the atolls?
        </h2>

        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-2xl text-sm font-medium text-slate-200 sm:text-base md:text-lg leading-relaxed">
          Book your island ferry in under a minute with live seat availability, instant digital boarding passes, and zero stress.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            className="h-12 rounded-2xl bg-blue-600 px-8 text-sm font-bold text-white shadow-2xl shadow-blue-600/50 transition-all hover:bg-blue-500 hover:scale-105 active:scale-95"
            asChild
          >
            <Link href="/routes" className="flex items-center gap-2">
              <span>Find a Ferry Route</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-12 rounded-2xl border-white/30 bg-white/10 px-7 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/50"
            asChild
          >
            <Link href="/#book" className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-sky-300" />
              <span>Search Timetables</span>
            </Link>
          </Button>
        </div>

        {/* Guarantees List Strip */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-300">
          {GUARANTEES.map((g) => (
            <div key={g} className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>{g}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
