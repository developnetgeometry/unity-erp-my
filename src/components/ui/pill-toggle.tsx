import * as React from "react";
import { cn } from "@/lib/utils";

export interface PillToggleOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

export interface PillToggleProps {
  options: PillToggleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PillToggle({ options, value, onChange, className }: PillToggleProps) {
  const activeIndex = options.findIndex((opt) => opt.value === value);

  return (
    <div
      className={cn(
        "relative inline-flex items-center bg-white border-2 rounded-full p-1",
        "border-[hsl(330,81%,50%)] shadow-[0_2px_6px_rgba(233,30,147,0.25)]",
        "h-[40px] w-[180px]",
        className
      )}
      role="radiogroup"
      aria-label="Role toggle"
    >
      {/* Animated background indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-full bg-[hsl(330,81%,50%)] transition-all duration-300 ease-in-out"
        style={{
          width: `calc(50% - 4px)`,
          left: activeIndex === 0 ? '4px' : 'calc(50% + 0px)',
        }}
        aria-hidden="true"
      />

      {/* Toggle options */}
      {options.map((option, index) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center gap-1.5",
              "rounded-full font-medium text-xs transition-colors duration-300",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(330,81%,50%)] focus-visible:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isActive
                ? "text-white"
                : "text-[hsl(330,81%,50%)] hover:bg-[hsl(330,81%,50%)]/10"
            )}
          >
            {option.icon && (
              <span className="h-4 w-4 flex items-center justify-center">
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
