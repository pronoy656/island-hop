import {
  Clock,
  Compass,
  Headphones,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const VALUE_PROPS = [
  {
    icon: Compass,
    title: "Live GPS & Seat Matrix",
    description: "Real-time vessel departure tracking and direct deck seat selection.",
    iconBg: "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
  },
  {
    icon: ShieldCheck,
    title: "Guaranteed Boarding",
    description: "Encrypted payments and confirmed manifests across all island terminals.",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
  },
  {
    icon: QrCode,
    title: "Instant Mobile E-Tickets",
    description: "Ready-to-scan QR boarding passes with offline wallet capability.",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400"
  },
  {
    icon: Headphones,
    title: "24/7 Harbor Concierge",
    description: "Live traveler assistance, luggage tracking, and weather updates.",
    iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"
  }
];

const TRUST_METRICS = [
  { value: "50K+", label: "Passengers Carried", icon: Users },
  { value: "12+", label: "Licensed Ferry Fleets", icon: Compass },
  { value: "99.8%", label: "On-Time Departures", icon: Clock },
  { value: "4.9/5", label: "Passenger Review Score", icon: Star }
];

export function ValuePropositionsSection() {
  return (
    <section className="pt-8 pb-4">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Value Prop Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_PROPS.map((prop) => {
            const Icon = prop.icon;
            return (
              <div
                key={prop.title}
                className="group relative flex items-start gap-4 rounded-3xl border border-border/80 bg-card/90 p-5 shadow-xs backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-500/50 hover:bg-card hover:shadow-xl"
              >
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-xs transition-transform duration-300 group-hover:scale-110",
                    prop.iconBg
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-black tracking-tight text-foreground transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {prop.title}
                  </h4>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-muted-foreground">
                    {prop.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Social Proof Stats Strip */}
        <div className="mt-6 rounded-3xl border border-border/70 bg-gradient-to-r from-muted/50 via-card to-muted/50 p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-4 divide-y sm:grid-cols-4 sm:divide-y-0 sm:divide-x divide-border/60">
            {TRUST_METRICS.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="flex flex-col items-center justify-center text-center p-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                      {metric.value}
                    </span>
                  </div>
                  <span className="mt-0.5 text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {metric.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
