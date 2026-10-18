export type TimeRangeFilter = "7d" | "15d" | "30d" | "month";

export interface TimeRangeOption {
  label: string;
  value: TimeRangeFilter;
}

export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 15 Days", value: "15d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last Month", value: "month" }
];

export interface MetricWithTrend {
  value: number;
  formattedValue?: string;
  changePercent: number;
  trend: "up" | "down" | "neutral";
  comparisonText?: string;
}

export interface RevenueDataPoint {
  label: string;
  revenue: number;
  commission: number;
  payout: number;
}

export interface BookingsDataPoint {
  label: string;
  bookings: number;
  passengers: number;
}

export interface AdminPeriodData {
  summaryStats: {
    totalProviders: MetricWithTrend;
    totalFerries: MetricWithTrend;
    totalBookings: MetricWithTrend;
    totalPassengers: MetricWithTrend;
  };
  bookingOverview: {
    confirmedBookings: MetricWithTrend;
    cancelledBookings: MetricWithTrend;
  };
  paymentOverview: {
    totalBookingValue: MetricWithTrend;
    commission: MetricWithTrend;
    providerAmount: MetricWithTrend;
  };
  revenueChart: RevenueDataPoint[];
  bookingsChart: BookingsDataPoint[];
}

export interface RecentBookingItem {
  id: string;
  bookingReference: string;
  passenger: string;
  provider: string;
  route: string;
  travelDate: string;
  pax: number;
  amount: number;
  status: "Confirmed" | "Cancelled" | "Pending";
}

export interface RecentProviderItem {
  id: string;
  provider: string;
  contactPerson: string;
  totalFerries: number;
  status: "Active" | "Suspended" | "Pending";
}

export interface ProviderFerry {
  id: string;
  name: string;
  type: string;
  capacity: number;
  yearBuilt: number;
  status: "In Service" | "Maintenance" | "Docked";
}

export interface ProviderRoute {
  id: string;
  routeName: string;
  departurePort: string;
  arrivalPort: string;
  duration: string;
  dailyTrips: number;
  price: number;
  status: "Active" | "Inactive";
}

export interface ProviderDetail {
  id: string;
  provider: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber: string;
  registeredDate: string;
  status: "Active" | "Suspended";
  totalFerries: number;
  totalRoutes: number;
  totalBookings: number;
  totalRevenue: number;
  commissionPaid: number;
  providerPayout: number;
  ferries: ProviderFerry[];
  routes: ProviderRoute[];
  recentBookings: RecentBookingItem[];
}

export interface RecentPaymentItem {
  id: string;
  bookingReference: string;
  provider: string;
  bookingAmount: number;
  commission: number;
  providerAmount: number;
  paymentStatus: "Completed" | "Pending" | "Failed";
}

