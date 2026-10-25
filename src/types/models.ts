/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

/**
 * Standard API error response structure
 */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errorMessages?: Array<{
    path: string | number;
    message: string;
  }>;
  stack?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPage?: number;
  totalPages?: number;
}

/**
 * Common User interface
 */
export interface IUser {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
  avatar?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Authentication and Registration contracts
 */
export type UserRole = "USER" | "OPERATOR" | "ADMIN";

export interface IAdminUserItem {
  id: string;
  email: string;
  name?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
  role: "USER" | "OPERATOR" | "ADMIN" | string;
  status: "ACTIVE" | "SUSPENDED" | string;
  isEmailVerified?: boolean;
  isRootAdmin?: boolean;
  avatar?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  operatorProfile?: {
    id: string;
    userId: string;
    companyName: string;
    contactPersonName?: string;
    contactEmail?: string | null;
    businessAddress?: string | null;
  } | null;
}

export interface UserFilterParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  search?: string;
  role?: "USER" | "OPERATOR" | "ADMIN" | "ALL" | string;
  status?: "ACTIVE" | "SUSPENDED" | "ALL" | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IUserListResponse {
  data: IAdminUserItem[];
  pagination: PaginationMeta;
}

export interface IRegisterPayload {
  email: string;
  password: string;
  role?: UserRole | string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  companyName?: string;
  contactPersonName?: string;
}

export interface IRegisterResponse {
  userId: string;
  accountState: string;
  status: string;
  message: string;
}

/**
 * Admin Dashboard Analytics & Overview contracts
 */
export interface IAdminAnalyticsOverview {
  providers: {
    total: number;
    active: number;
    suspended: number;
  };
  fleet: {
    total: number;
    inService: number;
    maintenance: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    checkedIn: number;
    cancelled: number;
  };
  passengers: {
    totalPax: number;
    boardedPax: number;
  };
  financials: {
    grossSales: number;
    platformCommission: number;
    providerPayout: number;
  };
  recentProviders: Array<{
    id: string;
    companyName: string;
    contactPersonName: string;
    status: string;
    ferriesCount: number;
    createdAt: string | Date;
  }>;
  recentBookings: Array<{
    id: string;
    reference: string;
    leadPassengerName: string;
    totalAmount: number;
    status: string;
    createdAt: string | Date;
    route: string;
    vessel: string;
  }>;
}

/**
 * Ferry Provider contracts for Admin
 */
export interface IAdminProviderItem {
  id: string;
  userId: string;
  companyName: string;
  contactPersonName: string;
  contactEmail: string | null;
  businessAddress: string | null;
  bufferMinutes: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  user: {
    id: string;
    email: string;
    name: string;
    status: string;
  };
  ferriesCount: number;
  routesCount: number;
}

export interface IAdminProviderFerry {
  id: string;
  name: string;
  registration?: string;
  capacity: number;
  status: string;
  type?: string;
  yearBuilt?: number;
  createdAt?: string | Date;
}

export interface IAdminProviderRoute {
  id: string;
  departurePort: {
    id: string;
    name: string;
    code?: string | null;
  };
  destinationPort: {
    id: string;
    name: string;
    code?: string | null;
  };
  durationMinutes?: number;
  duration?: string;
  isBorderCrossing?: boolean;
  basePrice?: number;
  price?: number;
  status: string;
  dailyTrips?: number;
}

export interface IAdminProviderDetail {
  id: string;
  userId: string;
  companyName: string;
  contactPersonName: string;
  contactEmail: string | null;
  businessAddress: string | null;
  bufferMinutes: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  user: {
    id: string;
    email: string;
    name: string;
    phoneNumber?: string | null;
    status: string;
    isEmailVerified?: boolean;
    createdAt?: string | Date;
  };
  ferries: IAdminProviderFerry[];
  routes: IAdminProviderRoute[];
  _count?: {
    ferries: number;
    routes: number;
    offDays?: number;
  };
}

export interface ProviderFilterParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IProviderStatusUpdatePayload {
  status: "ACTIVE" | "SUSPENDED" | string;
  reason?: string;
}

export interface IVerifyEmailPayload {
  email: string;
  otp: string;
}

export interface IResendVerificationPayload {
  email: string;
}

/**
 * Ferry and Fleet Management contracts
 */
export type VesselType = "CATAMARAN" | "SPEEDBOAT" | "TRADITIONAL_FERRY";

export type VesselStatus = "IN_SERVICE" | "MAINTENANCE" | "OUT_OF_SERVICE";

export interface IFerry {
  id: string;
  operatorId: string;
  name: string;
  registration: string;
  capacity: number;
  type: VesselType;
  status: VesselStatus;
  imageUrl?: string | null;
  amenities?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  scheduleCount?: number;
}

export interface IFerryListResponse {
  items: IFerry[];
  meta: PaginationMeta;
}

export interface ICreateFerryPayload {
  name: string;
  registration: string;
  capacity: number;
  type?: VesselType;
  status?: VesselStatus;
  imageUrl?: string;
  amenities?: string[];
}

export interface IUpdateFerryPayload {
  name?: string;
  registration?: string;
  capacity?: number;
  type?: VesselType;
  status?: VesselStatus;
  imageUrl?: string;
  amenities?: string[];
}

export interface IFerryFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: VesselStatus | string;
  type?: VesselType | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IFerryStats {
  totalFerries: number;
  inServiceFerries: number;
  maintenanceFerries: number;
  outOfServiceFerries: number;
  totalCapacity: number;
}

// ─── ROUTE & PORT CONTRACTS ──────────────────────────────────────────────────

export type RouteStatus = "ACTIVE" | "INACTIVE";

export interface IPort {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface IPortListResponse {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: IPort[];
}

export interface ICreatePortPayload {
  name: string;
  isActive?: boolean;
}

export interface IUpdatePortPayload {
  name?: string;
  isActive?: boolean;
}

export interface IConnectedDestination {
  portId: string;
  portName: string;
}

export interface IConnectedPort {
  portId: string;
  portName: string;
  destinations: IConnectedDestination[];
}

export interface IRoutePortSummary {
  id: string;
  name: string;
  region?: string;
}

export interface IRoute {
  id: string;
  operatorId: string;
  departurePortId: string;
  destinationPortId: string;
  durationMinutes: number;
  basePrice?: number | null;
  description?: string | null;
  amenities?: string[];
  imageUrl?: string | null;
  isBorderCrossing: boolean;
  status: RouteStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
  departurePort: IRoutePortSummary;
  destinationPort: IRoutePortSummary;
}

export interface IRoutePagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface IRouteListResponse {
  pagination: IRoutePagination;
  routes: IRoute[];
}

export interface ICreateRoutePayload {
  departurePortId: string;
  destinationPortId: string;
  durationMinutes: number;
  basePrice?: number;
  description?: string;
  amenities?: string[];
  imageUrl?: string;
  isBorderCrossing?: boolean;
  status?: RouteStatus;
}

export interface IUpdateRoutePayload {
  durationMinutes?: number;
  basePrice?: number;
  description?: string;
  amenities?: string[];
  imageUrl?: string;
  isBorderCrossing?: boolean;
  status?: RouteStatus;
}

export interface IRouteFilterParams {
  page?: number;
  limit?: number;
  status?: RouteStatus | string;
  search?: string;
}

export interface IPopularJourney {
  id: string;
  routeId: string;
  from: string;
  fromPortId: string;
  to: string;
  toPortId: string;
  duration: string;
  durationMinutes: number;
  price: number;
  startingPrice: number;
  frequency: string;
  dailyTripsCount: number;
  totalBookings: number;
  popularityScore: number;
  tag: string;
  tagColor: string;
  rating: number;
  reviews: number;
  highlights: string[];
  category: "speedboat" | "scenic" | string;
  description?: string | null;
  imageUrl?: string | null;
  operatorName?: string;
  departurePort?: {
    id: string;
    name: string;
  };
  destinationPort?: {
    id: string;
    name: string;
  };
}

export interface IPopularRoutesParams {
  limit?: number;
  category?: "all" | "speedboat" | "scenic" | string;
}

/**
 * ─── Trips & Public Search Types ──────────────────────────────────────────────
 */
export interface ISearchedTrip {
  tripId: string;
  departurePort?: string;
  departurePortId?: string;
  destinationPort?: string;
  destinationPortId?: string;
  operator: string;
  vessel: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  availableSeats: number;
  pricePerAdult: number;
  pricePerChild: number;
  totalPrice: number;
  image?: string | null;
  vesselType?: string;
}

export interface ITripSearchResponse {
  message?: string;
  pagination: {
    nextCursor: string | null;
    hasNextPage: boolean;
    limit: number;
  };
  outboundTrips: ISearchedTrip[];
  returnTrips: ISearchedTrip[];
}

export interface ITripSearchParams {
  tripType?: "one-way" | "round-trip";
  from: string;
  to: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  limit?: number;
  cursor?: string;
}

export interface ITripDetail {
  id: string;
  tripId: string;
  operator: string;
  vessel: string;
  vesselType?: string;
  image?: string | null;
  departurePort: string;
  departurePortId?: string;
  destinationPort: string;
  destinationPortId?: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  availableSeats: number;
  adultFare: number;
  childFare: number;
  status: string;
  gate?: string;
  captain?: string;
}

/**
 * ─── Booking & Ticket Types ──────────────────────────────────────────────────
 */
export interface IPassengerInput {
  passengerName: string;
  nationality: string;
  passportOrId: string;
  cabinClass?: "STANDARD" | "BUSINESS" | "VIP";
  luggageCount?: number;
}

export interface ICreateBookingPayload {
  scheduleId: string;
  leadPassengerName: string;
  leadPassengerEmail: string;
  leadPassengerPhone?: string;
  adultsCount: number;
  childrenCount?: number;
  passengers: IPassengerInput[];
}

export interface ITicketItem {
  id: string;
  bookingId: string;
  ticketNumber: string;
  passengerName: string;
  nationality: string;
  passportOrId: string;
  cabinClass: "STANDARD" | "BUSINESS" | "VIP";
  luggageCount: number;
  boardingStatus: "PENDING" | "CHECKED_IN" | "BOARDED";
  boardedAt?: string | null;
  createdAt: string;
}

export interface IPaymentRecord {
  id: string;
  bookingId: string;
  transactionId?: string | null;
  amount: number;
  platformCommission: number;
  operatorPayout: number;
  status: "PENDING" | "COMPLETED" | "REFUNDED" | "FAILED";
  paymentMethod?: string | null;
  paidAt?: string | null;
}

export interface IBookingDetail {
  id: string;
  reference: string;
  userId?: string | null;
  scheduleId: string;
  leadPassengerName: string;
  leadPassengerEmail: string;
  leadPassengerPhone?: string | null;
  adultsCount: number;
  childrenCount: number;
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN";
  createdAt: string;
  updatedAt: string;
  tickets: ITicketItem[];
  payment?: IPaymentRecord | null;
  schedule: {
    id: string;
    departureTime: string;
    arrivalTime: string;
    gate?: string | null;
    captain?: string | null;
    adultFare: number;
    childFare: number;
    status: string;
    availableSeats: number;
    route: {
      id: string;
      durationMinutes: number;
      departurePort: { id: string; name: string };
      destinationPort: { id: string; name: string };
      operator: { id: string; companyName: string; contactPersonName?: string };
    };
    ferry: {
      id: string;
      name: string;
      registration: string;
      capacity: number;
      type: string;
    };
  };
}

export interface IDigitalPassResponse {
  ticketNumber: string;
  bookingReference: string;
  passengerName: string;
  nationality: string;
  passportOrId: string;
  cabinClass: string;
  luggageCount: number;
  boardingStatus: string;
  boardedAt?: string | null;
  trip: {
    tripId: string;
    operatorName: string;
    vesselName: string;
    departurePort: string;
    destinationPort: string;
    departureTime: string;
    arrivalTime: string;
    gate?: string;
  };
  qrCodePayload: string;
}

// ==========================================
// OPERATOR SCHEDULE MANAGEMENT TYPES
// ==========================================

export type OperatorScheduleStatus = "ON_TIME" | "BOARDING" | "DEPARTED" | "DELAYED" | "CANCELLED";

export interface IOperatorSchedule {
  id: string;
  operatorId: string;
  routeId: string;
  ferryId: string;
  departureTime: string;
  arrivalTime: string;
  gate?: string | null;
  captain?: string | null;
  adultFare: number;
  childFare?: number | null;
  status: OperatorScheduleStatus;
  availableSeats: number;
  createdAt: string;
  updatedAt: string;
  route: {
    id: string;
    durationMinutes: number;
    departurePortId?: string;
    destinationPortId?: string;
    departurePort?: { id: string; name: string };
    destinationPort?: { id: string; name: string };
  };
  ferry: {
    id: string;
    operatorId?: string;
    name: string;
    registration?: string;
    capacity: number;
    type?: string;
    status?: string;
  };
  _count?: {
    bookings?: number;
    tickets?: number;
  };
}

export interface IScheduleFilterParams {
  date?: string;
  status?: string;
  routeId?: string;
  page?: number;
  limit?: number;
}

export interface ICreateSchedulePayload {
  routeId: string;
  ferryId: string;
  departureTime: string;
  arrivalTime: string;
  gate?: string;
  captain?: string;
  adultFare: number;
  childFare?: number;
  availableSeats?: number;
}

export interface IUpdateSchedulePayload {
  departureTime?: string;
  arrivalTime?: string;
  gate?: string;
  captain?: string;
  adultFare?: number;
  childFare?: number;
}

export interface IOperatorScheduleListResponse {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: IOperatorSchedule[];
}

// ==========================================
// OFF DAYS / FLEET BLACKOUT TYPES
// ==========================================
export type OffDayCategory = "MAINTENANCE" | "WEATHER" | "PUBLIC_HOLIDAY";

export interface IOffDay {
  id: string;
  operatorId: string;
  ferryId?: string | null;
  ferry?: {
    id: string;
    name: string;
    registration: string;
    type?: string;
  } | null;
  date: string;
  reason: string;
  category: OffDayCategory;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateOffDayPayload {
  date: string | Date;
  reason: string;
  category?: OffDayCategory;
  ferryId?: string | null;
}

export interface IUpdateOffDayPayload {
  date?: string | Date;
  reason?: string;
  category?: OffDayCategory;
  ferryId?: string | null;
}

export interface IOffDayFilterParams {
  year?: number;
  ferryId?: string;
  category?: OffDayCategory;
  page?: number;
  limit?: number;
}

export interface IOffDayListResponse {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: IOffDay[];
}

// ==========================================
// OPERATOR OVERVIEW DASHBOARD TYPES
// ==========================================

export interface IOperatorKpiTrend {
  value: number;
  changePercent: number;
  trend: "up" | "down" | "neutral" | string;
  comparedPeriod: string;
}

export interface IOperatorActiveFleetKpi {
  inService: number;
  total: number;
  ratio: string;
}

export interface IOperatorOverviewKPIs {
  todayPassengers: IOperatorKpiTrend;
  activeFleet: IOperatorActiveFleetKpi;
  todayBookings: IOperatorKpiTrend;
  netRevenue: IOperatorKpiTrend;
}

export interface IOperatorOverviewDeparture {
  id: string;
  departureTime: string;
  arrivalTime: string;
  gate?: string | null;
  captain?: string | null;
  status: string;
  capacity: number;
  bookedSeats: number;
  availableSeats: number;
  route: {
    id: string;
    departurePort: { name: string; code?: string };
    destinationPort: { name: string; code?: string };
  };
  ferry: {
    id: string;
    name: string;
    registration?: string;
    capacity: number;
  };
}

export interface IOperatorOverviewBooking {
  id: string;
  reference?: string;
  bookingReference: string;
  passenger?: string;
  leadPassengerName?: string;
  email?: string;
  leadPassengerEmail?: string;
  route?: string;
  departureTime: string;
  pax: number;
  amount: number;
  totalAmount?: number;
  status: string;
  vesselName?: string;
  schedule?: {
    departureTime: string;
    route?: {
      departurePort?: { name: string; code?: string };
      destinationPort?: { name: string; code?: string };
    };
    ferry?: { name: string };
  };
  tickets?: Array<{ id: string }>;
}

export interface IOperatorOverviewData {
  kpis: IOperatorOverviewKPIs;
  todayDepartures: IOperatorOverviewDeparture[];
  upcomingTrips?: IOperatorOverviewDeparture[];
  recentBookings: IOperatorOverviewBooking[];
}

// ==========================================
// ADMIN BOOKING TYPES (LIVE API)
// ==========================================

export interface IAdminBookingFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface IAdminBookingTicket {
  id: string;
  bookingId?: string;
  ticketNumber: string;
  passengerName: string;
  nationality?: string | null;
  passportOrId?: string | null;
  cabinClass?: string;
  luggageCount?: number;
  boardingStatus?: string;
  boardedAt?: string | null;
  createdAt?: string;
}

export interface IAdminBookingItem {
  id: string;
  reference: string;
  userId?: string | null;
  scheduleId: string;
  leadPassengerName: string;
  leadPassengerEmail: string;
  leadPassengerPhone?: string | null;
  adultsCount: number;
  childrenCount: number;
  totalAmount: number;
  currency?: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "CHECKED_IN" | "COMPLETED" | string;
  createdAt: string;
  updatedAt: string;
  tickets?: IAdminBookingTicket[];
  schedule?: {
    id: string;
    routeId?: string;
    ferryId?: string;
    departureTime: string;
    arrivalTime: string;
    gate?: string | null;
    captain?: string | null;
    adultFare?: number;
    childFare?: number;
    status: string;
    availableSeats?: number;
    route?: {
      id?: string;
      durationMinutes?: number;
      basePrice?: number;
      departurePort?: { id?: string; name: string };
      destinationPort?: { id?: string; name: string };
      operator?: { id?: string; companyName: string; contactPersonName?: string };
    };
    ferry?: {
      id?: string;
      name: string;
      registration?: string;
      capacity?: number;
      type?: string;
      imageUrl?: string | null;
    };
  };
}

export interface IAdminBookingsResponseData {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  data: IAdminBookingItem[];
}

