"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Ship,
  User
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";

import { useSignupMutation } from "@/hooks";

import {
  Badge,
  Button,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger
} from "@/ui";

type UserRole = "passenger" | "operator";

// Schemas
const passengerPersonalSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters")
});
const passengerContactSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(6, "Please enter a valid phone number")
});
const passengerSecuritySchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

const operatorCompanySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  name: z.string().min(2, "Contact person name is required")
});
const operatorContactSchema = z.object({
  email: z.string().email("Please enter a valid business email address"),
  phone: z.string().min(6, "Please enter a valid business phone number")
});
const operatorSecuritySchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

interface SignupState {
  companyName?: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

// -------------------------------------------------------------
// Component: OperatorInfoForm (outside main component to avoid remount)
// -------------------------------------------------------------
function OperatorInfoStepForm({
  defaultValues,
  onNext
}: {
  defaultValues: { companyName?: string; name?: string };
  onNext: (data: z.infer<typeof operatorCompanySchema>) => void;
}) {
  const form = useForm<z.infer<typeof operatorCompanySchema>>({
    resolver: zodResolver(operatorCompanySchema),
    defaultValues: {
      companyName: defaultValues.companyName || "",
      name: defaultValues.name || ""
    }
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4 pt-2">
      <FieldGroup>
        <Controller
          name="companyName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="text-start" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="companyName">Company Name</FieldLabel>
              <div className="relative">
                <Building2 className="text-muted-foreground absolute top-3 left-3.5 h-4 w-4" />
                <Input
                  {...field}
                  id="companyName"
                  placeholder="e.g. OceanLink Ferries"
                  className="bg-card h-11 rounded-xl pl-10 text-xs font-medium"
                  aria-invalid={fieldState.invalid}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="text-start" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Contact Person Name</FieldLabel>
              <div className="relative">
                <User className="text-muted-foreground absolute top-3 left-3.5 h-4 w-4" />
                <Input
                  {...field}
                  id="name"
                  placeholder="e.g. Captain Ahmed"
                  className="bg-card h-11 rounded-xl pl-10 text-xs font-medium"
                  aria-invalid={fieldState.invalid}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end pt-2">
        <Button type="submit" className="h-11 rounded-xl px-6 font-bold shadow-sm">
          Next Step <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

// -------------------------------------------------------------
// Component: PassengerInfoForm (outside main component)
// -------------------------------------------------------------
function PassengerInfoStepForm({
  defaultValues,
  onNext
}: {
  defaultValues: { name?: string };
  onNext: (data: z.infer<typeof passengerPersonalSchema>) => void;
}) {
  const form = useForm<z.infer<typeof passengerPersonalSchema>>({
    resolver: zodResolver(passengerPersonalSchema),
    defaultValues: {
      name: defaultValues.name || ""
    }
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4 pt-2">
      <FieldGroup>
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="text-start" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <div className="relative">
                <User className="text-muted-foreground absolute top-3 left-3.5 h-4 w-4" />
                <Input
                  {...field}
                  id="name"
                  placeholder="e.g. Jane Doe"
                  className="bg-card h-11 rounded-xl pl-10 text-xs font-medium"
                  aria-invalid={fieldState.invalid}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end pt-2">
        <Button type="submit" className="h-11 rounded-xl px-6 font-bold shadow-sm">
          Next Step <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

// -------------------------------------------------------------
// Component: ContactStepForm (outside main component)
// -------------------------------------------------------------
function ContactStepForm({
  role,
  defaultValues,
  onPrev,
  onNext
}: {
  role: UserRole;
  defaultValues: { email?: string; phone?: string };
  onPrev: () => void;
  onNext: (data: { email: string; phone: string }) => void;
}) {
  const schema = role === "operator" ? operatorContactSchema : passengerContactSchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: defaultValues.email || "",
      phone: defaultValues.phone || ""
    }
  });

  return (
    <form onSubmit={form.handleSubmit(onNext)} className="space-y-4 pt-2">
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="text-start" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">
                {role === "operator" ? "Company Email Address" : "Email Address"}
              </FieldLabel>
              <div className="relative">
                <Mail className="text-muted-foreground absolute top-3 left-3.5 h-4 w-4" />
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder={role === "operator" ? "operations@company.com" : "jane@example.com"}
                  className="bg-card h-11 rounded-xl pl-10 text-xs font-medium"
                  aria-invalid={fieldState.invalid}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="text-start" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
              <div className="relative">
                <Phone className="text-muted-foreground absolute top-3 left-3.5 h-4 w-4" />
                <Input
                  {...field}
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="bg-card h-11 rounded-xl pl-10 text-xs font-medium"
                  aria-invalid={fieldState.invalid}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="h-11 rounded-xl px-5 font-semibold"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Previous
        </Button>
        <Button type="submit" className="h-11 rounded-xl px-6 font-bold shadow-sm">
          Next Step <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

// -------------------------------------------------------------
// Component: SecurityStepForm (outside main component)
// -------------------------------------------------------------
function SecurityStepForm({
  role,
  defaultValues,
  isLoading,
  isSubmitted,
  onPrev,
  onSubmit
}: {
  role: UserRole;
  defaultValues: { password?: string; confirmPassword?: string };
  isLoading: boolean;
  isSubmitted: boolean;
  onPrev: () => void;
  onSubmit: (data: { password: string; confirmPassword: string }) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const schema = role === "operator" ? operatorSecuritySchema : passengerSecuritySchema;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: defaultValues.password || "",
      confirmPassword: defaultValues.confirmPassword || ""
    }
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
      <FieldGroup>
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="text-start" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Create Password</FieldLabel>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-3 left-3.5 h-4 w-4" />
                <Input
                  {...field}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-card h-11 rounded-xl pr-10 pl-10 text-xs font-medium"
                  aria-invalid={fieldState.invalid}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground absolute top-3 right-3.5"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field className="text-start" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
              <div className="relative">
                <Lock className="text-muted-foreground absolute top-3 left-3.5 h-4 w-4" />
                <Input
                  {...field}
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-card h-11 rounded-xl pr-10 pl-10 text-xs font-medium"
                  aria-invalid={fieldState.invalid}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground absolute top-3 right-3.5"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          disabled={isLoading}
          className="h-11 rounded-xl px-5 font-semibold"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Previous
        </Button>
        <Button
          type="submit"
          className="h-11 rounded-xl px-6 font-bold shadow-md transition-all hover:shadow-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : isSubmitted ? (
            <>
              <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-400" />
              Success!
            </>
          ) : (
            <>
              Complete Registration <ArrowRight className="ml-1.5 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------
export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role") === "operator" ? "operator" : "passenger";

  const [role, setRole] = useState<UserRole>(initialRole);
  const [currentStep, setCurrentStep] = useState("info");
  const [signupData, setSignupData] = useState<SignupState>({});
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const signupMutation = useSignupMutation();

  const steps =
    role === "operator"
      ? [
          { id: "info", title: "Company", description: "Company & Contact Name" },
          { id: "contact", title: "Contact", description: "Email & Phone" },
          { id: "security", title: "Security", description: "Set Password" }
        ]
      : [
          { id: "info", title: "Personal", description: "Your Full Name" },
          { id: "contact", title: "Contact", description: "Email & Phone" },
          { id: "security", title: "Security", description: "Set Password" }
        ];

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setCurrentStep("info");
    setCompletedSteps({});
    setSignupData({});
    setIsSubmitted(false);
  };

  const handleFinalSubmit = (securityData: { password: string }) => {
    const finalData = {
      ...signupData,
      password: securityData.password
    };

    signupMutation.mutate(
      {
        name: finalData.name || "",
        email: finalData.email || "",
        password: finalData.password || ""
      },
      {
        onSuccess: () => {
          setIsSubmitted(true);
          setCompletedSteps((prev) => ({ ...prev, security: true }));
          setTimeout(() => {
            router.push(`/login?role=${role}`);
          }, 1200);
        }
      }
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header */}
      <div className="space-y-4">
        {/* Role Pill Badge */}
        <Badge
          variant="outline"
          className="border-primary/30 bg-primary/10 text-primary w-fit text-[11px] font-bold tracking-wider uppercase"
        >
          <span className="bg-primary mr-1.5 inline-block h-2 w-2 rounded-full" />
          {role === "operator" ? "FERRY PROVIDER" : "PASSENGER"}
        </Badge>

        {/* Role Toggle Switcher */}
        <div className="border-border bg-muted/60 flex rounded-xl border p-1">
          <button
            type="button"
            onClick={() => handleRoleChange("passenger")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              role === "passenger"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            Passenger
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("operator")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all ${
              role === "operator"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Ship className="h-3.5 w-3.5" />
            Ferry Operator
          </button>
        </div>

        {/* Titles */}
        <div className="space-y-1">
          <h2 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
            {role === "operator" ? "Create your provider account" : "Create your passenger account"}
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {role === "operator"
              ? "Register your ferry company to start managing your maritime services on IslandHop."
              : "Register to easily book ferries, receive digital tickets, and travel across the islands."}
          </p>
        </div>
      </div>

      {/* Stepper Progress & Forms */}
      <Stepper
        steps={steps}
        value={currentStep}
        onValueChange={(v) => {
          if (isSubmitted) return;
          if (completedSteps[v] || v === currentStep) {
            setCurrentStep(v);
          }
        }}
        className="flex flex-col gap-6"
        orientation="horizontal"
      >
        <StepperNav>
          {steps.map((step, index) => {
            const isDone = !!completedSteps[step.id];
            const isAllowed = isDone || step.id === currentStep;

            return (
              <StepperItem key={step.id} stepId={step.id} className="relative flex-1">
                <StepperTrigger
                  className={cn(
                    "flex flex-col gap-2",
                    !isAllowed || isSubmitted ? "pointer-events-none opacity-60" : ""
                  )}
                  aria-disabled={!isAllowed || isSubmitted}
                >
                  <StepperIndicator
                    className={
                      isDone
                        ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : ""
                    }
                  >
                    {index + 1}
                  </StepperIndicator>
                  <StepperTitle className="text-xs font-bold">{step.title}</StepperTitle>
                </StepperTrigger>
                {steps.length > index + 1 && (
                  <StepperSeparator
                    className={cn(
                      "absolute top-2.5 right-[calc(-50%+16px)] left-[calc(50%+16px)]",
                      isDone ? "bg-emerald-500/50" : ""
                    )}
                  />
                )}
              </StepperItem>
            );
          })}
        </StepperNav>

        <StepperPanel className="w-full">
          <StepperContent value="info">
            {role === "operator" ? (
              <OperatorInfoStepForm
                defaultValues={{
                  companyName: signupData.companyName,
                  name: signupData.name
                }}
                onNext={(data) => {
                  setSignupData((prev) => ({ ...prev, ...data }));
                  setCompletedSteps((prev) => ({ ...prev, info: true }));
                  setCurrentStep("contact");
                }}
              />
            ) : (
              <PassengerInfoStepForm
                defaultValues={{
                  name: signupData.name
                }}
                onNext={(data) => {
                  setSignupData((prev) => ({ ...prev, ...data }));
                  setCompletedSteps((prev) => ({ ...prev, info: true }));
                  setCurrentStep("contact");
                }}
              />
            )}
          </StepperContent>

          <StepperContent value="contact">
            <ContactStepForm
              role={role}
              defaultValues={{
                email: signupData.email,
                phone: signupData.phone
              }}
              onPrev={() => setCurrentStep("info")}
              onNext={(data) => {
                setSignupData((prev) => ({ ...prev, ...data }));
                setCompletedSteps((prev) => ({ ...prev, contact: true }));
                setCurrentStep("security");
              }}
            />
          </StepperContent>

          <StepperContent value="security">
            <SecurityStepForm
              role={role}
              defaultValues={{
                password: signupData.password,
                confirmPassword: signupData.confirmPassword
              }}
              isLoading={signupMutation.isPending}
              isSubmitted={isSubmitted}
              onPrev={() => setCurrentStep("contact")}
              onSubmit={(data) => {
                setSignupData((prev) => ({ ...prev, ...data }));
                handleFinalSubmit(data);
              }}
            />
          </StepperContent>
        </StepperPanel>
      </Stepper>

      {/* Switch to Sign In */}
      <div className="text-muted-foreground pt-1 text-center text-xs">
        Already have an account?{" "}
        <Link href={`/login?role=${role}`} className="text-primary font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
