import {
  Armchair,
  CheckCircle2,
  Navigation,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Ship,
  Sparkles,
  Sun,
  Waves,
  Wifi,
  Wind
} from "lucide-react";

const FEATURES = [
  {
    icon: QrCode,
    badge: "Fast Track Boarding",
    title: "Instant Digital QR Boarding",
    description:
      "Say goodbye to long paper ticket lines under the hot sun. Just flash your phone QR code at the harbor terminal gate and hop aboard in seconds.",
    bullets: ["Apple & Google Wallet sync", "Offline pass access without cell reception", "Zero paper waste"],
    gradient: "from-blue-600/10 via-blue-500/5 to-transparent",
    iconColor: "text-blue-600 dark:text-blue-400 bg-blue-500/10"
  },
  {
    icon: Navigation,
    badge: "Live Marine Radar",
    title: "Real-Time Vessel ETA & Dock Radar",
    description:
      "Know exactly where your ferry is on the ocean. Track approaching vessels, scheduled harbor docks, and live maritime weather notifications.",
    bullets: ["GPS live boat telemetry", "Departure terminal pier notifications", "Ocean conditions radar"],
    gradient: "from-indigo-600/10 via-indigo-500/5 to-transparent",
    iconColor: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10"
  },
  {
    icon: Armchair,
    badge: "Deck Experience",
    title: "Interactive Deck & Seat Selection",
    description:
      "Pick your preferred vantage point before you step on the boat. Choose between air-conditioned lower cabins or breezy open-air sun decks with 360° ocean views.",
    bullets: ["Air-conditioned cabin seats", "Open panoramic sundeck", "Dedicated surfboard & luggage spots"],
    gradient: "from-sky-600/10 via-sky-500/5 to-transparent",
    iconColor: "text-sky-600 dark:text-sky-400 bg-sky-500/10"
  },
  {
    icon: ShieldCheck,
    badge: "Guaranteed Confidence",
    title: "100% Weather & Flexible Guarantee",
    description:
      "Tropical sea weather can be unpredictable. Enjoy free schedule adjustments and instant refunds if sea conditions lead to operator cancellations.",
    bullets: ["Free reschedule up to 2 hours prior", "Instant 100% weather refund", "24/7 harbor master support"],
    gradient: "from-emerald-600/10 via-emerald-500/5 to-transparent",
    iconColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3.5 py-1 text-xs font-bold tracking-wider text-blue-600 uppercase shadow-xs dark:text-blue-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>THE ISLANDHOP ADVANTAGE</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Designed for Modern Sea Travelers
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Every feature is crafted to make island transit as effortless and reliable as a metropolitan express train.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-7 sm:p-9 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-500/40 hover:shadow-xl"
              >
                {/* Background Subtle Gradient */}
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-70 transition-opacity group-hover:opacity-100`}
                />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-xs transition-transform duration-300 group-hover:scale-110 ${feature.iconColor}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-[11px] font-bold text-muted-foreground">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    {feature.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-normal text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="space-y-2 border-t border-border/50 pt-4">
                    {feature.bullets.map((bullet) => (
                      <div key={bullet} className="flex items-center gap-2.5 text-xs font-semibold text-foreground/90">
                        <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        <span>{bullet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
