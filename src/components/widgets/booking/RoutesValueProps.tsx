import { CalendarCheck, Shield, Ship, Ticket } from "lucide-react";

import { ROUTE_VALUE_PROPS } from "@/data/routes";


const ICONS = {
  Ship,
  Shield,
  CalendarCheck,
  Ticket
};

export function RoutesValueProps() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {ROUTE_VALUE_PROPS.map(({ title, description, icon }) => {
        const IconComponent = ICONS[icon as keyof typeof ICONS] || Ship;
        return (
          <div key={title} className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#003B95]/10 text-[#003B95] dark:bg-blue-950/40 dark:text-blue-400">
              <IconComponent className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-foreground text-xs font-bold">{title}</h4>
              <p className="text-muted-foreground text-[11px] leading-tight">{description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
