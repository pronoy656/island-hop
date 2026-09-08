export interface ProviderVessel {
  id: string;
  name: string;
  type: string;
  capacity: number;
  yearBuilt: number;
  registrationNumber: string;
  status: "In Service" | "Docked" | "Maintenance";
  speedKnots: number;
  assignedRoute?: string;
}

export interface ProviderRouteItem {
  id: string;
  routeName: string;
  departurePort: string;
  arrivalPort: string;
  assignedFerry?: string;
  duration: string;
  distanceNm: number;
  dailyTrips: number;
  price: number;
  isBorderCrossing: boolean;
  status: "Active" | "Inactive" | "Seasonal";
}

export interface ProviderScheduleItem {
  id: string;
  departureTime: string;
  arrivalTime: string;
  vesselName: string;
  routeName: string;
  status: "Boarding" | "On Schedule" | "Preparing" | "Departed" | "Delayed";
  capacity: number;
  bookedSeats: number;
  captain: string;
  gatePier: string;
}

export interface ProviderOffDayItem {
  id: string;
  date: string;
  title: string;
  reason: "Scheduled Maintenance" | "Public Holiday" | "Weather Warning" | "Charter Event";
  affectedVessel?: string;
  affectedRoute?: string;
  status: "Confirmed" | "Tentative";
}

export interface ProviderBookingItem {
  id: string;
  bookingReference: string;
  passenger: string;
  email: string;
  route: string;
  vesselName: string;
  travelDate: string;
  departureTime: string;
  pax: number;
  amount: number;
  status: "Confirmed" | "Checked In" | "Cancelled";
}

export interface ManifestPassengerItem {
  id: string;
  ticketNumber: string;
  passengerName: string;
  nationality: string;
  passportId: string;
  cabinClass: "Standard" | "VIP Upper Deck" | "Business";
  luggageCount: number;
  checkInStatus: "Boarded" | "Checked In" | "Pending";
  emergencyContact: string;
}

export interface ManifestTripItem {
  manifestId: string;
  departureTime: string;
  travelDate: string;
  vesselName: string;
  routeName: string;
  captain: string;
  totalCapacity: number;
  totalCheckedIn: number;
  totalBoarded: number;
  status: "Boarding" | "Departed" | "Open";
  passengers: ManifestPassengerItem[];
}

export interface ProviderUpcomingTripItem {
  id: string;
  tripCode: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  vesselName: string;
  routeName: string;
  captain: string;
  gatePier: string;
  capacity: number;
  bookedSeats: number;
  status: "Scheduled" | "Filling Fast" | "Almost Full" | "On Time" | "Delayed";
  pricePerSeat: number;
}