export const ADMIN_DASHBOARD_PERIOD_DATA: Record<TimeRangeFilter, AdminPeriodData> = {
  "30d": {
    summaryStats: {
      totalProviders: {
        value: 4,
        changePercent: 0,
        trend: "neutral",
        comparisonText: "vs last month"
      },
      totalFerries: {
        value: 7,
        changePercent: 16.7,
        trend: "up",
        comparisonText: "vs last month"
      },
      totalBookings: {
        value: 1248,
        formattedValue: "1,248",
        changePercent: 12.4,
        trend: "up",
        comparisonText: "vs last month"
      },
      totalPassengers: {
        value: 2460,
        formattedValue: "2,460",
        changePercent: 18.2,
        trend: "up",
        comparisonText: "vs last month"
      }
    },
    bookingOverview: {
      confirmedBookings: {
        value: 6,
        changePercent: 14.5,
        trend: "up",
        comparisonText: "vs last period"
      },
      cancelledBookings: {
        value: 2,
        changePercent: -5.0,
        trend: "down",
        comparisonText: "vs last period"
      }
    },
    paymentOverview: {
      totalBookingValue: {
        value: 1130.0,
        formattedValue: "$1130.00",
        changePercent: 15.3,
        trend: "up"
      },
      commission: {
        value: 113.0,
        formattedValue: "$113.00",
        changePercent: 15.3,
        trend: "up"
      },
      providerAmount: {
        value: 1017.0,
        formattedValue: "$1017.00",
        changePercent: 15.3,
        trend: "up"
      }
    },
    revenueChart: [
      { label: "Aug 01", revenue: 180, commission: 18, payout: 162 },
      { label: "Aug 06", revenue: 320, commission: 32, payout: 288 },
      { label: "Aug 11", revenue: 450, commission: 45, payout: 405 },
      { label: "Aug 16", revenue: 680, commission: 68, payout: 612 },
      { label: "Aug 21", revenue: 890, commission: 89, payout: 801 },
      { label: "Aug 26", revenue: 1050, commission: 105, payout: 945 },
      { label: "Aug 30", revenue: 1130, commission: 113, payout: 1017 }
    ],
    bookingsChart: [
      { label: "Week 1", bookings: 240, passengers: 480 },
      { label: "Week 2", bookings: 310, passengers: 620 },
      { label: "Week 3", bookings: 345, passengers: 690 },
      { label: "Week 4", bookings: 353, passengers: 670 }
    ]
  },

  "7d": {
    summaryStats: {
      totalProviders: {
        value: 4,
        changePercent: 0,
        trend: "neutral",
        comparisonText: "vs prev 7 days"
      },
      totalFerries: {
        value: 7,
        changePercent: 0,
        trend: "neutral",
        comparisonText: "vs prev 7 days"
      },
      totalBookings: {
        value: 312,
        formattedValue: "312",
        changePercent: 8.7,
        trend: "up",
        comparisonText: "vs prev 7 days"
      },
      totalPassengers: {
        value: 620,
        formattedValue: "620",
        changePercent: 9.4,
        trend: "up",
        comparisonText: "vs prev 7 days"
      }
    },
    bookingOverview: {
      confirmedBookings: {
        value: 5,
        changePercent: 12.0,
        trend: "up",
        comparisonText: "vs prev 7 days"
      },
      cancelledBookings: {
        value: 1,
        changePercent: -50.0,
        trend: "down",
        comparisonText: "vs prev 7 days"
      }
    },
    paymentOverview: {
      totalBookingValue: {
        value: 580.0,
        formattedValue: "$580.00",
        changePercent: 11.2,
        trend: "up"
      },
      commission: {
        value: 58.0,
        formattedValue: "$58.00",
        changePercent: 11.2,
        trend: "up"
      },
      providerAmount: {
        value: 522.0,
        formattedValue: "$522.00",
        changePercent: 11.2,
        trend: "up"
      }
    },
    revenueChart: [
      { label: "Mon", revenue: 75, commission: 7.5, payout: 67.5 },
      { label: "Tue", revenue: 95, commission: 9.5, payout: 85.5 },
      { label: "Wed", revenue: 120, commission: 12, payout: 108 },
      { label: "Thu", revenue: 110, commission: 11, payout: 99 },
      { label: "Fri", revenue: 145, commission: 14.5, payout: 130.5 },
      { label: "Sat", revenue: 180, commission: 18, payout: 162 },
      { label: "Sun", revenue: 160, commission: 16, payout: 144 }
    ],
    bookingsChart: [
      { label: "Mon", bookings: 38, passengers: 76 },
      { label: "Tue", bookings: 42, passengers: 84 },
      { label: "Wed", bookings: 48, passengers: 96 },
      { label: "Thu", bookings: 45, passengers: 90 },
      { label: "Fri", bookings: 56, passengers: 112 },
      { label: "Sat", bookings: 70, passengers: 140 },
      { label: "Sun", bookings: 62, passengers: 122 }
    ]
  },

  "15d": {
    summaryStats: {
      totalProviders: {
        value: 4,
        changePercent: 0,
        trend: "neutral",
        comparisonText: "vs prev 15 days"
      },
      totalFerries: {
        value: 7,
        changePercent: 14.3,
        trend: "up",
        comparisonText: "vs prev 15 days"
      },
      totalBookings: {
        value: 685,
        formattedValue: "685",
        changePercent: 10.5,
        trend: "up",
        comparisonText: "vs prev 15 days"
      },
      totalPassengers: {
        value: 1340,
        formattedValue: "1,340",
        changePercent: 14.1,
        trend: "up",
        comparisonText: "vs prev 15 days"
      }
    },
    bookingOverview: {
      confirmedBookings: {
        value: 6,
        changePercent: 9.8,
        trend: "up",
        comparisonText: "vs prev 15 days"
      },
      cancelledBookings: {
        value: 2,
        changePercent: -12.5,
        trend: "down",
        comparisonText: "vs prev 15 days"
      }
    },
    paymentOverview: {
      totalBookingValue: {
        value: 840.0,
        formattedValue: "$840.00",
        changePercent: 13.6,
        trend: "up"
      },
      commission: {
        value: 84.0,
        formattedValue: "$84.00",
        changePercent: 13.6,
        trend: "up"
      },
      providerAmount: {
        value: 756.0,
        formattedValue: "$756.00",
        changePercent: 13.6,
        trend: "up"
      }
    },
    revenueChart: [
      { label: "Day 1-3", revenue: 140, commission: 14, payout: 126 },
      { label: "Day 4-6", revenue: 260, commission: 26, payout: 234 },
      { label: "Day 7-9", revenue: 420, commission: 42, payout: 378 },
      { label: "Day 10-12", revenue: 630, commission: 63, payout: 567 },
      { label: "Day 13-15", revenue: 840, commission: 84, payout: 756 }
    ],
    bookingsChart: [
      { label: "Day 1-3", bookings: 110, passengers: 220 },
      { label: "Day 4-6", bookings: 135, passengers: 270 },
      { label: "Day 7-9", bookings: 145, passengers: 290 },
      { label: "Day 10-12", bookings: 160, passengers: 310 },
      { label: "Day 13-15", bookings: 185, passengers: 360 }
    ]
  },

  month: {
    summaryStats: {
      totalProviders: {
        value: 3,
        changePercent: -25.0,
        trend: "down",
        comparisonText: "vs previous month"
      },
      totalFerries: {
        value: 6,
        changePercent: -14.2,
        trend: "down",
        comparisonText: "vs previous month"
      },
      totalBookings: {
        value: 1120,
        formattedValue: "1,120",
        changePercent: -3.4,
        trend: "down",
        comparisonText: "vs previous month"
      },
      totalPassengers: {
        value: 2180,
        formattedValue: "2,180",
        changePercent: -2.1,
        trend: "down",
        comparisonText: "vs previous month"
      }
    },
    bookingOverview: {
      confirmedBookings: {
        value: 5,
        changePercent: -8.0,
        trend: "down",
        comparisonText: "vs previous month"
      },
      cancelledBookings: {
        value: 3,
        changePercent: 20.0,
        trend: "up",
        comparisonText: "vs previous month"
      }
    },
    paymentOverview: {
      totalBookingValue: {
        value: 990.0,
        formattedValue: "$990.00",
        changePercent: -4.5,
        trend: "down"
      },
      commission: {
        value: 99.0,
        formattedValue: "$99.00",
        changePercent: -4.5,
        trend: "down"
      },
      providerAmount: {
        value: 891.0,
        formattedValue: "$891.00",
        changePercent: -4.5,
        trend: "down"
      }
    },
    revenueChart: [
      { label: "Jul 01", revenue: 150, commission: 15, payout: 135 },
      { label: "Jul 08", revenue: 310, commission: 31, payout: 279 },
      { label: "Jul 15", revenue: 520, commission: 52, payout: 468 },
      { label: "Jul 22", revenue: 740, commission: 74, payout: 666 },
      { label: "Jul 31", revenue: 990, commission: 99, payout: 891 }
    ],
    bookingsChart: [
      { label: "Week 1", bookings: 260, passengers: 510 },
      { label: "Week 2", bookings: 275, passengers: 540 },
      { label: "Week 3", bookings: 290, passengers: 570 },
      { label: "Week 4", bookings: 295, passengers: 560 }
    ]
  }
};

