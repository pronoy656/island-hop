"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon
} from "lucide-react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  parseISO,
  isValid
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function Calendar({
  selected,
  onSelect,
  className,
  minDate,
  maxDate
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    selected && isValid(selected) ? selected : new Date()
  );

  React.useEffect(() => {
    if (selected && isValid(selected)) {
      setCurrentMonth(selected);
    }
  }, [selected]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className={cn("p-3 select-none w-[280px]", className)}>
      {/* Header Month / Year & Nav */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm font-bold text-foreground">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            className="h-7 w-7 rounded-md p-0 border-border/80 hover:bg-muted"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-7 w-7 rounded-md p-0 border-border/80 hover:bg-muted"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday Row */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-[11px] font-semibold text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const isSelectedDay = selected ? isSameDay(day, selected) : false;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDay = isToday(day);

          let isDisabled = false;
          if (minDate && day < startOfMonth(minDate) && !isSameDay(day, minDate)) {
            // optional min check
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect && onSelect(day)}
              className={cn(
                "h-8 w-8 text-xs rounded-md font-medium flex items-center justify-center transition-colors cursor-pointer",
                !isCurrentMonth && "text-muted-foreground/40",
                isCurrentMonth && !isSelectedDay && "text-foreground hover:bg-muted",
                isTodayDay && !isSelectedDay && "border border-blue-500 font-bold text-blue-600 dark:text-blue-400",
                isSelectedDay &&
                  "bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-xs"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface DatePickerProps {
  value?: string; // ISO date string e.g. "2026-09-30"
  onChange?: (val: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  formatStr?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  id,
  formatStr = "MMM dd, yyyy"
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  const handleSelect = (date: Date) => {
    const formatted = format(date, "yyyy-MM-dd");
    onChange?.(formatted);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal text-xs h-9 border-input bg-transparent px-3 py-1 rounded-md shadow-none hover:bg-muted/40",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
          {selectedDate ? (
            <span className="text-foreground font-bold truncate">
              {format(selectedDate, formatStr)}
            </span>
          ) : (
            <span className="text-muted-foreground truncate">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl" align="start">
        <Calendar selected={selectedDate} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}
