import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  label: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  excludeDates?: Date[];
  placeholder?: string;
  id?: string;
  className?: string;
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      label,
      value,
      onChange,
      error,
      helperText,
      required,
      disabled,
      minDate,
      maxDate,
      excludeDates = [],
      placeholder = "DD/MM/YYYY",
      id,
      className,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    // Format date as DD/MM/YYYY (Malaysian format)
    const formatDateMalaysian = (date: Date | null): string => {
      if (!date) return "";
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Check if date should be disabled
    const isDateDisabled = (date: Date): boolean => {
      // Check min/max constraints
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;

      // Check excluded dates
      return excludeDates.some((excludedDate) => {
        return (
          date.getDate() === excludedDate.getDate() &&
          date.getMonth() === excludedDate.getMonth() &&
          date.getFullYear() === excludedDate.getFullYear()
        );
      });
    };

    const inputId = id || `date-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const hasError = !!error;

    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
        </Label>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              id={inputId}
              variant="outline"
              disabled={disabled}
              className={cn(
                "w-full justify-start text-left font-normal h-11",
                !value && "text-muted-foreground",
                hasError && "border-destructive focus-visible:ring-destructive"
              )}
              aria-invalid={hasError}
              aria-describedby={
                hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
              }
              aria-required={required}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? formatDateMalaysian(value) : <span>{placeholder}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            {/* Calendar */}
            <Calendar
              mode="single"
              selected={value || undefined}
              onSelect={(date) => {
                onChange(date || null);
                setOpen(false);
              }}
              disabled={isDateDisabled}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {/* Error Message */}
        {hasError && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-destructive flex items-start gap-1"
            role="alert"
          >
            <span aria-hidden="true">⚠</span>
            <span>{error}</span>
          </p>
        )}

        {/* Helper Text */}
        {!hasError && helperText && (
          <p id={`${inputId}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
