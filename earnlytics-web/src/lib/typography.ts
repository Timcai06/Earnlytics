/**
 * Typography System for Earnlytics
 * 
 * Standardized typography classes following the design system.
 * All custom pixel values should be replaced with these standard classes.
 */

export const typography = {
  // Display - Hero titles (Landing page main heading)
  display: 'text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight',
  
  // H1 - Page titles (48-60px range)
  h1: 'text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight',
  
  // H2 - Section titles (30-36px range)  
  h2: 'text-2xl sm:text-3xl font-bold tracking-tight leading-tight',
  
  // H3 - Subsection titles (20-24px range)
  h3: 'text-xl sm:text-2xl font-semibold leading-tight',
  
  // H4 - Card titles (18px)
  h4: 'text-lg font-semibold leading-snug',
  
  // Body - Main content text
  body: 'text-base leading-relaxed',
  
  // Body Large - Emphasized body text
  bodyLarge: 'text-lg leading-relaxed',
  
  // Small - Secondary text, captions
  small: 'text-sm leading-normal',
  
  // Extra Small - Metadata, timestamps
  xs: 'text-xs leading-normal',
  
  // Label - Form labels, button text
  label: 'text-sm font-medium leading-none',
  
  // Stats - Large numbers in stats display
  stat: 'text-3xl sm:text-4xl lg:text-5xl font-bold',
  
  // Caption - Image captions, small descriptions
  caption: 'text-xs text-text-secondary',
} as const;

// Responsive spacing utilities
export const spacing = {
  // Section padding - Standard section spacing
  section: 'px-4 py-12 sm:px-6 sm:py-16 lg:px-20 lg:py-20',
  
  // Hero section - Larger padding for landing hero
  hero: 'px-4 py-16 sm:px-6 sm:py-20 lg:px-20 lg:py-28',
  
  // Compact section - Reduced padding
  sectionCompact: 'px-4 py-8 sm:px-6 sm:py-12 lg:px-20 lg:py-16',
  
  // Container padding - Just horizontal padding
  container: 'px-4 sm:px-6 lg:px-20',
  
  // Gap utilities
  gapSm: 'gap-2 sm:gap-3',
  gapMd: 'gap-4 sm:gap-6',
  gapLg: 'gap-6 sm:gap-8 lg:gap-12',
  gapXl: 'gap-8 sm:gap-12 lg:gap-20',
} as const;

export type TypographyClass = keyof typeof typography;
export type SpacingClass = keyof typeof spacing;
