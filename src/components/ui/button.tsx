import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-[hsl(173,85%,26%)] text-white hover:bg-[hsl(173,85%,26%)]/90 shadow-sm",
        secondary: "border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50",
        tertiary: "bg-transparent text-gray-700 hover:bg-gray-100",
        ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
        danger: "bg-[hsl(0,84%,60%)] text-white hover:bg-[hsl(0,84%,60%)]/90 shadow-sm",
        // Legacy variants for compatibility
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-[52px] px-8 text-lg",
        // Legacy size for compatibility
        default: "h-10 px-4 py-2",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full md:w-auto",
        false: "w-auto",
      },
      iconOnly: {
        true: "p-0 min-w-[44px] min-h-[44px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  iconOnly?: boolean;
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false,
    leftIcon,
    rightIcon,
    iconOnly,
    loading,
    loadingText = "Processing...",
    fullWidth,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // If iconOnly, ensure aria-label exists
    if (iconOnly && !props["aria-label"] && typeof children === "string") {
      props["aria-label"] = children;
    }
    
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size, fullWidth, iconOnly, className }))} 
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span className="inline-flex">{leftIcon}</span>}
        {!iconOnly && (loading ? loadingText : children)}
        {!loading && rightIcon && <span className="inline-flex">{rightIcon}</span>}
        {iconOnly && !loading && children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
