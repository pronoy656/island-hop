"use client";

import Link from "next/link";

import { ArrowLeft, Compass, Home } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { Badge, Button } from "@/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] w-full flex-col items-center justify-center px-4 py-16 text-center">
      {/* 1. Lottie Animation (.lottie) */}
      <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
        <DotLottieReact
          src="/animations/PageNotFound.lottie"
          loop
          autoplay
          className="h-auto max-h-[340px] w-full"
        />
      </div>

      {/* 2. Text Content & Messaging */}
      <div className="mt-2 max-w-md space-y-3">
        <Badge
          variant="outline"
          className="border-primary/30 bg-primary/10 text-primary mx-auto w-fit text-xs font-bold tracking-wider uppercase"
        >
          <Compass className="mr-1.5 h-3.5 w-3.5" /> Off Course &bull; 404
        </Badge>

        <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-4xl">
          Lost at Sea?
        </h1>

        <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
          The route or island you are looking for does not exist or may have sailed away.
        </p>

        {/* 3. Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>

          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" /> Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
