"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input, Tabs, TabsList, TabsTrigger } from "@/ui";

export interface TableToolbarTab<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}

export type ToolbarTab<T extends string = string> = TableToolbarTab<T>;

export interface TableToolbarProps<T extends string = string> {
  /** Search input query (alias: searchValue) */
  searchTerm?: string;
  searchValue?: string;
  /** Search input onChange */
  onSearchChange: (value: string) => void;
  /** Search input placeholder */
  searchPlaceholder?: string;
  /** Currently selected tab value */
  activeTab?: T;
  /** Callback fired when a tab is selected */
  onTabChange?: (tab: T) => void;
  /** Tabs to render on the right */
  tabs?: TableToolbarTab<T>[];
  /** Optional extra content or buttons placed after the tabs or search */
  children?: React.ReactNode;
  /** Optional custom container className */
  className?: string;
  /** Optional custom input className */
  inputClassName?: string;
}

export function TableToolbar<T extends string = string>({
  searchTerm,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  activeTab,
  onTabChange,
  tabs,
  children,
  className,
  inputClassName
}: TableToolbarProps<T>) {
  const effectiveSearch = searchTerm ?? searchValue ?? "";

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/80 shadow-xs",
        className
      )}
    >
      {/* Left: Search input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={effectiveSearch}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "pl-9 pr-9 h-9 text-xs bg-background border-border/80 rounded-lg",
            inputClassName
          )}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full transition-colors cursor-pointer"
            title="Clear search"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Right: Status Filter Tabs */}
      {tabs && tabs.length > 0 && activeTab && onTabChange && (
        <Tabs
          value={activeTab}
          onValueChange={(val) => onTabChange(val as T)}
          className="w-auto shrink-0 max-w-full overflow-x-auto"
        >
          <TabsList className="h-9 p-1 bg-muted/80 flex flex-nowrap">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-xs font-semibold px-3 py-1 cursor-pointer whitespace-nowrap"
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-1.5 opacity-80 text-[11px] font-bold">
                    ({tab.count})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {children}
    </div>
  );
}
