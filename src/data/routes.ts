export interface IslandRoute {
  id: string;
  from: string;
  to: string;
  description: string;
  duration: string;
  trips: string;
  image: string;
  featured?: boolean;
}

export const POPULAR_ROUTES: IslandRoute[] = [
  {
    id: "route-male-maafushi",
    from: "Malé",
    to: "Maafushi",
    description: "The most popular local route",
    duration: "35 min",
    trips: "Multiple daily",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "route-male-hulhumale",
    from: "Malé",
    to: "Hulhumalé",
    description: "Quick and convenient connection",
    duration: "15 min",
    trips: "Multiple daily",
    image:
      "https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "route-male-dhiffushi",
    from: "Malé",
    to: "Dhiffushi",
    description: "Beautiful island escape",
    duration: "45 min",
    trips: "Multiple daily",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "route-male-thulusdhoo",
    from: "Malé",
    to: "Thulusdhoo",
    description: "Surf, local culture and beaches",
    duration: "40 min",
    trips: "Multiple daily",
    image:
      "https://images.unsplash.com/photo-1505705694340-019e1e335916?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "route-male-guraidhoo",
    from: "Malé",
    to: "Guraidhoo",
    description: "Local island with natural beauty",
    duration: "40 min",
    trips: "Multiple daily",
    image:
      "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "route-male-gulhi",
    from: "Malé",
    to: "Gulhi",
    description: "Relaxed island vibes",
    duration: "55 min",
    trips: "Multiple daily",
    image:
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80"
  }
];

export const ROUTE_VALUE_PROPS = [
  {
    title: "Wide Network",
    description: "Connecting you to the best islands.",
    icon: "Ship"
  },
  {
    title: "Safe & Reliable",
    description: "Trusted operators and safe journeys.",
    icon: "Shield"
  },
  {
    title: "Frequent Trips",
    description: "Multiple daily schedules to fit your plans.",
    icon: "CalendarCheck"
  },
  {
    title: "Easy Booking",
    description: "Book your trip in just a few simple steps.",
    icon: "Ticket"
  }
] as const;