export const PROVIDERS_DETAILS: ProviderDetail[] = [
  {
    id: "1",
    provider: "Island Ferry Co.",
    contactPerson: "James Nakamura",
    email: "operations@islandferry.com",
    phone: "+1 (808) 555-0142",
    address: "Pier 4, Honolulu Harbor, Honolulu, HI 96813",
    licenseNumber: "HI-MAR-2021-8842",
    registeredDate: "2023-04-15",
    status: "Active",
    totalFerries: 3,
    totalRoutes: 2,
    totalBookings: 612,
    totalRevenue: 52400.0,
    commissionPaid: 5240.0,
    providerPayout: 47160.0,
    ferries: [
      {
        id: "v-101",
        name: "Ocean Voyager I",
        type: "High-Speed Catamaran",
        capacity: 180,
        yearBuilt: 2021,
        status: "In Service"
      },
      {
        id: "v-102",
        name: "Pacific Wave Runner",
        type: "Hydrofoil Express",
        capacity: 120,
        yearBuilt: 2022,
        status: "In Service"
      },
      {
        id: "v-103",
        name: "Island Hopper III",
        type: "Passenger Ferry",
        capacity: 250,
        yearBuilt: 2019,
        status: "Docked"
      }
    ],
    routes: [
      {
        id: "r-1",
        routeName: "Honolulu ⇄ Maui",
        departurePort: "Honolulu Pier 4",
        arrivalPort: "Kahului Harbor, Maui",
        duration: "1h 45m",
        dailyTrips: 4,
        price: 45.0,
        status: "Active"
      },
      {
        id: "r-2",
        routeName: "Honolulu ⇄ Lanai",
        departurePort: "Honolulu Pier 4",
        arrivalPort: "Manele Harbor, Lanai",
        duration: "1h 15m",
        dailyTrips: 3,
        price: 35.0,
        status: "Active"
      }
    ],
    recentBookings: [
      {
        id: "1",
        bookingReference: "FG-20240815-001",
        passenger: "Elena Rodriguez",
        provider: "Island Ferry Co.",
        route: "Honolulu → Maui",
        travelDate: "2024-08-20",
        pax: 4,
        amount: 180.0,
        status: "Confirmed"
      },
      {
        id: "3",
        bookingReference: "FG-20240814-003",
        passenger: "Sarah Thompson",
        provider: "Island Ferry Co.",
        route: "Honolulu → Lanai",
        travelDate: "2024-08-19",
        pax: 3,
        amount: 105.0,
        status: "Cancelled"
      }
    ]
  },
  {
    id: "2",
    provider: "BlueSea Transit",
    contactPerson: "Maria Santos",
    email: "contact@blueseatransit.com",
    phone: "+1 (305) 555-0819",
    address: "Biscayne Bay Terminal 2, Miami, FL 33132",
    licenseNumber: "FL-MAR-2022-3109",
    registeredDate: "2023-08-10",
    status: "Active",
    totalFerries: 2,
    totalRoutes: 2,
    totalBookings: 430,
    totalRevenue: 38200.0,
    commissionPaid: 3820.0,
    providerPayout: 34380.0,
    ferries: [
      {
        id: "v-201",
        name: "Blue Marlin Express",
        type: "Fast Passenger Cruiser",
        capacity: 160,
        yearBuilt: 2022,
        status: "In Service"
      },
      {
        id: "v-202",
        name: "Key Breeze IV",
        type: "Twin-Hull Catamaran",
        capacity: 140,
        yearBuilt: 2020,
        status: "In Service"
      }
    ],
    routes: [
      {
        id: "r-3",
        routeName: "Miami ⇄ Key West",
        departurePort: "Miami Terminal 2",
        arrivalPort: "Key West Ferry Dock",
        duration: "3h 30m",
        dailyTrips: 2,
        price: 60.0,
        status: "Active"
      },
      {
        id: "r-4",
        routeName: "Fort Lauderdale ⇄ Bimini",
        departurePort: "Port Everglades",
        arrivalPort: "Bimini Bay Marina",
        duration: "2h 00m",
        dailyTrips: 2,
        price: 85.0,
        status: "Active"
      }
    ],
    recentBookings: [
      {
        id: "2",
        bookingReference: "FG-20240815-002",
        passenger: "Michael Chang",
        provider: "BlueSea Transit",
        route: "Miami → Key West",
        travelDate: "2024-08-21",
        pax: 2,
        amount: 120.0,
        status: "Confirmed"
      },
      {
        id: "5",
        bookingReference: "FG-20240813-005",
        passenger: "Jennifer Walsh",
        provider: "BlueSea Transit",
        route: "Fort Lauderdale → Bimini",
        travelDate: "2024-08-23",
        pax: 2,
        amount: 170.0,
        status: "Confirmed"
      }
    ]
  },
  {
    id: "3",
    provider: "Pacific Crossing Ltd.",
    contactPerson: "Robert Chen",
    email: "info@pacificcrossing.com",
    phone: "+1 (206) 555-0391",
    address: "Pier 52, Colman Dock, Seattle, WA 98104",
    licenseNumber: "WA-DOT-2020-5591",
    registeredDate: "2022-11-20",
    status: "Active",
    totalFerries: 1,
    totalRoutes: 1,
    totalBookings: 185,
    totalRevenue: 13875.0,
    commissionPaid: 1387.5,
    providerPayout: 12487.5,
    ferries: [
      {
        id: "v-301",
        name: "Emerald Sound Star",
        type: "Modern Auto & Passenger Ferry",
        capacity: 220,
        yearBuilt: 2023,
        status: "In Service"
      }
    ],
    routes: [
      {
        id: "r-5",
        routeName: "Seattle ⇄ Bainbridge Island",
        departurePort: "Seattle Pier 52",
        arrivalPort: "Bainbridge Ferry Dock",
        duration: "35m",
        dailyTrips: 8,
        price: 15.0,
        status: "Active"
      }
    ],
    recentBookings: [
      {
        id: "4",
        bookingReference: "FG-20240814-004",
        passenger: "David Kim",
        provider: "Pacific Crossing Ltd.",
        route: "Seattle → Bainbridge Island",
        travelDate: "2024-08-22",
        pax: 5,
        amount: 75.0,
        status: "Confirmed"
      }
    ]
  },
  {
    id: "4",
    provider: "Coastal Lines Inc.",
    contactPerson: "Patricia Webb",
    email: "support@coastallines.com",
    phone: "+1 (415) 555-0726",
    address: "Gate 1, San Francisco Ferry Building, CA 94105",
    licenseNumber: "CA-PUC-2019-1104",
    registeredDate: "2021-06-18",
    status: "Suspended",
    totalFerries: 1,
    totalRoutes: 1,
    totalBookings: 21,
    totalRevenue: 1890.0,
    commissionPaid: 189.0,
    providerPayout: 1701.0,
    ferries: [
      {
        id: "v-401",
        name: "Golden Gate Clipper",
        type: "High-Speed Monohull",
        capacity: 150,
        yearBuilt: 2018,
        status: "Maintenance"
      }
    ],
    routes: [
      {
        id: "r-6",
        routeName: "San Francisco ⇄ Sausalito",
        departurePort: "SF Ferry Building",
        arrivalPort: "Sausalito Ferry Terminal",
        duration: "30m",
        dailyTrips: 6,
        price: 18.0,
        status: "Inactive"
      }
    ],
    recentBookings: []
  },
  {
    id: "5",
    provider: "Caribbean Waves Co.",
    contactPerson: "Alexander Cruz",
    email: "ops@caribbeanwaves.com",
    phone: "+1 (340) 555-0918",
    address: "Red Hook Terminal, St. Thomas, VI 00802",
    licenseNumber: "VI-MAR-2023-3190",
    registeredDate: "2023-11-04",
    status: "Active",
    totalFerries: 2,
    totalRoutes: 2,
    totalBookings: 184,
    totalRevenue: 15640.0,
    commissionPaid: 1564.0,
    providerPayout: 14076.0,
    ferries: [
      {
        id: "v-501",
        name: "St. John Voyager",
        type: "Fast Passenger Catamaran",
        capacity: 160,
        yearBuilt: 2022,
        status: "In Service"
      },
      {
        id: "v-502",
        name: "Cruz Bay Cruiser",
        type: "Hydrofoil Express",
        capacity: 110,
        yearBuilt: 2023,
        status: "In Service"
      }
    ],
    routes: [
      {
        id: "r-7",
        routeName: "St. Thomas ⇄ St. John",
        departurePort: "Red Hook Ferry Terminal",
        arrivalPort: "Cruz Bay Ferry Dock",
        duration: "20m",
        dailyTrips: 12,
        price: 12.0,
        status: "Active"
      }
    ],
    recentBookings: []
  }
];

