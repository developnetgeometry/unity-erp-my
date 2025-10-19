import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface PhoneNumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
}

const countryCodes = [
  { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+1', name: 'USA', flag: '🇺🇸' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
];

export const PhoneNumberInput = React.forwardRef<HTMLInputElement, PhoneNumberInputProps>(
  (
    {
      label,
      value,
      onChange,
      error,
      helperText,
      required,
      disabled,
      countryCode = '+60',
      onCountryCodeChange,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState<string>('');
    const [internalError, setInternalError] = React.useState<string | undefined>(error);

    // Format phone number based on country code
    const formatPhoneNumber = (input: string, code: string): string => {
      // Remove all non-digits
      const digits = input.replace(/\D/g, '');

      if (code === '+60') {
        // Malaysian format: 01X-XXXX XXXX or 0X-XXXX XXXX
        if (digits.length === 0) return '';
        if (digits.length <= 3) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
      }

      // Default format for other countries: XXX-XXX-XXXX
      if (digits.length === 0) return '';
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    };

    // Validate Malaysian phone number
    const validateMalaysianPhone = (digits: string): string | undefined => {
      if (digits.length === 0) return undefined;

      if (digits.length < 10 || digits.length > 11) {
        return 'Malaysian phone numbers must be 10-11 digits';
      }

      // Check if starts with 0
      if (!digits.startsWith('0')) {
        return 'Malaysian phone numbers must start with 0';
      }

      // Mobile: 01X (10-11 digits)
      if (digits.startsWith('01')) {
        const validPrefixes = ['010', '011', '012', '013', '014', '015', '016', '017', '018', '019'];
        const prefix = digits.slice(0, 3);
        if (!validPrefixes.includes(prefix)) {
          return 'Invalid mobile number prefix';
        }
        if (digits.length < 10 || digits.length > 11) {
          return 'Mobile numbers must be 10-11 digits';
        }
        return undefined;
      }

      // Landline: 0X (9-10 digits)
      if (digits.length < 9 || digits.length > 10) {
        return 'Landline numbers must be 9-10 digits';
      }

      return undefined;
    };

    // Validate phone number based on country code
    const validate = (digits: string, code: string): string | undefined => {
      if (digits.length === 0 && !required) return undefined;
      if (digits.length === 0 && required) return `${label} is required`;

      if (code === '+60') {
        return validateMalaysianPhone(digits);
      }

      // Basic validation for other countries (10 digits)
      if (digits.length !== 10) {
        return 'Phone number must be 10 digits';
      }

      return undefined;
    };

    // Parse input and extract digits
    const parseInput = (input: string): string => {
      return input.replace(/\D/g, '');
    };

    // Initialize display value
    React.useEffect(() => {
      if (value) {
        const formatted = formatPhoneNumber(value, countryCode);
        setDisplayValue(formatted);
      } else {
        setDisplayValue('');
      }
    }, [value, countryCode]);

    // Update error when error prop changes
    React.useEffect(() => {
      setInternalError(error);
    }, [error]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      const digits = parseInput(input);

      // Limit digits based on country code
      const maxDigits = countryCode === '+60' ? 11 : 10;
      if (digits.length > maxDigits) return;

      const formatted = formatPhoneNumber(digits, countryCode);
      setDisplayValue(formatted);

      // Clear validation error on input
      setInternalError(undefined);

      // Return raw digits (without country code prefix in the value)
      onChange(digits);
    };

    const handleBlur = () => {
      const digits = parseInput(displayValue);
      const validationError = validate(digits, countryCode);
      setInternalError(validationError);

      // Reformat on blur
      if (digits) {
        const formatted = formatPhoneNumber(digits, countryCode);
        setDisplayValue(formatted);
      }
    };

    const handleCountryCodeChange = (code: string) => {
      if (onCountryCodeChange) {
        onCountryCodeChange(code);
      }

      // Reformat current value with new country code
      const digits = parseInput(displayValue);
      if (digits) {
        const formatted = formatPhoneNumber(digits, code);
        setDisplayValue(formatted);
      }
    };

    const inputId = id || `phone-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const hasError = !!internalError;

    return (
      <div className={cn("space-y-2", className)}>
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
        </Label>

        <div className="flex gap-2">
          {/* Country Code Selector */}
          <Select value={countryCode} onValueChange={handleCountryCodeChange} disabled={disabled}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countryCodes.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.code}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Phone Number Input */}
          <Input
            ref={ref}
            id={inputId}
            type="tel"
            inputMode="tel"
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            aria-required={required}
            className={cn(
              "flex-1",
              hasError && "border-destructive focus-visible:ring-destructive"
            )}
            placeholder={countryCode === '+60' ? '012-3456 7890' : '123-456-7890'}
            {...props}
          />
        </div>

        {/* Error Message */}
        {hasError && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-destructive flex items-start gap-1"
            role="alert"
          >
            <span aria-hidden="true">⚠</span>
            <span>{internalError}</span>
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

PhoneNumberInput.displayName = "PhoneNumberInput";
