import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileCheck2,
  QrCode,
  ShieldCheck,
  Ship,
  Sparkles,
  Zap
} from "lucide-react";

import laptopMockup from "@/assets/landing-page/laptopMockup.png";
import { Button } from "@/ui";

const OPERATOR_BENEFITS = [
  {
    icon: FileCheck2,
    title: "Instant Digital Manifests",
    description: "Export Coast Guard & Maritime compliant passenger lists with 1 click."
  },
  {
    icon: QrCode,
    title: "1-Second Gate Scanner App",
    description: "Fast-track boarding with our high-speed mobile ticket scanner."
  },
  {
    icon: BarChart3,
    title: "Dynamic Capacity & Yield",
    description: "Maximize seat fill rates with automated schedule and fare adjustments."
  },
  {
    icon: Zap,
    title: "Automated Daily Payouts",
    description: "Receive instant electronic settlement directly to your business account."
  }
];

export function OperatorPlatformSection() {
  return (
    <section className="relative overflow-hidden border-y border-slate-800 bg-[#060e1d] py-20 text-slate-100 md:py-32">
      {/* Ambient Lighting Gradients */}
      <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[140px]" />

      <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-14">
          {/* Left Content */}
          <div className="space-y-6 lg:col-span-6">
            {/* Top Tag Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-bold tracking-wider text-blue-400 uppercase shadow-xs">
              <Ship className="h-3.5 w-3.5 text-blue-400" />
              <span>FOR FERRY & SPEEDBOAT OPERATORS</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl lg:leading-[1.1]">
              Built for passengers. <br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Engineered for operators.
              </span>
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base font-normal leading-relaxed text-slate-300">
              Transform your maritime fleet operations. Manage departures, live seat inventories, passenger manifests, crew dispatch, and automated financial settlements in one centralized console.
            </p>

            {/* Operator Feature Points Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {OPERATOR_BENEFITS.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.title}
                    className="flex flex-col gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5 shadow-sm transition-colors hover:border-blue-500/30"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-white">{b.title}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{b.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Button
                variant="secondary"
                size="lg"
                className="h-11 rounded-xl bg-blue-600 px-6 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-600/40 active:scale-[0.98]"
                asChild
              >
                <Link href="/login">Operator Console Login</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-11 rounded-xl border-slate-700 bg-transparent px-5 text-xs font-bold text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800/80 hover:text-white"
              >
                <Link href="/dashboard" className="group inline-flex items-center gap-1.5">
                  <span>Explore Partner Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Laptop Dashboard Graphic Mockup */}
          <div className="relative flex justify-center lg:col-span-6 lg:justify-end">
            {/* Glow Behind Laptop Mockup */}
            <div className="pointer-events-none absolute inset-0 -z-10 mx-auto max-w-lg rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative w-full max-w-2xl transform transition-transform duration-500 hover:scale-[1.01]">
              <Image
                src={laptopMockup}
                alt="IslandHop Ferry Operator Dashboard mockup"
                className="h-auto w-full object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.8)]"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
