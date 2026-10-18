export interface FerryTrip {
  id: string;
  operator: string;
  vesselName: string;
  vesselType: string;
  image: string;
  departureTime: string;
  departurePort: string;
  arrivalTime: string;
  arrivalPort: string;
  duration: string;
  price: number;
  availableSeats: number;
  featured?: boolean;
}

export const AVAILABLE_FERRIES: FerryTrip[] = [
  {
    id: "trip-1",
    operator: "Atoll Ferries Express",
    vesselName: "Atoll Flyer I",
    vesselType: "Catamaran Speedboat",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    departureTime: "08:30 AM",
    departurePort: "Malé",
    arrivalTime: "09:05 AM",
    arrivalPort: "Maafushi",
    duration: "Approx. 35 min",
    price: 25,
    availableSeats: 12
  },
  {
    id: "trip-2",
    operator: "Island Ferry",
    vesselName: "Ocean Breeze",
    vesselType: "Highspeed Cruiser",
    image:
      "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=800&q=80",
    departureTime: "11:00 AM",
    departurePort: "Malé",
    arrivalTime: "11:40 AM",
    arrivalPort: "Maafushi",
    duration: "Approx. 40 min",
    price: 28,
    availableSeats: 8
  },
  {
    id: "trip-3",
    operator: "Atoll Ferries Express",
    vesselName: "Atoll Flyer II",
    vesselType: "Highspeed Catamaran",
    image:
      "https://images.unsplash.com/photo-1505705694340-019e1e335916?auto=format&fit=crop&w=800&q=80",
    departureTime: "03:30 PM",
    departurePort: "Malé",
    arrivalTime: "04:05 PM",
    arrivalPort: "Maafushi",
    duration: "Approx. 35 min",
    price: 25,
    availableSeats: 6
  }
];

export const VALUE_PROPOSITIONS = [
  {
    title: "Live Availability",
    description: "See available trips and seats in real time.",
    icon: "Users"
  },
  {
    title: "Secure Booking",
    description: "Simple and protected payments you can trust.",
    icon: "ShieldCheck"
  },
  {
    title: "Instant E-Tickets",
    description: "Your QR ticket is ready right after booking.",
    icon: "QrCode"
  },
  {
    title: "Trip Updates",
    description: "Stay informed with important schedule updates.",
    icon: "Bell"
  }
] as const;
