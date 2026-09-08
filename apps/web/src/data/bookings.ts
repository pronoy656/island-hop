export interface PassengerBooking {
  id: string;
  reference: string;
  tripId: string;
  operator: string;
  vesselType: string;
  from: string;
  to: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  duration: string;
  serviceDays: string;
  tripType: "ONE WAY" | "ROUND TRIP";
  passengers: {
    name: string;
    seat: string;
    type: "Adult" | "Child";
  }[];
  fare: number;
  serviceFee: number;
  totalPaid: number;
  paidOn: string;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  updates: {
    title: string;
    description: string;
    date: string;
    time: string;
    status: "done" | "active" | "pending";
  }[];
}

export const MOCK_PASSENGER_BOOKINGS: PassengerBooking[] = [
  {
    id: "booking-1",
    reference: "FG26-0524-7X9K",
    tripId: "trip-1",
    operator: "Atoll Ferries Express",
    vesselType: "High Speed Ferry",
    from: "Malé",
    to: "Maafushi",
    departureDate: "Sat, 24 May 2026",
    departureTime: "08:30 AM",
    arrivalDate: "Sat, 24 May 2026",
    arrivalTime: "09:05 AM",
    duration: "Approx. 35 min",
    serviceDays: "Daily (Mon - Sun)",
    tripType: "ONE WAY",
    passengers: [
      {
        name: "Ahmad Zakaria Labib",
        seat: "12A",
        type: "Adult"
      }
    ],
    fare: 25.0,
    serviceFee: 0.0,
    totalPaid: 25.0,
    paidOn: "Tue, 20 May 2026",
    status: "CONFIRMED",
    updates: [
      {
        title: "Booking Confirmed",
        description: "Your booking has been confirmed.",
        date: "Tue, 20 May 2026",
        time: "10:24 AM",
        status: "done"
      },
      {
        title: "Check-in Opens",
        description: "Online check-in will open 2 hours before departure.",
        date: "Sat, 24 May 2026",
        time: "06:30 AM",
        status: "active"
      },
      {
        title: "Departure",
        description: "Please arrive at the terminal at least 30 minutes before departure.",
        date: "Sat, 24 May 2026",
        time: "08:30 AM",
        status: "pending"
      }
    ]
  },
  {
    id: "booking-2",
    reference: "FRY-0525-4B21",
    tripId: "trip-2",
    operator: "Island Ferry",
    vesselType: "Highspeed Cruiser",
    from: "Malé",
    to: "Hulhumalé",
    departureDate: "Sun, 25 May 2026",
    departureTime: "11:00 AM",
    arrivalDate: "Sun, 25 May 2026",
    arrivalTime: "11:40 AM",
    duration: "Approx. 40 min",
    serviceDays: "Daily (Mon - Sun)",
    tripType: "ONE WAY",
    passengers: [
      {
        name: "Jane Doe",
        seat: "05B",
        type: "Adult"
      },
      {
        name: "John Doe",
        seat: "05C",
        type: "Adult"
      }
    ],
    fare: 56.0,
    serviceFee: 0.0,
    totalPaid: 56.0,
    paidOn: "Wed, 21 May 2026",
    status: "CONFIRMED",
    updates: [
      {
        title: "Booking Confirmed",
        description: "Your booking has been confirmed.",
        date: "Wed, 21 May 2026",
        time: "02:15 PM",
        status: "done"
      },
      {
        title: "Check-in Opens",
        description: "Online check-in will open 2 hours before departure.",
        date: "Sun, 25 May 2026",
        time: "09:00 AM",
        status: "pending"
      },
      {
        title: "Departure",
        description: "Please arrive at the terminal at least 30 minutes before departure.",
        date: "Sun, 25 May 2026",
        time: "11:00 AM",
        status: "pending"
      }
    ]
  },
  {
    id: "booking-3",
    reference: "FRY-0601-9M12",
    tripId: "trip-3",
    operator: "Atoll Ferries Express",
    vesselType: "Highspeed Catamaran",
    from: "Malé",
    to: "Dhiffushi",
    departureDate: "Mon, 01 Jun 2026",
    departureTime: "03:30 PM",
    arrivalDate: "Mon, 01 Jun 2026",
    arrivalTime: "04:05 PM",
    duration: "Approx. 35 min",
    serviceDays: "Daily (Mon - Sun)",
    tripType: "ONE WAY",
    passengers: [
      {
        name: "Jane Doe",
        seat: "08A",
        type: "Adult"
      }
    ],
    fare: 25.0,
    serviceFee: 0.0,
    totalPaid: 25.0,
    paidOn: "Thu, 22 May 2026",
    status: "CONFIRMED",
    updates: [
      {
        title: "Booking Confirmed",
        description: "Your booking has been confirmed.",
        date: "Thu, 22 May 2026",
        time: "11:45 AM",
        status: "done"
      },
      {
        title: "Check-in Opens",
        description: "Online check-in will open 2 hours before departure.",
        date: "Mon, 01 Jun 2026",
        time: "01:30 PM",
        status: "pending"
      },
      {
        title: "Departure",
        description: "Please arrive at the terminal at least 30 minutes before departure.",
        date: "Mon, 01 Jun 2026",
        time: "03:30 PM",
        status: "pending"
      }
    ]
  }
];
