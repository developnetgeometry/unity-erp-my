import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { malaysian } from "@/lib/design-tokens";

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  error?: string;
  helperText?: string;
  required?: boolean;
}

/**
 * Malaysian Currency Input Component
 * 
 * Features:
 * - RM prefix (non-editable)
 * - Auto-formatting: 10000 → RM 10,000.00
 * - Banker's rounding (round half to even)
 * - Min/max validation
 * - Mobile-optimized (inputMode="decimal")
 * - WCAG 2.1 AA compliant
 */
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ 
    label,
    value, 
    onChange, 
    min = 0.01,
    max,
    error,
    helperText,
    required,
    disabled,
    className,
    ...props 
  }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>('');
    const [isFocused, setIsFocused] = React.useState(false);

    // Format number to Malaysian currency
    const formatCurrency = (num: number | null): string => {
      if (num === null || isNaN(num)) return '';
      
      return new Intl.NumberFormat(malaysian.currency.locale, {
        minimumFractionDigits: malaysian.currency.decimals,
        maximumFractionDigits: malaysian.currency.decimals,
      }).format(num);
    };

    // Banker's rounding (round half to even)
    const bankersRound = (num: number, decimals: number = 2): number => {
      const factor = Math.pow(10, decimals);
      const shifted = num * factor;
      const floor = Math.floor(shifted);
      const fraction = shifted - floor;

      if (fraction === 0.5) {
        // Round to nearest even number
        return (floor % 2 === 0 ? floor : floor + 1) / factor;
      }
      
      return Math.round(shifted) / factor;
    };

    // Parse input string to number
    const parseInput = (input: string): number | null => {
      // Remove all non-numeric characters except decimal point
      const cleaned = input.replace(/[^\d.]/g, '');
      if (cleaned === '' || cleaned === '.') return null;
      
      const parsed = parseFloat(cleaned);
      if (isNaN(parsed)) return null;
      
      // Apply banker's rounding
      return bankersRound(parsed, malaysian.currency.decimals);
    };

    // Validate value against min/max
    const validate = (num: number | null): string | undefined => {
      if (num === null) {
        if (required) return 'Amount is required';
        return undefined;
      }

      if (min !== undefined && num < min) {
        return `Amount must be at least ${malaysian.currency.symbol}${formatCurrency(min)}`;
      }

      if (max !== undefined && num > max) {
        return `Amount must not exceed ${malaysian.currency.symbol}${formatCurrency(max)}`;
      }

      return undefined;
    };

    // Update display value when value prop changes
    React.useEffect(() => {
      if (!isFocused) {
        setDisplayValue(value !== null ? formatCurrency(value) : '');
      }
    }, [value, isFocused]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Show raw number when focused for easier editing
      if (value !== null) {
        setDisplayValue(value.toFixed(malaysian.currency.decimals));
      }
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      
      const parsed = parseInput(displayValue);
      const validationError = validate(parsed);
      
      if (!validationError) {
        onChange(parsed);
      }
      
      // Format display value
      setDisplayValue(parsed !== null ? formatCurrency(parsed) : '');
      props.onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setDisplayValue(input);
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
        
        <div className="relative">
          {/* RM Prefix */}
          <span 
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium pointer-events-none",
              disabled && "opacity-50"
            )}
          >
            {malaysian.currency.symbol}
          </span>
          
          {/* Input Field */}
          <Input
            ref={ref}
            type="text"
            inputMode="decimal"
            pattern="[0-9]*"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            className={cn(
              "pl-12 h-11 md:h-10",
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
        </div>

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

CurrencyInput.displayName = "CurrencyInput";
