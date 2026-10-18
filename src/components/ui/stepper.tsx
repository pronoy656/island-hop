"use client";

import type { HTMLAttributes } from "react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { cn } from "@/lib/utils";

// Types
export type StepperOrientation = "horizontal" | "vertical";
export type StepState = "active" | "completed" | "inactive" | "loading";

export type StepIndicators = {
  active?: React.ReactNode;
  completed?: React.ReactNode;
  inactive?: React.ReactNode;
  loading?: React.ReactNode;
};

export type StepDefinition = {
  id: string;
  title?: string;
  description?: string;
  icon?: React.ReactElement;
};

interface StepperContextValue {
  steps: StepDefinition[];
  currentStepId: string;
  currentIndex: number;
  orientation: StepperOrientation;
  configOrientation: StepperOrientation;
  responsive?: boolean;
  registerTrigger: (node: HTMLButtonElement | null, remove?: boolean) => void;
  triggerNodes: HTMLButtonElement[];
  goTo: (stepId: string) => void;
  focusNext: (currentIdx: number) => void;
  focusPrev: (currentIdx: number) => void;
  focusFirst: () => void;
  focusLast: () => void;
  indicators: StepIndicators;
}

interface StepItemContextValue {
  step: StepDefinition;
  index: number;
  state: StepState;
  isDisabled: boolean;
  isLoading: boolean;
}

const StepperContext = createContext<StepperContextValue | undefined>(undefined);
const StepItemContext = createContext<StepItemContextValue | undefined>(undefined);

export function useStepper() {
  const ctx = useContext(StepperContext);
  if (!ctx) throw new Error("useStepper must be used within a Stepper");
  return ctx;
}

export function useStepItem() {
  const ctx = useContext(StepItemContext);
  if (!ctx) throw new Error("useStepItem must be used within a StepperItem");
  return ctx;
}

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  steps: StepDefinition[];
  defaultValue?: string;
  orientation?: StepperOrientation;
  responsive?: boolean;
  indicators?: StepIndicators;
  value?: string;
  onValueChange?: (value: string) => void;
}

export function Stepper({
  steps,
  defaultValue,
  orientation = "horizontal",
  responsive = false,
  className,
  children,
  indicators = {},
  value,
  onValueChange,
  ...props
}: StepperProps) {
  const [internalStepId, setInternalStepId] = useState<string>(
    () => value || defaultValue || steps[0]?.id || ""
  );

  const currentStepId = value !== undefined ? value : internalStepId;
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);

  const [triggerNodes, setTriggerNodes] = useState<HTMLButtonElement[]>([]);
  const [isMdUp, setIsMdUp] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : true
  );

  useEffect(() => {
    if (!responsive) return;
    const mql = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMdUp("matches" in e ? e.matches : mql.matches);

    if ("addEventListener" in mql) {
      mql.addEventListener("change", handler);
    } else {
      // @ts-expect-error legacy
      mql.addListener(handler);
    }

    return () => {
      if ("removeEventListener" in mql) {
        mql.removeEventListener("change", handler);
      } else {
        // @ts-expect-error legacy
        mql.removeListener(handler);
      }
    };
  }, [responsive]);

  const registerTrigger = useCallback((node: HTMLButtonElement | null, remove = false) => {
    setTriggerNodes((prev) => {
      if (!node) return prev;
      if (remove) return prev.filter((n) => n !== node);
      return prev.includes(node) ? prev : [...prev, node];
    });
  }, []);

  const goTo = useCallback(
    (stepId: string) => {
      if (value === undefined) {
        setInternalStepId(stepId);
      }
      onValueChange?.(stepId);
    },
    [value, onValueChange]
  );

  const focusNext = useCallback(
    (currentIdx: number) => triggerNodes[(currentIdx + 1) % triggerNodes.length]?.focus(),
    [triggerNodes]
  );

  const focusPrev = useCallback(
    (currentIdx: number) =>
      triggerNodes[(currentIdx - 1 + triggerNodes.length) % triggerNodes.length]?.focus(),
    [triggerNodes]
  );

  const focusFirst = useCallback(() => triggerNodes[0]?.focus(), [triggerNodes]);
  const focusLast = useCallback(
    () => triggerNodes[triggerNodes.length - 1]?.focus(),
    [triggerNodes]
  );

  const effectiveOrientation: StepperOrientation = useMemo(() => {
    if (responsive && orientation === "horizontal") {
      return isMdUp ? "horizontal" : "vertical";
    }
    return orientation;
  }, [responsive, orientation, isMdUp]);

  const contextValue = useMemo<StepperContextValue>(
    () => ({
      steps,
      currentStepId,
      currentIndex: currentIndex >= 0 ? currentIndex : 0,
      orientation: effectiveOrientation,
      configOrientation: orientation,
      responsive,
      registerTrigger,
      goTo,
      focusNext,
      focusPrev,
      focusFirst,
      focusLast,
      triggerNodes,
      indicators
    }),
    [
      steps,
      currentStepId,
      currentIndex,
      effectiveOrientation,
      orientation,
      responsive,
      registerTrigger,
      goTo,
      focusNext,
      focusPrev,
      focusFirst,
      focusLast,
      triggerNodes,
      indicators
    ]
  );

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        role="tablist"
        aria-orientation={effectiveOrientation}
        data-slot="stepper"
        className={cn("w-full", className)}
        data-orientation={effectiveOrientation}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  );
}

