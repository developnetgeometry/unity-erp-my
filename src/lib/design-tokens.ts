/**
 * Malaysian ERP One Design Tokens
 * WCAG 2.1 AA Compliant Color System
 * 
 * Usage:
 * import { colors, typography, spacing } from '@/lib/design-tokens';
 */

// ============================================================================
// COLORS (HSL Format)
// ============================================================================

export const colors = {
  // Primary Vibrant Pink - Main actions, primary states (#C91880 / #E91E93)
  primary: {
    DEFAULT: 'hsl(330 81% 40%)',
    hover: 'hsl(330 81% 50%)',
    light: 'hsl(330 81% 95%)',
    foreground: 'hsl(0 0% 100%)',
  },
  
  // Secondary/Info Bright Pink (#E94FB2)
  secondary: {
    DEFAULT: 'hsl(320 75% 55%)',
    foreground: 'hsl(0 0% 100%)',
  },
  
  // Pink Accent (#E91E93) - Used for calendar highlights and special features
  pink: {
    DEFAULT: 'hsl(330 81% 50%)', // #E91E93
    hover: 'hsl(330 81% 60%)',
    light: 'hsl(330 81% 95%)',
    foreground: 'hsl(0 0% 100%)',
  },
  
  // Warning Amber (#F59E0B)
  warning: {
    DEFAULT: 'hsl(38 92% 50%)',
    foreground: 'hsl(0 0% 100%)',
  },
  
  // Error/Destructive Red (#EF4444)
  error: {
    DEFAULT: 'hsl(0 84% 60%)',
    foreground: 'hsl(0 0% 100%)',
  },
  
  // Neutral Grays (Tailwind Scale)
  gray: {
    50: 'hsl(220 14% 96%)',
    100: 'hsl(220 13% 91%)',
    200: 'hsl(220 13% 88%)',
    300: 'hsl(220 14% 83%)',
    400: 'hsl(220 9% 46%)',
    500: 'hsl(220 9% 46%)',
    600: 'hsl(215 16% 30%)',
    700: 'hsl(215 19% 25%)',
    800: 'hsl(215 28% 17%)',
    900: 'hsl(215 32% 11%)',
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font Families
  fontFamily: {
    primary: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
    mono: ['Roboto Mono', 'Courier New', 'monospace'],
  },
  
  // Font Sizes (rem-based)
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '2rem',      // 32px
    '4xl': '3rem',      // 48px
  },
  
  // Font Weights
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================================================
// SPACING SCALE (4px base)
// ============================================================================

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

// ============================================================================
// SHADOWS (Elevation)
// ============================================================================

export const shadows = {
  elevation1: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  elevation2: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  elevation3: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  elevation4: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem',      // 4px
  DEFAULT: '0.5rem',  // 8px
  md: '0.75rem',      // 12px
  lg: '1rem',         // 16px
  full: '9999px',     // Fully rounded
} as const;

// ============================================================================
// BREAKPOINTS (Mobile-First)
// ============================================================================

export const breakpoints = {
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Wide desktop
  '2xl': '1536px', // Ultra-wide
} as const;

// ============================================================================
// MALAYSIAN LOCALE CONSTANTS
// ============================================================================

export const malaysian = {
  // Currency
  currency: {
    symbol: 'RM',
    code: 'MYR',
    locale: 'en-MY',
    decimals: 2,
  },
  
  // Date Format
  dateFormat: {
    short: 'DD/MM/YYYY',
    long: 'DD MMM YYYY',
    full: 'DD MMMM YYYY',
    locale: 'en-MY',
    timezone: 'Asia/Kuala_Lumpur', // UTC+8
  },
  
  // Phone Format
  phone: {
    countryCode: '+60',
    mobilePrefix: '1',
    landlinePrefix: '2-9',
  },
  
  // IC Number Format
  icNumber: {
    format: 'YYMMDD-PB-###G',
    length: 12, // Without hyphens
  },
} as const;

// ============================================================================
// ACCESSIBILITY (WCAG 2.1 AA)
// ============================================================================

export const accessibility = {
  // Minimum contrast ratios
  contrastRatios: {
    normalText: 4.5,     // Text <18pt or <14pt bold
    largeText: 3.0,      // Text ≥18pt or ≥14pt bold
    uiComponents: 3.0,   // Buttons, borders, etc.
  },
  
  // Focus indicators
  focus: {
    outlineWidth: '3px',
    outlineColor: colors.primary.DEFAULT,
    outlineOffset: '2px',
  },
  
  // Touch targets
  touchTarget: {
    minSize: '44px',     // iOS HIG / Android Material
    minSpacing: '8px',   // Between adjacent targets
  },
} as const;

// ============================================================================
// ANIMATION / TRANSITIONS
// ============================================================================

export const transitions = {
  smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fast: 'all 0.15s ease-out',
  slow: 'all 0.5s ease-in-out',
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Color = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Shadows = typeof shadows;
export type BorderRadius = typeof borderRadius;
export type Breakpoints = typeof breakpoints;
export type Malaysian = typeof malaysian;
export type Accessibility = typeof accessibility;
export type Transitions = typeof transitions;
