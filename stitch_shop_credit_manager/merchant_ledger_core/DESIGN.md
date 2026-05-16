---
name: Merchant Ledger Core
colors:
  surface: '#f7fafb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7fafb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f5'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3f484c'
  inverse-surface: '#2d3132'
  inverse-on-surface: '#eff1f2'
  outline: '#6f797c'
  outline-variant: '#bfc8cc'
  surface-tint: '#13677b'
  primary: '#004655'
  on-primary: '#ffffff'
  primary-container: '#005f73'
  on-primary-container: '#91d7ee'
  inverse-primary: '#8bd1e8'
  secondary: '#00696c'
  on-secondary: '#ffffff'
  secondary-container: '#86f0f3'
  on-secondary-container: '#006e70'
  tertiary: '#603401'
  on-tertiary: '#ffffff'
  tertiary-container: '#7c4b17'
  on-tertiary-container: '#ffbf86'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b2ebff'
  primary-fixed-dim: '#8bd1e8'
  on-primary-fixed: '#001f27'
  on-primary-fixed-variant: '#004e5f'
  secondary-fixed: '#89f3f6'
  secondary-fixed-dim: '#6bd7da'
  on-secondary-fixed: '#002021'
  on-secondary-fixed-variant: '#004f51'
  tertiary-fixed: '#ffdcc0'
  tertiary-fixed-dim: '#fcb97b'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#693c07'
  background: '#f7fafb'
  on-background: '#191c1d'
  surface-variant: '#e0e3e4'
  jama-success: '#2D6A4F'
  udhar-destructive: '#C9184A'
  surface-background: '#F8FAFC'
  text-primary: '#1E293B'
  text-secondary: '#64748B'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  amount-display:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  margin-mobile: 16px
  gutter: 12px
  touch-target-min: 48px
  card-padding: 16px
---

## Brand & Style

The design system is engineered for the fast-paced environment of small retail shops, where speed, clarity, and trust are paramount. The brand personality is **Reliable, Efficient, and Accessible**. It moves away from complex abstractions, favoring a **Corporate / Modern** style that utilizes high-contrast elements and clear visual metaphors to ensure shop owners can manage their ledgers with zero cognitive friction.

The design prioritizes utility for "rush hour" scenarios, emphasizing high-contrast readability and large interactive zones for one-handed operation. The visual language bridges the gap between traditional paper ledgers and modern digital efficiency, providing a sense of security and professional organization.

## Colors

The palette is anchored in a dependable **Deep Teal** to evoke stability and professional trust. 

- **Primary (Deep Teal):** Used for primary actions, navigation, and brand identification.
- **Success (Green - 'Jama'):** A high-saturation green used exclusively for payments received and positive ledger balances.
- **Destructive (Red - 'Udhar'):** A sharp red used for credit given and outstanding debts, ensuring these critical figures are never missed.
- **Neutral:** A clean range of Slate grays is used for typography and UI borders, maintaining high legibility against a soft white background to reduce eye strain during long periods of use.

## Typography

**Inter** is the sole typeface for this design system, chosen for its exceptional legibility and neutral, professional tone. To accommodate both English and Telugu script, line heights are slightly increased (1.5x for body text) to ensure complex characters do not overlap or feel cramped.

- **Contrast:** High-contrast ratios (WCAG AAA preferred) are maintained by using Slate-900 for primary text and Deep Teal for headers.
- **Hierarchy:** Critical ledger amounts use the `amount-display` style, ensuring the most important data point on any screen is immediately identifiable.
- **Telugu Optimization:** All typography levels are tested for Telugu rendering, ensuring diacritics have sufficient vertical clearance.

## Layout & Spacing

The layout follows a **Fluid Grid** model optimized for mobile devices. It utilizes an 8px base unit to maintain a consistent rhythmic structure.

- **Mobile First:** The primary layout is a single-column stack of cards, maximizing horizontal space for names and currency values.
- **Touch Targets:** Every interactive element adheres to a minimum 48x48px touch zone, critical for shop owners using the device while multitasking.
- **Safe Areas:** Standard 16px side margins are enforced to prevent content from hitting screen edges on various device form factors.
- **Responsive Reflow:** On tablet devices, the layout transitions to a 2-column "Master-Detail" view, showing the customer list on the left and the specific ledger on the right.

## Elevation & Depth

Visual hierarchy is established using **Tonal Layers** combined with low-opacity **Ambient Shadows**. This approach creates a clean, "card-based" interface that feels tactile and organized without visual clutter.

- **Level 0 (Background):** Slate-50 surface.
- **Level 1 (Cards/Inputs):** Pure white surface with a 1px Slate-200 border and a soft 4% opacity shadow.
- **Level 2 (Active Elements/Modals):** Pure white with a 12% opacity shadow to indicate "top-most" priority.
- **Interactive Feedback:** Buttons utilize a slight inner-shadow on press to mimic a physical "click," providing immediate tactile confirmation of an action.

## Shapes

The design system uses a **Soft (0.25rem / 4px)** corner radius as the primary shape language. 

- **Cards & Inputs:** 4px radius for a clean, professional look that maximizes screen real estate.
- **Buttons:** 8px (rounded-lg) to make them feel distinct from data containers and more inviting to tap.
- **Search Bars:** Pill-shaped (rounded-full) to differentiate the global action of searching from the static action of viewing records.

## Components

### Buttons
Primary buttons use a solid Deep Teal background with White text. Secondary actions (e.g., "Add Notes") use a Ghost style with Teal borders. **'Jama' (Add)** and **'Udhar' (Give)** buttons are permanently anchored at the bottom of customer ledgers, using full-width split buttons in Green and Red respectively.

### Cards
Cards are the primary container for customer profiles and transaction entries. They feature high-contrast text for names and bold, colored text for balances. Transaction cards use a "left-border" color indicator (Green for Jama, Red for Udhar) for quick visual scanning.

### Input Fields
Inputs are structured with persistent labels to ensure context is never lost. They feature a 48px height minimum and large-font numeric keypads as the default trigger for amount entries.

### Chips/Badges
Used for payment status (e.g., "Pending", "Settled"). These use low-saturation background tints of the success/destructive colors with high-saturation text to ensure readability without competing with the main ledger actions.

### List Items
Customer list items are optimized for speed, showing the customer name, their last activity date, and their current balance in a clear, three-line vertical hierarchy.