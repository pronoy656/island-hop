import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { Ship } from "lucide-react";

import authBg from "@/assets/auth/bg.png";

export default function AuthenticationLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left Side: Brand Visual with bg.jpg & Maritime Banner */}
      <div className="relative hidden w-full overflow-hidden bg-slate-950 lg:flex lg:w-5/12 xl:w-1/2">
        <Image
          src={authBg}
          alt="Cruise ferry vessel sailing on sea"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Ocean Deep Blue / Navy Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/60 to-slate-950/40" />

        <div className="relative z-10 flex h-full w-full flex-col justify-between p-12 lg:p-16">
          {/* Top Logo Watermark / Icon */}
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl shadow-lg">
              <Ship className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">IslandHop</span>
          </Link>

          {/* Bottom Headline & Subtitle */}
          <div className="max-w-md space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white backdrop-blur-md">
              <Ship className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white xl:text-5xl">
              Powering <br />
              Seamless <br />
              Maritime <br />
              Journeys.
            </h1>
            <p className="text-sm leading-relaxed text-slate-300 xl:text-base">
              The industry standard for managing ferry fleets, optimizing routes, and delivering
              exceptional passenger experiences.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form Container */}
      <div className="bg-background flex flex-1 flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16">
        {/* Mobile Header Logo */}
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl shadow-md">
              <Ship className="h-5 w-5" />
            </div>
            <span className="text-foreground text-xl font-bold tracking-tight">IslandHop</span>
          </Link>
        </div>

        {/* Form Slot */}
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-4">
          {children}
        </div>

        {/* Footer Legal & Support Links */}
        <div className="text-muted-foreground mt-8 flex flex-wrap items-center justify-center gap-6 text-xs">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/help" className="hover:text-foreground transition-colors">
            Provider Support
          </Link>
        </div>
      </div>
    </div>
  );
}
