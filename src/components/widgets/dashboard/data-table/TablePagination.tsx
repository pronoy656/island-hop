"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, ReusableSelect } from "@/ui";

export interface PageSizeOption {
  value: string;
  label: string;
}

export const DEFAULT_PAGE_SIZE_OPTIONS: PageSizeOption[] = [
  { value: "10", label: "10 per page" },
  { value: "20", label: "20 per page" },
  { value: "50", label: "50 per page" }
];

export interface TablePaginationProps {
  /** Current active 1-indexed page */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items across all pages */
  totalCount: number;
  /** Current items per page limit */
  pageSize: number;
  /** Callback when page number changes */
  onPageChange: (newPage: number) => void;
  /** Optional callback when page size limit changes */
  onPageSizeChange?: (newPageSize: number) => void;
  /** Options for the per-page selector dropdown */
  pageSizeOptions?: PageSizeOption[];
  /** Name of the entity being listed (e.g. "passengers", "bookings", "ferries") */
  itemName?: string;
  /** Whether a query or data fetch is currently in flight */
  isLoading?: boolean;
  /** Optional additional class name for the container */
  className?: string;
}

export function TablePagination({
  page,
  totalPages: rawTotalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  itemName = "items",
  isLoading = false,
  className
}: TablePaginationProps) {
  // Guard: if there are no items, do not render pagination
  if (totalCount <= 0) return null;

  const totalPages = Math.max(1, rawTotalPages || Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalCount);

  // Generate smart pagination numbers array with ellipses
  const pageNumbers = React.useMemo<(number | "...")[]>(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [currentPage, totalPages]);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3.5 bg-card p-3 sm:px-4 rounded-xl border border-border/80 shadow-xs",
        className
      )}
    >
      {/* Left: Showing range and optional per-page selector */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>
          Showing <span className="font-semibold text-foreground">{startIndex}</span> to{" "}
          <span className="font-semibold text-foreground">{endIndex}</span> of{" "}
          <span className="font-semibold text-foreground">{totalCount}</span> {itemName}
        </span>

        {onPageSizeChange && pageSizeOptions && pageSizeOptions.length > 0 && (
          <div className="flex items-center gap-1.5 pl-0 sm:pl-3 sm:border-l sm:border-border/60">
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">Show:</span>
            <ReusableSelect
              value={String(pageSize)}
              onValueChange={(val) => {
                onPageSizeChange(Number(val));
                onPageChange(1);
              }}
              options={pageSizeOptions}
              className="h-8 text-xs w-[115px]"
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      {/* Right: Previous, Page Numbers, Next */}
      <div className="flex items-center gap-1.5 self-center sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1 || isLoading}
          className="h-8 px-2.5 text-xs flex items-center gap-1 font-medium"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex items-center gap-1">
          {pageNumbers.map((p, idx) =>
            typeof p === "number" ? (
              <Button
                key={p}
                variant={currentPage === p ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(p)}
                disabled={isLoading}
                className={cn(
                  "h-8 min-w-8 px-2 text-xs font-semibold",
                  currentPage === p
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p}
              </Button>
            ) : (
              <span
                key={`ellipsis-${idx}`}
                className="px-1 text-xs font-bold text-muted-foreground select-none"
              >
                ...
              </span>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages || isLoading}
          className="h-8 px-2.5 text-xs flex items-center gap-1 font-medium"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