export interface StepperItemProps extends React.HTMLAttributes<HTMLDivElement> {
  stepId: string;
  completed?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export function StepperItem({
  stepId,
  completed = false,
  disabled = false,
  loading = false,
  className,
  children,
  ...props
}: StepperItemProps) {
  const { steps, currentIndex } = useStepper();
  const stepIndex = steps.findIndex((s) => s.id === stepId);
  const step = steps.find((s) => s.id === stepId) || { id: stepId };

  const state: StepState =
    completed || stepIndex < currentIndex
      ? "completed"
      : currentIndex === stepIndex
        ? "active"
        : "inactive";

  const isLoading = loading && currentIndex === stepIndex;

  return (
    <StepItemContext.Provider
      value={{ step, index: stepIndex, state, isDisabled: disabled, isLoading }}
    >
      <div
        data-slot="stepper-item"
        className={cn(
          "group/step flex items-center justify-center not-last:flex-1 group-data-[orientation=horizontal]/stepper-nav:flex-row group-data-[orientation=vertical]/stepper-nav:flex-col",
          className
        )}
        data-state={state}
        {...(isLoading ? { "data-loading": true } : {})}
        {...props}
      >
        {children}
      </div>
    </StepItemContext.Provider>
  );
}

export interface StepperTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function StepperTrigger({
  asChild = false,
  className,
  children,
  tabIndex,
  ...props
}: StepperTriggerProps) {
  const { state, isLoading, step, isDisabled } = useStepItem();
  const {
    currentStepId,
    registerTrigger,
    triggerNodes,
    focusNext,
    focusPrev,
    focusFirst,
    focusLast,
    goTo
  } = useStepper();

  const isSelected = currentStepId === step.id;
  const id = `stepper-tab-${step.id}`;
  const panelId = `stepper-panel-${step.id}`;

  const [btnNode, setBtnNode] = useState<HTMLButtonElement | null>(null);

  const triggerRef = useCallback(
    (node: HTMLButtonElement | null) => {
      setBtnNode(node);
      if (node) {
        registerTrigger(node);
      } else if (btnNode) {
        registerTrigger(btnNode, true);
      }
    },
    [registerTrigger, btnNode]
  );

  const myIdx = useMemo(
    () => (btnNode ? triggerNodes.findIndex((n: HTMLButtonElement) => n === btnNode) : -1),
    [triggerNodes, btnNode]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        if (myIdx !== -1 && focusNext) focusNext(myIdx);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        if (myIdx !== -1 && focusPrev) focusPrev(myIdx);
        break;
      case "Home":
        e.preventDefault();
        if (focusFirst) focusFirst();
        break;
      case "End":
        e.preventDefault();
        if (focusLast) focusLast();
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        goTo(step.id);
        break;
    }
  };

  if (asChild) {
    return (
      <span data-slot="stepper-trigger" data-state={state} className={className}>
        {children}
      </span>
    );
  }

