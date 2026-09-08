import { Bell, Compass, QrCode, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const VALUE_PROPS = [
  {
    icon: Compass,
    title: "Live Availability",
    description: "Real-time vessel schedules & seat tracking.",
    iconBg: "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
  },
  {
    icon: ShieldCheck,
    title: "Secure Booking",
    description: "Encrypted checkout & protected payments.",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
  },
  {
    icon: QrCode,
    title: "Instant E-Tickets",
    description: "Direct QR boarding passes ready instantly.",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400"
  },
  {
    icon: Bell,
    title: "Trip Updates",
    description: "Schedule alerts & departure notifications.",
    iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400"
  }
];

export function ValuePropositionsSection() {
  return (
    <section className="py-6 sm:py-8">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
          {VALUE_PROPS.map((prop) => {
            const Icon = prop.icon;
            return (
              <div
                key={prop.title}
                className="flex items-center gap-3.5 rounded-xl border border-border/70 bg-card p-3.5 sm:p-4 shadow-xs"
              >
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    prop.iconBg
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold tracking-tight text-foreground leading-tight">
                    {prop.title}
                  </h4>
                  <p className="mt-0.5 text-[11px] font-normal leading-tight text-muted-foreground truncate">
                    {prop.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


