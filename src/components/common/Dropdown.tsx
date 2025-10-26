"use client";

import { useState } from "react";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/utils/cn";

type DropdownProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{
    label: string;
    value: string;
  }>;
  placeholder?: string;
  className?: string;
};

export const Dropdown = ({
  value,
  onValueChange,
  options,
  placeholder = "선택해주세요",
  className,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} open={isOpen} onOpenChange={setIsOpen}>
      <SelectPrimitive.Trigger
        className={cn(
          "flex items-center gap-1 text-white text-base font-medium hover:opacity-80 transition-opacity cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "focus-visible:ring-[var(--color-surface-inverseprimary)]",
          className,
        )}
        aria-label={`정렬 선택: 현재 ${value}`}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={cn(
            "relative z-50 min-w-[102px]",
            "bg-[#1c2d45]",
            "border border-[rgba(255,255,255,0.1)]",
            "rounded-lg shadow-lg",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          )}
          position="popper"
          side="bottom"
          align="end"
          sideOffset={8}
        >
          <SelectPrimitive.Viewport className="p-0">
            {options.map((option, index) => (
              <div key={option.value}>
                <SelectPrimitive.Item
                  value={option.value}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center gap-1 py-2 px-3",
                    "text-sm font-medium",
                    "outline-none transition-colors",
                    "data-[state=checked]:text-[#00d9ff]",
                    "data-[state=unchecked]:text-white",
                    "hover:bg-[rgba(255,255,255,0.05)]",
                  )}
                >
                  <Check
                    className={cn(
                      "w-4 h-4 flex-shrink-0",
                      "data-[state=checked]:visible",
                      value === option.value ? "visible" : "invisible",
                    )}
                  />
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
                {index < options.length - 1 && (
                  <div className="h-px bg-[rgba(255,255,255,0.1)]" />
                )}
              </div>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
};