export const PROVIDER_MOCK_DATA = {
  profile: {
    companyName: "Island Ferry Co.",
    tradingName: "Island Ferry Hawaii & Pacific Lines",
    operatorCode: "ISL-01",
    contactPerson: "James Nakamura",
    email: "operations@islandferry.com",
    phone: "+1 (808) 555-0142",
    hubPort: "Honolulu Harbor Pier 4, HI",
    licenseNumber: "HI-MAR-2021-8842",
    verifiedStatus: "Active Verified Provider",
    payoutBank: "First Hawaiian Bank (•••• 4921)"
  },

  summaryStats: {
    todayPassengers: {
      value: 348,
      changePercent: 14.5,
      trend: "up" as const,
      comparisonText: "vs yesterday"
    },
    activeFleet: {
      value: "3 / 3",
      changePercent: 0,
      trend: "neutral" as const,
      comparisonText: "all vessels ready"
    },
    todayBookings: {
      value: 94,
      changePercent: 22.0,
      trend: "up" as const,
      comparisonText: "vs yesterday"
    },
    todayRevenue: {
      value: 10480.0,
      formattedValue: "$10,480.00",
      changePercent: 18.2,
      trend: "up" as const,
      comparisonText: "vs last week"
    }
  },

  vessels: [
    {
      id: "v-101",
      name: "Ocean Voyager I",
      type: "High-Speed Catamaran",
      capacity: 180,
      yearBuilt: 2021,
      registrationNumber: "HI-9921-C",
      status: "In Service",
      speedKnots: 28,
      assignedRoute: "Honolulu ⇄ Maui"
    },
    {
      id: "v-102",
      name: "Pacific Wave Runner",
      type: "Hydrofoil Express",
      capacity: 120,
      yearBuilt: 2022,
      registrationNumber: "HI-8843-H",
      status: "In Service",
      speedKnots: 34,
      assignedRoute: "Honolulu ⇄ Lanai"
    },
    {
      id: "v-103",
      name: "Island Hopper III",
      type: "Passenger Ferry",
      capacity: 250,
      yearBuilt: 2019,
      registrationNumber: "HI-7102-P",
      status: "In Service",
      speedKnots: 22,
      assignedRoute: "Honolulu ⇄ Molokai"
    }
  ] satisfies ProviderVessel[],

  routes: [
    {
      id: "r-1",
      routeName: "Honolulu ⇄ Maui",
      departurePort: "Honolulu Pier 4",
      arrivalPort: "Kahului Harbor, Maui",
      assignedFerry: "Ocean Voyager I",
      duration: "1h 45m",
      distanceNm: 78,
      dailyTrips: 4,
      price: 45.0,
      isBorderCrossing: false,
      status: "Active"
    },
    {
      id: "r-2",
      routeName: "Honolulu ⇄ Lanai",
      departurePort: "Honolulu Pier 4",
      arrivalPort: "Manele Harbor, Lanai",
      assignedFerry: "Pacific Wave Runner",
      duration: "1h 15m",
      distanceNm: 58,
      dailyTrips: 3,
      price: 35.0,
      isBorderCrossing: false,
      status: "Active"
    },
    {
      id: "r-3",
      routeName: "Honolulu ⇄ Molokai",
      departurePort: "Honolulu Pier 4",
      arrivalPort: "Kaunakakai Harbor, Molokai",
      assignedFerry: "Island Hopper III",
      duration: "1h 30m",
      distanceNm: 64,
      dailyTrips: 2,
      price: 40.0,
      isBorderCrossing: false,
      status: "Active"
    },
    {
      id: "r-4",
      routeName: "St. Thomas ⇄ Tortola (BVI)",
      departurePort: "Charlotte Amalie Port",
      arrivalPort: "Road Town Pier, BVI",
      assignedFerry: "Ocean Voyager I",
      duration: "55m",
      distanceNm: 28,
      dailyTrips: 2,
      price: 65.0,
      isBorderCrossing: true,
      status: "Active"
    }
  ] satisfies ProviderRouteItem[],

  schedules: [
    {
      id: "SCH-101",
      departureTime: "08:30 AM",
      arrivalTime: "10:15 AM",
      vesselName: "Ocean Voyager I",
      routeName: "Honolulu → Maui",
      status: "Departed",
      capacity: 180,
      bookedSeats: 172,
      captain: "Capt. Mark Kealoha",
      gatePier: "Pier 4 - Gate A"
    },
    {
      id: "SCH-102",
      departureTime: "11:00 AM",
      arrivalTime: "12:15 PM",
      vesselName: "Pacific Wave Runner",
      routeName: "Honolulu → Lanai",
      status: "Boarding",
      capacity: 120,
      bookedSeats: 114,
      captain: "Capt. Noelani Silva",
      gatePier: "Pier 4 - Gate B"
    },
    {
      id: "SCH-103",
      departureTime: "02:30 PM",
      arrivalTime: "04:15 PM",
      vesselName: "Ocean Voyager I",
      routeName: "Honolulu → Maui",
      status: "On Schedule",
      capacity: 180,
      bookedSeats: 145,
      captain: "Capt. Mark Kealoha",
      gatePier: "Pier 4 - Gate A"
    },
    {
      id: "SCH-104",
      departureTime: "04:00 PM",
      arrivalTime: "05:30 PM",
      vesselName: "Island Hopper III",
      routeName: "Honolulu → Molokai",
      status: "Preparing",
      capacity: 250,
      bookedSeats: 188,
      captain: "Capt. Davis Akana",
      gatePier: "Pier 4 - Gate C"
    },
    {
      id: "SCH-105",
      departureTime: "06:15 PM",
      arrivalTime: "07:30 PM",
      vesselName: "Pacific Wave Runner",
      routeName: "Honolulu → Lanai",
      status: "On Schedule",
      capacity: 120,
      bookedSeats: 92,
      captain: "Capt. Noelani Silva",
      gatePier: "Pier 4 - Gate B"
    }
  ] satisfies ProviderScheduleItem[],

  offDays: [
    {
      id: "OFF-01",
      date: "2026-09-15",
      title: "Annual Hull & Engine Overhaul",
      reason: "Scheduled Maintenance",
      affectedVessel: "Island Hopper III",
      affectedRoute: "Honolulu ⇄ Molokai",
      status: "Confirmed"
    },
    {
      id: "OFF-02",
      date: "2026-09-24",
      title: "Tropical Swell Weather Precaution",
      reason: "Weather Warning",
      affectedVessel: "All Vessels",
      affectedRoute: "All Inter-Island Routes",
      status: "Tentative"
    },
    {
      id: "OFF-03",
      date: "2026-10-14",
      title: "King Kamehameha Harbor Holiday",
      reason: "Public Holiday",
      affectedVessel: "Ocean Voyager I",
      affectedRoute: "Honolulu ⇄ Maui",
      status: "Confirmed"
    }
  ] satisfies ProviderOffDayItem[],

  bookings: [
    {
      id: "1",
      bookingReference: "FG-20240815-001",
      passenger: "Elena Rodriguez",
      email: "elena.rodriguez@example.com",
      route: "Honolulu → Maui",
      vesselName: "Ocean Voyager I",
      travelDate: "2026-09-08",
      departureTime: "08:30 AM",
      pax: 4,
      amount: 180.0,
      status: "Checked In"
    },
    {
      id: "2",
      bookingReference: "FG-20240815-002",
      passenger: "Michael Chang",
      email: "m.chang@example.com",
      route: "Honolulu → Lanai",
      vesselName: "Pacific Wave Runner",
      travelDate: "2026-09-08",
      departureTime: "11:00 AM",
      pax: 2,
      amount: 70.0,
      status: "Confirmed"
    },
    {
      id: "3",
      bookingReference: "FG-20240814-003",
      passenger: "Sarah Thompson",
      email: "sarah.t@example.com",
      route: "Honolulu → Lanai",
      vesselName: "Pacific Wave Runner",
      travelDate: "2026-09-08",
      departureTime: "11:00 AM",
      pax: 3,
      amount: 105.0,
      status: "Confirmed"
    },
    {
      id: "4",
      bookingReference: "FG-20240814-004",
      passenger: "David Kim",
      email: "david.kim@example.com",
      route: "Honolulu → Maui",
      vesselName: "Ocean Voyager I",
      travelDate: "2026-09-08",
      departureTime: "02:30 PM",
      pax: 2,
      amount: 90.0,
      status: "Confirmed"
    },
    {
      id: "5",
      bookingReference: "FG-20240813-005",
      passenger: "Jennifer Walsh",
      email: "jennifer.w@example.com",
      route: "Honolulu → Molokai",
      vesselName: "Island Hopper III",
      travelDate: "2026-09-08",
      departureTime: "04:00 PM",
      pax: 2,
      amount: 80.0,
      status: "Confirmed"
    }
  ] satisfies ProviderBookingItem[],

  manifests: [
    {
      manifestId: "MAN-20260908-01",
      departureTime: "11:00 AM",
      travelDate: "Today (Sep 08, 2026)",
      vesselName: "Pacific Wave Runner",
      routeName: "Honolulu → Lanai (Pier 4)",
      captain: "Capt. Noelani Silva",
      totalCapacity: 120,
      totalCheckedIn: 114,
      totalBoarded: 98,
      status: "Boarding",
      passengers: [
        {
          id: "P-1",
          ticketNumber: "TCK-88210-A",
          passengerName: "Michael Chang",
          nationality: "USA",
          passportId: "P-8829104",
          cabinClass: "VIP Upper Deck",
          luggageCount: 2,
          checkInStatus: "Boarded",
          emergencyContact: "+1 (808) 555-9012"
        },
        {
          id: "P-2",
          ticketNumber: "TCK-88210-B",
          passengerName: "Lisa Chang",
          nationality: "USA",
          passportId: "P-8829105",
          cabinClass: "VIP Upper Deck",
          luggageCount: 1,
          checkInStatus: "Boarded",
          emergencyContact: "+1 (808) 555-9012"
        },
        {
          id: "P-3",
          ticketNumber: "TCK-88211-A",
          passengerName: "Sarah Thompson",
          nationality: "Canada",
          passportId: "CA-904128",
          cabinClass: "Standard",
          luggageCount: 2,
          checkInStatus: "Boarded",
          emergencyContact: "+1 (416) 555-8833"
        },
        {
          id: "P-4",
          ticketNumber: "TCK-88211-B",
          passengerName: "Oliver Thompson",
          nationality: "Canada",
          passportId: "CA-904129",
          cabinClass: "Standard",
          luggageCount: 1,
          checkInStatus: "Checked In",
          emergencyContact: "+1 (416) 555-8833"
        },
        {
          id: "P-5",
          ticketNumber: "TCK-88212-A",
          passengerName: "Kenji Sato",
          nationality: "Japan",
          passportId: "JP-774019",
          cabinClass: "Business",
          luggageCount: 2,
          checkInStatus: "Pending",
          emergencyContact: "+81 90-5555-1234"
        }
      ]
    },
    {
      manifestId: "MAN-20260908-02",
      departureTime: "02:30 PM",
      travelDate: "Today (Sep 08, 2026)",
      vesselName: "Ocean Voyager I",
      routeName: "Honolulu → Maui (Pier 4)",
      captain: "Capt. Mark Kealoha",
      totalCapacity: 180,
      totalCheckedIn: 145,
      totalBoarded: 0,
      status: "Open",
      passengers: [
        {
          id: "P-6",
          ticketNumber: "TCK-99014-A",
          passengerName: "David Kim",
          nationality: "USA",
          passportId: "US-449102",
          cabinClass: "Standard",
          luggageCount: 2,
          checkInStatus: "Checked In",
          emergencyContact: "+1 (206) 555-0199"
        },
        {
          id: "P-7",
          ticketNumber: "TCK-99014-B",
          passengerName: "Grace Kim",
          nationality: "USA",
          passportId: "US-449103",
          cabinClass: "Standard",
          luggageCount: 2,
          checkInStatus: "Checked In",
          emergencyContact: "+1 (206) 555-0199"
        }
      ]
    }
  ] satisfies ManifestTripItem[],

  upcomingTrips: [
    {
      id: "UT-201",
      tripCode: "TR-881",
      date: "Tomorrow, Sep 09",
      departureTime: "08:30 AM",
      arrivalTime: "10:15 AM",
      vesselName: "Ocean Voyager I",
      routeName: "Honolulu → Maui",
      captain: "Capt. Mark Kealoha",
      gatePier: "Pier 4 - Gate A",
      capacity: 180,
      bookedSeats: 162,
      status: "Filling Fast",
      pricePerSeat: 45.0
    },
    {
      id: "UT-202",
      tripCode: "TR-882",
      date: "Tomorrow, Sep 09",
      departureTime: "11:00 AM",
      arrivalTime: "12:15 PM",
      vesselName: "Pacific Wave Runner",
      routeName: "Honolulu → Lanai",
      captain: "Capt. Noelani Silva",
      gatePier: "Pier 4 - Gate B",
      capacity: 120,
      bookedSeats: 98,
      status: "Scheduled",
      pricePerSeat: 35.0
    },
    {
      id: "UT-203",
      tripCode: "TR-883",
      date: "Tomorrow, Sep 09",
      departureTime: "02:30 PM",
      arrivalTime: "04:15 PM",
      vesselName: "Ocean Voyager I",
      routeName: "Honolulu → Maui",
      captain: "Capt. Mark Kealoha",
      gatePier: "Pier 4 - Gate A",
      capacity: 180,
      bookedSeats: 112,
      status: "Scheduled",
      pricePerSeat: 45.0
    },
    {
      id: "UT-204",
      tripCode: "TR-884",
      date: "Thu, Sep 10",
      departureTime: "09:00 AM",
      arrivalTime: "10:30 AM",
      vesselName: "Island Hopper III",
      routeName: "Honolulu → Molokai",
      captain: "Capt. Davis Akana",
      gatePier: "Pier 4 - Gate C",
      capacity: 250,
      bookedSeats: 185,
      status: "Scheduled",
      pricePerSeat: 40.0
    },
    {
      id: "UT-205",
      tripCode: "TR-885",
      date: "Thu, Sep 10",
      departureTime: "01:30 PM",
      arrivalTime: "02:45 PM",
      vesselName: "Pacific Wave Runner",
      routeName: "Honolulu → Lanai",
      captain: "Capt. Noelani Silva",
      gatePier: "Pier 4 - Gate B",
      capacity: 120,
      bookedSeats: 116,
      status: "Almost Full",
      pricePerSeat: 35.0
    },
    {
      id: "UT-206",
      tripCode: "TR-886",
      date: "Fri, Sep 11",
      departureTime: "08:00 AM",
      arrivalTime: "09:45 AM",
      vesselName: "Ocean Voyager I",
      routeName: "Honolulu → Maui",
      captain: "Capt. Mark Kealoha",
      gatePier: "Pier 4 - Gate A",
      capacity: 180,
      bookedSeats: 88,
      status: "Scheduled",
      pricePerSeat: 45.0
    }
  ] satisfies ProviderUpcomingTripItem[]
};
