import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface ICNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  masked?: boolean;
  error?: string;
  helperText?: string;
  required?: boolean;
}

/**
 * Malaysian IC Number Input Component
 * 
 * Features:
 * - Format: XXXXXX-XX-XXXX (auto-formats as user types)
 * - Validation: 12 digits, valid YYMMDD date, birth year 1900-current
 * - Masking: ******-**-1234 (PDPA compliance)
 * - Mobile-optimized (inputMode="numeric")
 * - WCAG 2.1 AA compliant
 */
export const ICNumberInput = React.forwardRef<HTMLInputElement, ICNumberInputProps>(
  ({ 
    label,
    value, 
    onChange, 
    masked = false,
    error,
    helperText,
    required,
    disabled,
    className,
    ...props 
  }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>('');
    const [isFocused, setIsFocused] = React.useState(false);

    // Format IC number: XXXXXX-XX-XXXX
    const formatIC = (input: string): string => {
      // Remove all non-numeric characters
      const cleaned = input.replace(/\D/g, '');
      
      // Apply formatting
      if (cleaned.length <= 6) {
        return cleaned;
      } else if (cleaned.length <= 8) {
        return `${cleaned.slice(0, 6)}-${cleaned.slice(6)}`;
      } else {
        return `${cleaned.slice(0, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8, 12)}`;
      }
    };

    // Mask IC number: ******-**-1234
    const maskIC = (ic: string): string => {
      if (ic.length !== 14) return ic; // Not fully formatted
      return `******-**-${ic.slice(10)}`;
    };

    // Validate IC number
    const validate = (ic: string): string | undefined => {
      // Remove formatting
      const cleaned = ic.replace(/\D/g, '');
      
      if (required && cleaned.length === 0) {
        return 'IC number is required';
      }

      if (cleaned.length === 0) {
        return undefined; // Optional and empty is valid
      }

      if (cleaned.length !== 12) {
        return 'IC number must be 12 digits';
      }

      // Validate date (first 6 digits: YYMMDD)
      const yearStr = cleaned.slice(0, 2);
      const monthStr = cleaned.slice(2, 4);
      const dayStr = cleaned.slice(4, 6);

      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const day = parseInt(dayStr, 10);

      // Determine full year (assume 00-25 is 2000s, 26-99 is 1900s)
      const currentYear = new Date().getFullYear();
      const currentCentury = Math.floor(currentYear / 100) * 100;
      const fullYear = year <= 25 ? currentCentury + year : currentCentury - 100 + year;

      // Validate year range (1900 to current year)
      if (fullYear < 1900 || fullYear > currentYear) {
        return 'Invalid birth year';
      }

      // Validate month (1-12)
      if (month < 1 || month > 12) {
        return 'Invalid birth month';
      }

      // Validate day (1-31, basic check)
      if (day < 1 || day > 31) {
        return 'Invalid birth day';
      }

      // More thorough day validation based on month
      const daysInMonth = new Date(fullYear, month, 0).getDate();
      if (day > daysInMonth) {
        return `Invalid date: ${monthStr}/${dayStr}/${fullYear}`;
      }

      return undefined;
    };

    // Update display value when value prop changes
    React.useEffect(() => {
      const formatted = formatIC(value);
      if (masked && !isFocused && formatted.length === 14) {
        setDisplayValue(maskIC(formatted));
      } else {
        setDisplayValue(formatted);
      }
    }, [value, masked, isFocused]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Show unmasked value when focused
      setDisplayValue(formatIC(value));
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      
      // Remove formatting and validate
      const cleaned = displayValue.replace(/\D/g, '');
      onChange(cleaned);
      
      // Apply masking if enabled
      const formatted = formatIC(cleaned);
      if (masked && formatted.length === 14) {
        setDisplayValue(maskIC(formatted));
      } else {
        setDisplayValue(formatted);
      }
      
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const cleaned = input.replace(/\D/g, '');
      
      // Limit to 12 digits
      if (cleaned.length <= 12) {
        const formatted = formatIC(cleaned);
        setDisplayValue(formatted);
        onChange(cleaned);
      }
    };

    const validationError = error || validate(value);
    const hasError = !!validationError;

    return (
      <div className="space-y-2">
        {label && (
          <Label 
            htmlFor={props.id}
            className={cn(
              "text-sm font-medium",
              required && "after:content-['*'] after:ml-0.5 after:text-destructive"
            )}
          >
            {label}
          </Label>
        )}
        
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder="XXXXXX-XX-XXXX"
          className={cn(
            "h-11 md:h-10 font-mono",
            hasError && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError 
              ? `${props.id}-error` 
              : helperText 
              ? `${props.id}-helper` 
              : undefined
          }
          {...props}
        />

        {/* Error Message */}
        {hasError && (
          <p 
            id={`${props.id}-error`}
            className="text-sm text-destructive font-medium flex items-center gap-1"
            role="alert"
          >
            <span className="text-base">⚠</span>
            {validationError}
          </p>
        )}

        {/* Helper Text */}
        {!hasError && helperText && (
          <p 
            id={`${props.id}-helper`}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

ICNumberInput.displayName = "ICNumberInput";
