# Houlnd Realty Design System

## Overview

This document describes the enhanced design system for Houlnd Realty MVP, providing consistent styling, animations, and visual patterns across the application.

## Color Palette

### Primary Colors (Blue)
Used for primary actions, links, and brand elements.

| Token | Value | Usage |
|-------|-------|-------|
| `--primary-50` | `#eff6ff` | Light backgrounds |
| `--primary-100` | `#dbeafe` | Hover states |
| `--primary-500` | `#3b82f6` | Icons, text |
| `--primary-600` | `#2563eb` | **Primary buttons** |
| `--primary-700` | `#1d4ed8` | Hover on primary |
| `--primary-900` | `#1e3a8a` | Dark accents |

### Secondary Colors (Emerald)
Used for success states, pricing, and positive actions.

| Token | Value | Usage |
|-------|-------|-------|
| `--secondary-50` | `#ecfdf5` | Success backgrounds |
| `--secondary-500` | `#10b981` | Success icons |
| `--secondary-600` | `#059669` | **Price tags** |
| `--secondary-700` | `#047857` | Success hover |

### Accent Colors (Amber)
Used for warnings, highlights, and attention-grabbing elements.

| Token | Value | Usage |
|-------|-------|-------|
| `--accent-50` | `#fffbeb` | Warning backgrounds |
| `--accent-500` | `#f59e0b` | Warning icons |
| `--accent-600` | `#d97706` | **Pending status** |

### Semantic Colors

| Color | Token | Usage |
|-------|-------|-------|
| Success | `--success` (`#10b981`) | Positive actions, live status |
| Warning | `--warning` (`#f59e0b`) | Pending status, caution |
| Error | `--error` (`#ef4444`) | Errors, rejected status |
| Info | `--info` (`#3b82f6`) | Information, links |

### Neutral Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--neutral-50` | `#fafafa` | Page backgrounds |
| `--neutral-100` | `#f5f5f5` | Card backgrounds |
| `--neutral-200` | `#e5e5e5` | Borders |
| `--neutral-500` | `#737373` | Muted text |
| `--neutral-700` | `#404040` | Secondary text |
| `--neutral-900` | `#171717` | Primary text |

---

## Typography

### Font Sizes

| Token | Size | Usage |
|-------|------|-------|
| `--text-xs` | 0.75rem (12px) | Badges, captions |
| `--text-sm` | 0.875rem (14px) | Body small, labels |
| `--text-base` | 1rem (16px) | Body text |
| `--text-lg` | 1.125rem (18px) | Subheadings |
| `--text-xl` | 1.25rem (20px) | Card titles |
| `--text-2xl` | 1.5rem (24px) | Section titles |
| `--text-3xl` | 1.875rem (30px) | Page headings |
| `--text-4xl` | 2.25rem (36px) | Hero headlines |
| `--text-5xl` | 3rem (48px) | Large displays |

### Font Weights
- Regular: 400 (body text)
- Medium: 500 (labels, emphasis)
- Semibold: 600 (headings, buttons)
- Bold: 700 (strong emphasis)

### Line Heights
- `--leading-tight`: 1.25 (headings)
- `--leading-snug`: 1.375
- `--leading-normal`: 1.5 (body text)
- `--leading-relaxed`: 1.625 (readable paragraphs)

---

## Spacing

### Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 0.25rem (4px) | Tight spacing |
| `--space-2` | 0.5rem (8px) | Small gaps |
| `--space-3` | 0.75rem (12px) | Input padding |
| `--space-4` | 1rem (16px) | **Standard gap** |
| `--space-6` | 1.5rem (24px) | Card padding |
| `--space-8` | 2rem (32px) | Section spacing |
| `--space-12` | 3rem (48px) | Large sections |
| `--space-16` | 4rem (64px) | Page sections |
| `--space-24` | 6rem (96px) | Hero spacing |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 0.25rem (4px) | Small elements |
| `--radius-md` | 0.375rem (6px) | Inputs |
| `--radius-lg` | 0.5rem (8px) | **Buttons** |
| `--radius-xl` | 0.75rem (12px) | Cards |
| `--radius-2xl` | 1rem (16px) | Modals |
| `--radius-full` | 9999px | Pills, avatars |

---

## Shadows

### Utility Classes

```css
.shadow-soft     /* Subtle elevation */
.shadow-medium   /* Standard cards */
.shadow-strong   /* Elevated cards */
.shadow-elevated /* Modals, dropdowns */
```

