import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Clock, Compass } from "lucide-react";

import maldivesImg from "@/assets/landing-page/maldives.png";
import seaplaneImg from "@/assets/landing-page/seaplane.png";
import tropicalImg from "@/assets/landing-page/tropical.png";
import whiteSandImg from "@/assets/landing-page/whiteSand.png";

import { Button } from "@/ui";

export const POPULAR_JOURNEYS = [
  {
    id: "journey-1",
    from: "Malé",
    to: "Maafushi",
    duration: "Approx. 35 min",
    price: 30,
    image: maldivesImg,
    imageAlt: "Aerial view of Malé to Maafushi turquoise atoll"
  },
  {
    id: "journey-2",
    from: "Malé",
    to: "Thulusdhoo",
    duration: "Approx. 45 min",
    price: 30,
    image: tropicalImg,
    imageAlt: "Tropical island palm trees and white sand beach"
  },
  {
    id: "journey-3",
    from: "Malé",
    to: "Dhiffushi",
    duration: "Approx. 40 min",
    price: 30,
    image: seaplaneImg,
    imageAlt: "Seaplane over azure ocean water in the Maldives"
  },
  {
    id: "journey-4",
    from: "Malé",
    to: "Gulhi",
    duration: "Approx. 30 min",
    price: 30,
    image: whiteSandImg,
    imageAlt: "Speedboat anchored near tropical island limestone cliffs"
  }
];

export function PopularJourneysSection() {
  return (
    <section id="schedules" className="py-16 md:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase shadow-xs">
              <Compass className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              <span>Popular Journeys</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              Where are you heading?
            </h2>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Discover frequently travelled routes and check upcoming departures.
            </p>
          </div>

          <Button variant="link" asChild className="p-0 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            <Link href="/routes" className="group inline-flex items-center gap-1.5">
              <span>View all routes</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_JOURNEYS.map((journey) => (
            <div
              key={journey.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-3.5 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-500/40 hover:shadow-xl sm:p-4"
            >
              <div>
                {/* Image Container with Floating Duration Badge */}
                <div className="relative aspect-[16/11] w-full overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={journey.image}
                    alt={journey.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40" />

                  {/* Glassmorphic Duration Badge */}
                  <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
                    <Clock className="h-3 w-3 text-blue-300" />
                    <span>{journey.duration}</span>
                  </div>
                </div>

                {/* Route Title */}
                <div className="mt-4 flex items-center gap-2 text-base font-extrabold text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  <span>{journey.from}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>{journey.to}</span>
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3.5">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    FROM
                  </span>
                  <div className="text-xl font-black text-foreground leading-tight">
                    ${journey.price}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8.5 gap-1 rounded-xl border-border/80 bg-background/80 px-3.5 text-xs font-bold text-foreground shadow-2xs transition-all hover:border-blue-600 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white active:scale-95"
                  asChild
                >
                  <Link
                    href={`/routes?from=${encodeURIComponent(journey.from)}&to=${encodeURIComponent(journey.to)}`}
                    className="flex items-center"
                  >
                    <span>View trips</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

