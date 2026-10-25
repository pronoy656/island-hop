import { z } from "zod";

/**
 * Authentication validation schemas
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const phoneRegex = /^\+?[0-9]{7,15}$/;
export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}\[\]|;:'",.<>/?]).{8,}$/;

export const registerUserSchema = z
  .object({
    role: z.enum(["USER", "OPERATOR"]).default("USER"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        passwordRegex,
        "Password must contain uppercase, lowercase, number, and special character"
      ),
    phoneNumber: z
      .string()
      .regex(phoneRegex, "Phone must be 7-15 digits (e.g. +8801712345678)"),
    phone: z.string().optional(),
    name: z.string().optional(),
    companyName: z.string().optional(),
    contactPersonName: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (data.role === "OPERATOR") {
      if (!data.companyName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Company name is required for ferry operators",
          path: ["companyName"]
        });
      }
      if (!data.contactPersonName?.trim() && !data.name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Contact person name is required for operators",
          path: ["contactPersonName"]
        });
      }
    } else {
      if (!data.name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Full name is required",
          path: ["name"]
        });
      }
    }
  });

/**
 * Provider validation schemas for Admin Dashboard
 */
export const providerFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  searchTerm: z.string().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "ALL"]).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});

export const updateProviderStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
  reason: z.string().optional()
});

/**
 * Pagination query schema
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});

export const verifyEmailSchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(4, "Please enter verification code").max(10, "Invalid code length")
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email address")
});

/**
 * Ferry validation schemas
 */
export const vesselTypeEnum = z.enum(["CATAMARAN", "SPEEDBOAT", "TRADITIONAL_FERRY"]);
export const vesselStatusEnum = z.enum(["IN_SERVICE", "MAINTENANCE", "OUT_OF_SERVICE"]);

export const createFerrySchema = z.object({
  name: z.string().min(2, "Ferry name must be at least 2 characters"),
  registration: z.string().min(2, "Registration number is required"),
  capacity: z.coerce.number().int().positive("Capacity must be at least 1 passenger"),
  type: vesselTypeEnum.default("CATAMARAN"),
  status: vesselStatusEnum.default("IN_SERVICE"),
  imageUrl: z.string().optional(),
  amenities: z.array(z.string()).optional()
});

export const updateFerrySchema = createFerrySchema.partial();

export const ferryFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: vesselStatusEnum.optional(),
  type: vesselTypeEnum.optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type ProviderFilterInput = z.infer<typeof providerFilterSchema>;
export type UpdateProviderStatusInput = z.infer<typeof updateProviderStatusSchema>;
export type PaginationQueryInput = z.infer<typeof paginationQuerySchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type CreateFerryInput = z.infer<typeof createFerrySchema>;
export type UpdateFerryInput = z.infer<typeof updateFerrySchema>;
export type FerryFilterInput = z.infer<typeof ferryFilterSchema>;

// ─── ROUTE VALIDATORS ────────────────────────────────────────────────────────

export const routeStatusEnum = z.enum(["ACTIVE", "INACTIVE"]);

export const createRouteSchema = z
  .object({
    departurePortId: z.string().min(1, "Departure port is required"),
    destinationPortId: z.string().min(1, "Destination port is required"),
    durationMinutes: z.coerce
      .number({ invalid_type_error: "durationMinutes must be a number" })
      .int("durationMinutes must be an integer")
      .min(5, "Duration must be at least 5 minutes")
      .max(720, "Duration cannot exceed 720 minutes (12 hours)"),
    isBorderCrossing: z.boolean().optional().default(false),
    status: routeStatusEnum.optional().default("ACTIVE")
  })
  .superRefine((data, ctx) => {
    if (data.departurePortId === data.destinationPortId) {
      ctx.addIssue({
        code: "custom",
        message: "Departure port and destination port cannot be the same",
        path: ["destinationPortId"]
      });
    }
  });

export const updateRouteSchema = z.object({
  durationMinutes: z.coerce
    .number()
    .int()
    .min(5, "Duration must be at least 5 minutes")
    .max(720, "Duration cannot exceed 720 minutes (12 hours)")
    .optional(),
  isBorderCrossing: z.boolean().optional(),
  status: routeStatusEnum.optional()
});

export const routeFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: routeStatusEnum.optional()
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;
export type RouteFilterInput = z.infer<typeof routeFilterSchema>;
