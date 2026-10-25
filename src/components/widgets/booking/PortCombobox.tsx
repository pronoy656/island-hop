"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Loader2, LucideIcon, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUniquePorts } from "@/data/ports";
import { useConnectedPortsQuery } from "@/hooks/use-routes";
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

export interface PortOption {
  id?: string;
  name: string;
}

interface PortComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: LucideIcon;
  className?: string;
  options?: Array<PortOption | string>;
  isLoading?: boolean;
  disabled?: boolean;
}

export function PortCombobox({
  value,
  onChange,
  placeholder = "Select port...",
  icon: Icon = MapPin,
  className,
  options,
  isLoading: externalLoading,
  disabled = false
}: PortComboboxProps) {
  const [open, setOpen] = useState(false);
  const { data: connectedPorts = [], isLoading: internalLoading } = useConnectedPortsQuery();

  const isLoading = externalLoading ?? (options === undefined && internalLoading);

  const normalizedPorts: PortOption[] = useMemo(() => {
    if (options && options.length > 0) {
      return options.map((opt) => (typeof opt === "string" ? { name: opt } : opt));
    }
    if (connectedPorts && connectedPorts.length > 0) {
      return connectedPorts.map((cp) => ({
        id: cp.portId,
        name: cp.portName
      }));
    }
    return getUniquePorts().map((name) => ({ name }));
  }, [options, connectedPorts]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          disabled={disabled}
          aria-expanded={open}
          aria-controls="port-combobox-list"
          className={cn(
            "border-input bg-muted/40 text-foreground hover:bg-muted/60 focus:border-ring flex h-11 w-full items-center justify-between gap-2 rounded-xl border px-3.5 text-xs font-bold transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
            className
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            {isLoading ? (
              <Loader2 className="text-muted-foreground h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
            )}
            <span className={cn("truncate", !value && "text-muted-foreground font-normal")}>
              {value || placeholder}
            </span>
          </div>
          <ChevronDown className="text-muted-foreground h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0 shadow-xl" align="start">
        <Command>
          <CommandInput placeholder="Search island / port..." />
          <CommandList id="port-combobox-list">
            <CommandEmpty>No island or port found.</CommandEmpty>
            <CommandGroup heading="Available Ports">
              {normalizedPorts.map((port) => (
                <CommandItem
                  key={port.id || port.name}
                  value={port.name}
                  onSelect={(currentValue) => {
                    const selected = normalizedPorts.find(
                      (p) => p.name.toLowerCase() === currentValue.toLowerCase()
                    );
                    onChange(selected?.name || port.name);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between py-2 cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="text-muted-foreground mr-1 h-3.5 w-3.5 shrink-0" />
                    <span className="truncate font-medium">{port.name}</span>
                  </div>
                  {value === port.name && (
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
