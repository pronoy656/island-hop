import { Bell, QrCode, ShieldCheck, Users } from "lucide-react";

import { Card, CardContent } from "@/ui";

const VALUE_PROPS = [
  {
    title: "Live Availability",
    description: "See available trips and seats in real time.",
    Icon: Users
  },
  {
    title: "Secure Booking",
    description: "Simple and protected payments you can trust.",
    Icon: ShieldCheck
  },
  {
    title: "Instant E-Tickets",
    description: "Your QR ticket is ready right after booking.",
    Icon: QrCode
  },
  {
    title: "Trip Updates",
    description: "Stay informed with important schedule updates.",
    Icon: Bell
  }
];

export function BookingValueProps() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {VALUE_PROPS.map(({ title, description, Icon }) => (
        <Card
          key={title}
          className="border-border bg-card/60 hover:bg-card rounded-2xl p-5 shadow-xs backdrop-blur-sm transition-all hover:shadow-sm"
        >
          <CardContent className="flex items-start gap-4 p-0">
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <Icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-foreground text-xs font-bold">{title}</h4>
              <p className="text-muted-foreground text-[11px] leading-relaxed">{description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
