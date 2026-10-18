"use client";

import Link from "next/link";

import { ArrowLeft, Home } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import { Badge, Button } from "@/ui";

interface UnderConstructionProps {
  title?: string;
  description?: string;
  badgeText?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
}

export function UnderConstruction({
  title = "Under Construction",
  description = "We are working hard to bring you this page. Please check back soon as we finalize this feature!",
  badgeText = "Coming Soon",
  showHomeButton = true,
  showBackButton = true
}: UnderConstructionProps) {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] w-full flex-col items-center justify-center px-4 py-12 text-center">
      {/* Lottie Animation Container */}
      <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
        <DotLottieReact
          src="/animations/Maintenance.lottie"
          loop
          autoplay
          className="h-auto max-h-[340px] w-full"
        />
      </div>

      {/* Typography & Content */}
      <div className="mt-4 max-w-md space-y-3">
        <Badge
          variant="outline"
          className="border-primary/30 bg-primary/10 text-primary mx-auto w-fit text-xs font-bold tracking-wider uppercase"
        >
          {badgeText}
        </Badge>

        <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
          {title}
        </h1>

        <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">{description}</p>

        {/* Action Buttons */}
        {(showHomeButton || showBackButton) && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {showBackButton && (
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
            )}

            {showHomeButton && (
              <Button asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" /> Back to Home
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
