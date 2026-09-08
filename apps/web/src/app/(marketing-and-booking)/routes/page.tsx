import type { Metadata } from "next";
import Image from "next/image";

import { Ship } from "lucide-react";

import heroBg from "@/assets/routes/route-bg.png";

import { POPULAR_ROUTES } from "@/data/routes";

import { RouteCard, RouteSearchFilterBar, RoutesValueProps } from "@/widgets";
import { AnimatedSection, Card, CardContent } from "@/ui";

export const metadata: Metadata = {
  title: "Explore Island Routes | IslandHop",
  description:
    "Discover connections between islands and plan your next journey across the Maldives."
};

export default function RoutesPage() {
  return (
    <div className="flex min-h-screen flex-col pb-20">
      {/* 1. Hero Banner with Ferry Background */}
      <AnimatedSection initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} delay={0}>
        <section className="bg-background relative w-full overflow-hidden pt-12 pb-24 md:pt-16 md:pb-28">
          {/* Background Ferry Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src={heroBg}
              alt="Cruise ferry on turquoise ocean"
              fill
              priority
              className="object-cover object-center"
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="from-background via-background/20 absolute inset-0 bg-gradient-to-r to-transparent md:hidden" />
          </div>

          <div className="relative z-10 container mx-auto max-w-7xl p-4 sm:px-6 md:py-10 lg:px-8 lg:py-20">
            <div className="max-w-xl space-y-4">
              <div className="text-primary bg-card bg-opacity/30 flex w-fit items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold tracking-wider uppercase">
                <Ship className="text-primary h-4 w-4" /> ROUTES
              </div>

              <h1 className="text-foreground text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Explore our <br />
                <span className="text-primary">ferry routes</span>
              </h1>

              {/* Feature pill badge card inside hero */}
              <div className="pt-2">
                <Card className="border-border/80 dark:bg-card/90 w-fit rounded-2xl border bg-white/95 p-3.5 shadow-sm backdrop-blur-md">
                  <CardContent className="flex items-center gap-3 p-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#003B95]/10 text-[#003B95] dark:bg-blue-950/50 dark:text-blue-400">
                      <Ship className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5 pr-2">
                      <h4 className="text-foreground text-xs font-bold">
                        Multiple daily trips to popular destinations
                      </h4>
                      <p className="text-muted-foreground text-[11px]">
                        Find the best route for your adventure.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* 2. Floating Search by Port Filter Bar */}
      <AnimatedSection
        delay={0.05}
        className="relative z-20 mx-auto -mt-14 w-full max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <RouteSearchFilterBar />
      </AnimatedSection>

      {/* 3. Popular Routes Grid */}
      <main className="container mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <AnimatedSection delay={0.05} className="mb-6 space-y-1">
          <h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
            Popular Routes
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            Browse our most popular ferry routes and see what&apos;s possible.
          </p>
        </AnimatedSection>

        {/* 6 Grid Route Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_ROUTES.map((route) => (
            <AnimatedSection key={route.id} delay={0.05}>
              <RouteCard route={route} />
            </AnimatedSection>
          ))}
        </div>

        {/* 4. Bottom Value Proposition Feature Icons */}
        <AnimatedSection delay={0.1} className="border-border/60 mt-20 border-t pt-10">
          <RoutesValueProps />
        </AnimatedSection>
      </main>
    </div>
  );
}