  return (
    <button
      ref={triggerRef}
      role="tab"
      id={id}
      aria-selected={isSelected}
      aria-controls={panelId}
      tabIndex={typeof tabIndex === "number" ? tabIndex : isSelected ? 0 : -1}
      data-slot="stepper-trigger"
      data-state={state}
      data-loading={isLoading}
      className={cn(
        "inline-flex cursor-pointer items-center outline-none disabled:pointer-events-none disabled:opacity-60",
        "gap-2.5 rounded-full",
        className
      )}
      onClick={() => goTo(step.id)}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      {...props}
    >
      {children}
    </button>
  );
}

export interface StepperIndicatorProps extends React.ComponentProps<"div"> {
  variant?: "default" | "outline";
}

export function StepperIndicator({
  children,
  className,
  variant = "default"
}: StepperIndicatorProps) {
  const { state, isLoading, step } = useStepItem();
  const { indicators } = useStepper();

  const base =
    "relative flex size-8 shrink-0 items-center justify-center overflow-hidden transition-all duration-300 rounded-md text-sm font-medium";

  const defaultClasses = cn(
    "border-background bg-muted data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground ring-offset-background group-data-[state=active]/step:ring-primary/30 group-data-[state=active]/step:ring-2 group-data-[state=active]/step:ring-offset-3",
    base
  );

  const outlineClasses = cn(
    "border-primary/20 text-muted-foreground data-[state=completed]:border-foreground data-[state=completed]:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground border bg-transparent",
    base
  );

  const classes = variant === "outline" ? outlineClasses : defaultClasses;

  return (
    <div data-slot="stepper-indicator" data-state={state} className={cn(classes, className)}>
      <div className="absolute">
        {(isLoading ? indicators?.loading : indicators?.[state]) ??
          (step?.icon ? <span className="*:[svg]:size-4">{step.icon}</span> : children)}
      </div>
    </div>
  );
}

export function StepperSeparator({ className }: React.ComponentProps<"div">) {
  const { state } = useStepItem();

  return (
    <div
      data-slot="stepper-separator"
      data-state={state}
      className={cn(
        "bg-muted group-data-[state=completed]/step:bg-primary m-2 rounded-sm transition-colors duration-500 group-data-[orientation=horizontal]/stepper-nav:h-0.5 group-data-[orientation=horizontal]/stepper-nav:flex-1 group-data-[orientation=vertical]/stepper-nav:h-12 group-data-[orientation=vertical]/stepper-nav:w-0.5",
        className
      )}
    />
  );
}

export function StepperTitle({ children, className }: React.ComponentProps<"h3">) {
  const { state } = useStepItem();

  return (
    <h3
      data-slot="stepper-title"
      data-state={state}
      className={cn("text-sm font-medium", className)}
    >
      {children}
    </h3>
  );
}

export function StepperDescription({ children, className }: React.ComponentProps<"div">) {
  const { state } = useStepItem();

  return (
    <div
      data-slot="stepper-description"
      data-state={state}
      className={cn("text-muted-foreground text-xs font-medium", className)}
    >
      {children}
    </div>
  );
}

export function StepperNav({ children, className }: React.ComponentProps<"nav">) {
  const { currentStepId, orientation, configOrientation, responsive } = useStepper();

  const responsiveNavClasses =
    responsive && configOrientation === "horizontal" ? "flex-col md:flex-row md:w-full" : "";

  return (
    <nav
      data-slot="stepper-nav"
      data-state={currentStepId}
      data-orientation={orientation}
      className={cn(
        "group/stepper-nav inline-flex data-[orientation=horizontal]:w-full data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col",
        responsiveNavClasses,
        className
      )}
    >
      {children}
    </nav>
  );
}

export function StepperPanel({ children, className }: React.ComponentProps<"div">) {
  const { currentStepId } = useStepper();

  return (
    <div data-slot="stepper-panel" data-state={currentStepId} className={cn("w-full", className)}>
      {children}
    </div>
  );
}

export interface StepperContentProps extends React.ComponentProps<"div"> {
  value: string;
  forceMount?: boolean;
}

export function StepperContent({ value, forceMount, children, className }: StepperContentProps) {
  const { currentStepId } = useStepper();
  const isActive = value === currentStepId;

  if (!forceMount && !isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`stepper-panel-${value}`}
      aria-labelledby={`stepper-tab-${value}`}
      data-slot="stepper-content"
      data-state={currentStepId}
      className={cn("w-full", className, !isActive && forceMount && "hidden")}
      hidden={!isActive && forceMount}
    >
      {children}
    </div>
  );
}
