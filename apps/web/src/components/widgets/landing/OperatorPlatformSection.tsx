import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Ship } from "lucide-react";

import laptopMockup from "@/assets/landing-page/laptopMockup.png";
import { Button } from "@/ui";

export function OperatorPlatformSection() {
  return (
    <section className="relative overflow-hidden border-y border-slate-800 bg-slate-950 py-20 text-slate-100 md:py-28">
      {/* Ambient Lighting Gradients */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[130px]" />

      <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Left Content */}
          <div className="space-y-6 lg:col-span-5">
            {/* Top Tag Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-bold tracking-wider text-blue-400 uppercase shadow-xs">
              <Ship className="h-3.5 w-3.5 text-blue-400" />
              <span>For Ferry Operators</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[46px] lg:leading-[1.12]">
              Built for passengers. <br />
              <span className="text-blue-400">
                Powerful for ferry operators.
              </span>
            </h2>

            {/* Description */}
            <p className="text-sm font-normal leading-relaxed text-slate-300 sm:text-base">
              Manage schedules, bookings, passenger capacity, seat availability, manifests and
              boarding operations from one connected platform.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                variant="secondary"
                size="lg"
                className="h-11 rounded-xl bg-white px-6 text-xs font-bold text-slate-950 shadow-lg shadow-white/5 transition-all hover:bg-slate-100 hover:shadow-white/10 active:scale-[0.98]"
                asChild
              >
                <Link href="/login">Ferry Operator Login</Link>
              </Button>
              <Button
                variant="link"
                asChild
                className="p-0 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Link href="/dashboard" className="group inline-flex items-center gap-1.5">
                  <span>Learn about the operator platform</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Laptop Dashboard Graphic Mockup */}
          <div className="relative flex justify-center lg:col-span-7 lg:justify-end">
            {/* Glow Behind Laptop Mockup */}
            <div className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-md rounded-full bg-blue-500/15 blur-3xl" />

            <div className="relative w-full max-w-2xl transform transition-transform duration-500 hover:scale-[1.01]">
              <Image
                src={laptopMockup}
                alt="IslandHop Ferry Operator Dashboard mockup"
                className="h-auto w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

