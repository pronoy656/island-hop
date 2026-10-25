"use client";

import * as React from "react";
import { Search, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/ui";

export interface TableSearchBarProps {
  /** The controlled search input value */
  value: string;
  /** Callback fired on input change */
  onChange: (value: string) => void;
  /** Input placeholder text */
  placeholder?: string;
  /** Optional callback fired when search is cleared */
  onClear?: () => void;
  /** Optional custom container className */
  className?: string;
  /** Optional custom input className */
  inputClassName?: string;
  /** Whether the search input is disabled */
  disabled?: boolean;
}

export function TableSearchBar({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  className,
  inputClassName,
  disabled = false
}: TableSearchBarProps) {
  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "pl-9.5 pr-9 h-10 text-xs bg-card border-border/80 shadow-xs rounded-xl transition-colors",
          inputClassName
        )}
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
          title="Clear search"
          aria-label="Clear search"
        >
          <XCircle className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
