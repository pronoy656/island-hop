import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type BookingStep = 1 | 2 | 3 | 4;

interface BookingStepperNavProps {
  currentStep: BookingStep;
}

const STEPS = [
  { step: 1, label: "Select Trip" },
  { step: 2, label: "Passenger Details" },
  { step: 3, label: "Payment" },
  { step: 4, label: "Confirmation" }
] as const;

export function BookingStepperNav({ currentStep }: BookingStepperNavProps) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between">
        {STEPS.map((item, index) => {
          const isCompleted = item.step < currentStep;
          const isActive = item.step === currentStep;
          const isUpcoming = item.step > currentStep;

          return (
            <div key={item.step} className="flex flex-1 items-center last:flex-none">
              {/* Step indicator and label */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all sm:h-8 sm:w-8",
                    isActive && "bg-[#003B95] text-white shadow-sm ring-4 ring-[#003B95]/15",
                    isCompleted && "bg-[#003B95] text-white",
                    isUpcoming && "bg-muted text-muted-foreground border-border/80 border"
                  )}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : item.step}
                </div>

                <span
                  className={cn(
                    "hidden text-xs font-semibold tracking-tight transition-colors sm:text-sm md:inline-block",
                    isActive && "font-bold text-[#003B95] dark:text-blue-400",
                    isCompleted && "text-foreground font-semibold",
                    isUpcoming && "text-muted-foreground font-medium"
                  )}
                >
                  {item.label}
                </span>
              </div>

              {/* Connecting line */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-3 h-[1.5px] flex-1 transition-colors sm:mx-6",
                    isCompleted ? "bg-[#003B95]" : "bg-border/80"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
