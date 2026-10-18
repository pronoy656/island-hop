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
}

export interface IUpdateFerryPayload {
  name?: string;
  registration?: string;
  capacity?: number;
  type?: VesselType;
  status?: VesselStatus;
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
  code: string | null;
  atoll: string | null;
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

export interface IRoutePortSummary {
  id: string;
  name: string;
  code: string | null;
  atoll: string | null;
}

export interface IRoute {
  id: string;
  operatorId: string;
  departurePortId: string;
  destinationPortId: string;
  durationMinutes: number;
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
  isBorderCrossing?: boolean;
  status?: RouteStatus;
}

export interface IUpdateRoutePayload {
  durationMinutes?: number;
  isBorderCrossing?: boolean;
  status?: RouteStatus;
}

export interface IRouteFilterParams {
  page?: number;
  limit?: number;
  status?: RouteStatus | string;
}
