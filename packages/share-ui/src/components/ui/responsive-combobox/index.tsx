"use client";

import { Button } from "@repo/share-ui/components/reui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/share-ui/components/reui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@repo/share-ui/components/reui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/share-ui/components/reui/popover";
import { useIsMobile } from "@repo/share-ui/hooks/use-mobile";
import { cn } from "@repo/share-ui/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import * as React from "react";

export interface ComboboxOption {
  value: string;
  label: React.ReactNode;
  keywords?: string[];
}

interface ResponsiveComboboxProps {
  label: string;
  value: string;
  onSelect: (val: string) => void;
  options: ComboboxOption[];
  loading?: boolean;
  disabled?: boolean;
}

export function ResponsiveCombobox({ label, value, onSelect, options, loading, disabled }: ResponsiveComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const selectedItem = options.find((opt) => opt.value === value);

  const Content = (
    <Command>
      <CommandInput placeholder={`搜索${label}...`} />
      <CommandList>
        <CommandEmpty>未找到结果</CommandEmpty>
        <CommandGroup>
          {options.map((opt) => (
            <CommandItem
              key={opt.value}
              value={opt.value} // cmdk uses this for filtering if keywords not provided? actually cmdk uses textContent by default or value prop
              keywords={opt.keywords}
              onSelect={() => {
                onSelect(opt.value);
                setOpen(false);
              }}
            >
              <Check className={cn("mr-2 h-4 w-4", value === opt.value ? "opacity-100" : "opacity-0")} />
              {opt.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  const Trigger = (
    <Button
      variant="outline"
      role="combobox"
      className="w-full justify-between font-normal"
      disabled={disabled || loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <span className="truncate flex items-center">{selectedItem ? selectedItem.label : `选择${label}...`}</span>
      )}
      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
    </Button>
  );

  if (!isMobile) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>{Trigger}</PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          {Content}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{Trigger}</DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">{Content}</div>
      </DrawerContent>
    </Drawer>
  );
}