export const ADMIN_DASHBOARD_DATA = {
  summaryStats: {
    totalProviders: 5,
    totalFerries: 9,
    totalBookings: 1248,
    totalPassengers: 2460
  },

  bookingOverview: {
    confirmedBookings: 6,
    cancelledBookings: 2
  },

  paymentOverview: {
    totalBookingValue: 1130.0,
    commission: 113.0,
    providerAmount: 1017.0
  },

  recentBookings: [
    {
      id: "1",
      bookingReference: "FG-20240815-001",
      passenger: "Elena Rodriguez",
      provider: "Island Ferry Co.",
      route: "Honolulu → Maui",
      travelDate: "2024-08-20",
      pax: 4,
      amount: 180.0,
      status: "Confirmed"
    },
    {
      id: "2",
      bookingReference: "FG-20240815-002",
      passenger: "Michael Chang",
      provider: "BlueSea Transit",
      route: "Miami → Key West",
      travelDate: "2024-08-21",
      pax: 2,
      amount: 120.0,
      status: "Confirmed"
    },
    {
      id: "3",
      bookingReference: "FG-20240814-003",
      passenger: "Sarah Thompson",
      provider: "Island Ferry Co.",
      route: "Honolulu → Lanai",
      travelDate: "2024-08-19",
      pax: 3,
      amount: 105.0,
      status: "Cancelled"
    },
    {
      id: "4",
      bookingReference: "FG-20240814-004",
      passenger: "David Kim",
      provider: "Pacific Crossing Ltd.",
      route: "Seattle → Bainbridge Island",
      travelDate: "2024-08-22",
      pax: 5,
      amount: 75.0,
      status: "Confirmed"
    },
    {
      id: "5",
      bookingReference: "FG-20240813-005",
      passenger: "Jennifer Walsh",
      provider: "BlueSea Transit",
      route: "Fort Lauderdale → Bimini",
      travelDate: "2024-08-23",
      pax: 2,
      amount: 170.0,
      status: "Confirmed"
    }
  ] satisfies RecentBookingItem[],

  recentProviders: [
    {
      id: "1",
      provider: "Island Ferry Co.",
      contactPerson: "James Nakamura",
      totalFerries: 3,
      status: "Active"
    },
    {
      id: "2",
      provider: "BlueSea Transit",
      contactPerson: "Maria Santos",
      totalFerries: 2,
      status: "Active"
    },
    {
      id: "3",
      provider: "Pacific Crossing Ltd.",
      contactPerson: "Robert Chen",
      totalFerries: 1,
      status: "Active"
    },
    {
      id: "4",
      provider: "Coastal Lines Inc.",
      contactPerson: "Patricia Webb",
      totalFerries: 1,
      status: "Suspended"
    },
    {
      id: "5",
      provider: "Caribbean Waves Co.",
      contactPerson: "Alexander Cruz",
      totalFerries: 2,
      status: "Active"
    }
  ] satisfies RecentProviderItem[],


  recentPayments: [
    {
      id: "1",
      bookingReference: "FG-20240815-001",
      provider: "Island Ferry Co.",
      bookingAmount: 180.0,
      commission: 18.0,
      providerAmount: 162.0,
      paymentStatus: "Completed"
    },
    {
      id: "2",
      bookingReference: "FG-20240815-002",
      provider: "BlueSea Transit",
      bookingAmount: 120.0,
      commission: 12.0,
      providerAmount: 108.0,
      paymentStatus: "Completed"
    },
    {
      id: "3",
      bookingReference: "FG-20240814-003",
      provider: "Island Ferry Co.",
      bookingAmount: 105.0,
      commission: 10.5,
      providerAmount: 94.5,
      paymentStatus: "Completed"
    },
    {
      id: "4",
      bookingReference: "FG-20240814-004",
      provider: "Pacific Crossing Ltd.",
      bookingAmount: 75.0,
      commission: 7.5,
      providerAmount: 67.5,
      paymentStatus: "Completed"
    },
    {
      id: "5",
      bookingReference: "FG-20240813-005",
      provider: "BlueSea Transit",
      bookingAmount: 170.0,
      commission: 17.0,
      providerAmount: 153.0,
      paymentStatus: "Pending"
    }
  ] satisfies RecentPaymentItem[]
};
