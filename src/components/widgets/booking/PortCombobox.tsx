"use client";

import { useMemo, useState } from "react";

import { Check, ChevronDown, LucideIcon, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";

import { getUniquePorts } from "@/data/ports";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/ui";

interface PortComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: LucideIcon;
  className?: string;
}

export function PortCombobox({
  value,
  onChange,
  placeholder = "Select port...",
  icon: Icon = MapPin,
  className
}: PortComboboxProps) {
  const [open, setOpen] = useState(false);
  const ports = useMemo(() => getUniquePorts(), []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls="port-combobox-list"
          className={cn(
            "border-input bg-muted/40 text-foreground hover:bg-muted/60 focus:border-ring flex h-11 w-full items-center justify-between gap-2 rounded-xl border px-3.5 text-xs font-bold transition-colors focus:outline-none",
            className
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
            <span className={cn("truncate", !value && "text-muted-foreground font-normal")}>
              {value || placeholder}
            </span>
          </div>
          <ChevronDown className="text-muted-foreground h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[240px] p-0 shadow-xl" align="start">
        <Command>
          <CommandInput placeholder="Search island / port..." />
          <CommandList id="port-combobox-list">
            <CommandEmpty>No island or port found.</CommandEmpty>
            <CommandGroup heading="Available Ports">
              {ports.map((port) => (
                <CommandItem
                  key={port}
                  value={port}
                  onSelect={(currentValue) => {
                    // Match casing exactly with original port name
                    const selected = ports.find(
                      (p) => p.toLowerCase() === currentValue.toLowerCase()
                    );
                    onChange(selected || port);
                    setOpen(false);
                  }}
                >
                  <Icon className="text-muted-foreground mr-2 h-3.5 w-3.5" />
                  <span className="flex-1 truncate">{port}</span>
                  {value === port && (
                    <Check className="text-primary ml-auto h-3.5 w-3.5 stroke-[2.5]" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