### Usage

| Shadow | Usage |
|--------|-------|
| Soft | Default card state |
| Medium | Card hover state |
| Strong | Active/focused elements |
| Elevated | Modals, popovers, dropdowns |

---

## Animations

### Keyframes

| Animation | Description | Duration |
|-----------|-------------|----------|
| `fadeIn` | Simple opacity fade | 200ms |
| `fadeInUp` | Fade + upward slide | 300ms |
| `fadeInDown` | Fade + downward slide | 300ms |
| `slideInLeft` | Slide from left | 300ms |
| `slideInRight` | Slide from right | 300ms |
| `scaleIn` | Scale up from 95% | 200ms |
| `pulse` | Opacity pulsing | 2s (infinite) |
| `spin` | 360° rotation | 1s (infinite) |
| `shimmer` | Skeleton loading | 1.5s (infinite) |

### Utility Classes

```css
.animate-fade-in
.animate-fade-in-up
.animate-fade-in-down
.animate-slide-in-left
.animate-slide-in-right
.animate-scale-in
.animate-pulse
.animate-spin
.animate-bounce
```

### Animation Delays

```css
.delay-75   /* 75ms */
.delay-100  /* 100ms */
.delay-150  /* 150ms */
.delay-200  /* 200ms */
.delay-300  /* 300ms */
.delay-500  /* 500ms */
.delay-700  /* 700ms */
.delay-1000 /* 1000ms */
```

---

## Transitions

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | 150ms ease | Micro interactions |
| `--transition-normal` | 200ms ease | **Default** |
| `--transition-slow` | 300ms ease | Page transitions |
| `--transition-bounce` | 300ms cubic-bezier(...) | Playful elements |

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-dropdown` | 100 | Dropdown menus |
| `--z-sticky` | 200 | Sticky headers |
| `--z-fixed` | 300 | Fixed elements |
| `--z-modal-backdrop` | 400 | Modal overlay |
| `--z-modal` | 500 | Modal content |
| `--z-popover` | 600 | Popovers |
| `--z-tooltip` | 700 | Tooltips |

---

## Component Patterns

### Cards

```css
.property-card {
  /* Base styles with border, shadow */
  /* Hover: lift + stronger shadow */
  /* Image: zoom on hover */
}
```

### Status Badges

```css
.status-live     /* Green */
.status-pending  /* Yellow */
.status-rejected /* Red */
.status-draft    /* Gray */
```

### Price Display

```css
.price-tag       /* Large, bold, green */
.price-per-sqft  /* Small badge style */
```

### Dashboard Stats

```css
.stat-card   /* Card container */
.stat-value  /* Large number */
.stat-label  /* Description */
```

### Forms

```css
.form-input  /* Input styling */
.form-label  /* Label styling */
.form-error  /* Error message */
```

---

## Dark Mode

The design system supports dark mode via `prefers-color-scheme: dark`. Key changes:

- Background: `#0a0a0a`
- Foreground: `#ededed`
- Surface colors inverted
- Border colors adjusted
- Shadow strength increased

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Wide screens |

### Mobile Adjustments

- Reduced heading sizes
- Single column layouts
- Touch-friendly targets (min 44px)

---

## Accessibility

### Focus States

All interactive elements have visible focus indicators:
- 2px solid blue outline
- 2px offset
- High contrast

### Color Contrast

- Text on white: minimum 4.5:1
- Large text: minimum 3:1
- Interactive elements: clear visual feedback

### Motion

- Respects `prefers-reduced-motion`
- Essential animations only
- No auto-playing animations

---

## Usage Guidelines

### Do's

1. Use CSS variables for colors, spacing, typography
2. Use semantic color tokens (`--success`, `--error`)
3. Maintain consistent spacing (multiples of 4px)
4. Use animation utility classes
5. Test in light and dark modes

### Don'ts

1. Don't hardcode colors (use variables)
2. Don't use arbitrary spacing values
3. Don't override component styles directly
4. Don't use excessive animations
5. Don't ignore accessibility requirements

---

## File Structure

```
src/
├── app/
│   └── globals.css          # Design system tokens
├── components/
│   ├── ui/
│   │   ├── index.ts         # Central exports
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Spinner.tsx
│   │   ├── Container.tsx
│   │   └── Modal.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── ErrorBoundary.tsx
└── docs/
    ├── DESIGN_SYSTEM.md     # This file
    └── UI_COMPONENTS.md     # Component docs
```
