# UI Components Documentation

## Overview

This document describes the enhanced UI component library for Houlnd Realty MVP. All components are located in `src/components/ui/` and can be imported from `@/components/ui`.

## Design System

### CSS Variables

The design system is defined in `src/app/globals.css` with the following key variables:

#### Colors
- **Primary**: Blue (`--primary-50` to `--primary-900`)
- **Secondary**: Emerald/Green (`--secondary-50` to `--secondary-900`)
- **Accent**: Amber (`--accent-50` to `--accent-900`)
- **Neutral**: Gray scale (`--neutral-50` to `--neutral-900`)
- **Semantic**: `--success`, `--warning`, `--error`, `--info`

#### Typography
- Font sizes: `--text-xs` to `--text-5xl`
- Line heights: `--leading-tight`, `--leading-normal`, `--leading-relaxed`

#### Spacing
- Scale: `--space-1` (0.25rem) to `--space-24` (6rem)

#### Border Radius
- `--radius-sm` to `--radius-full`

### Animation Classes
- `.animate-fade-in` - Simple fade in
- `.animate-fade-in-up` - Fade in with upward motion
- `.animate-fade-in-down` - Fade in with downward motion
- `.animate-slide-in-left` / `.animate-slide-in-right` - Slide animations
- `.animate-scale-in` - Scale up animation
- `.animate-pulse` - Pulsing effect
- `.animate-spin` - Loading spinner rotation

---

## Components

### Button

Reusable button with multiple variants and sizes.

```tsx
import { Button, PrimaryButton, DangerButton, IconButton } from '@/components/ui'

// Basic usage
<Button variant="primary" size="md">
  Click me
</Button>

// With loading state
<Button variant="primary" isLoading>
  Submitting...
</Button>

// With icons
<Button
  variant="secondary"
  leftIcon={<SearchIcon />}
  rightIcon={<ArrowIcon />}
>
  Search
</Button>

// Full width
<Button fullWidth>
  Full Width Button
</Button>
```

**Props:**
- `variant`: `'primary'` | `'secondary'` | `'outline'` | `'ghost'` | `'danger'` | `'success'`
- `size`: `'sm'` | `'md'` | `'lg'` | `'xl'`
- `isLoading`: boolean
- `leftIcon` / `rightIcon`: ReactNode
- `fullWidth`: boolean

---

### Card

Container component with header, content, and footer sections.

```tsx
import { Card, CardHeader, CardContent, CardFooter, CardTitle, StatCard } from '@/components/ui'

// Basic card
<Card variant="default">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
  <CardFooter align="right">
    <Button>Action</Button>
  </CardFooter>
</Card>

// Interactive card (with hover effects)
<Card variant="interactive">
  Content
</Card>

// Stat card for dashboards
<StatCard
  label="Total Listings"
  value={150}
  icon={<HomeIcon />}
  trend={{ value: 12, isPositive: true }}
/>
```

**Card Props:**
- `variant`: `'default'` | `'elevated'` | `'outlined'` | `'interactive'`
- `noPadding`: boolean

---

### Badge

Status badge for displaying listing status, roles, etc.

```tsx
import { Badge, ListingStatusBadge, RoleBadge, CountBadge } from '@/components/ui'

// Basic badge
<Badge variant="success" size="md">
  Live
</Badge>

// With dot indicator
<Badge variant="warning" dot>
  Pending
</Badge>

// Listing status (automatic variant selection)
<ListingStatusBadge status="LIVE" />
<ListingStatusBadge status="PENDING_VERIFICATION" />

// Role badge
<RoleBadge role="ADMIN" />
<RoleBadge role="PROMOTER" />

// Count badge (for notifications)
<CountBadge count={5} />
```

**Badge Props:**
- `variant`: `'default'` | `'success'` | `'warning'` | `'danger'` | `'info'` | `'primary'`
- `size`: `'sm'` | `'md'` | `'lg'`
- `dot`: boolean
- `removable`: boolean
- `onRemove`: () => void
- `icon`: ReactNode

---

### Input, Textarea, Select

Form input components with validation states.

```tsx
import { Input, Textarea, Select } from '@/components/ui'

// Text input
<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error="Invalid email format"
  helperText="We'll never share your email"
/>

// Password input (with show/hide toggle)
<Input
  label="Password"
  type="password"
/>

// With icons
<Input
  leftIcon={<SearchIcon />}
  placeholder="Search properties..."
/>

// Textarea
<Textarea
  label="Description"
  rows={4}
  placeholder="Describe your property..."
/>

// Select
<Select
  label="Property Type"
  placeholder="Select type"
  options={[
    { value: 'FLAT', label: 'Flat' },
    { value: 'VILLA', label: 'Villa' },
    { value: 'PLOT', label: 'Plot' },
  ]}
/>
```

**Input Props:**
- `label`: string
- `error`: string (shows error message)
- `helperText`: string
- `leftIcon` / `rightIcon`: ReactNode
- `size`: `'sm'` | `'md'` | `'lg'`
- `fullWidth`: boolean

---

### Spinner & Loading States

Loading indicators and skeleton placeholders.

```tsx
import {
  Spinner,
  LoadingOverlay,
  PageLoader,
  Skeleton,
  SkeletonText,
  SkeletonPropertyCard
} from '@/components/ui'

// Basic spinner
<Spinner size="md" variant="primary" label="Loading..." />

// Page-level loading
<PageLoader label="Loading properties..." />

// Full-page overlay
<LoadingOverlay isLoading={true} label="Processing..." />

// Skeleton placeholders
<Skeleton width="w-full" height="h-40" />
<SkeletonText lines={3} />
<SkeletonPropertyCard />
```

---

### Container & Layout

Layout primitives for consistent page structure.

```tsx
import { Container, PageWrapper, Section, Grid, Flex, Stack, HStack, Divider } from '@/components/ui'

// Container with max-width
<Container size="xl">
  Content
</Container>

// Page wrapper with vertical padding
<PageWrapper verticalPadding="md">
  Page content
</PageWrapper>

// Section with background
<Section background="gray" spacing="lg">
  Section content
</Section>

// Grid layout
<Grid cols={3} gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>

// Flex layouts
<Flex direction="row" align="center" justify="between" gap="md">
  <div>Left</div>
  <div>Right</div>
</Flex>

// Stack (vertical flex)
<Stack gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
</Stack>

// HStack (horizontal flex)
<HStack gap="md">
  <div>Item 1</div>
  <div>Item 2</div>
</HStack>
```

---

### Modal

Accessible modal dialog component.

```tsx
import { Modal, ModalHeader, ModalBody, ModalFooter, ConfirmModal } from '@/components/ui'

// Custom modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  size="md"
>
  <ModalHeader title="Modal Title" description="Optional description" />
  <ModalBody>
    Modal content
  </ModalBody>
  <ModalFooter>
    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </ModalFooter>
</Modal>

// Confirmation modal
<ConfirmModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Delete Listing"
  message="Are you sure you want to delete this listing?"
  variant="danger"
  confirmText="Delete"
  cancelText="Cancel"
  isLoading={isDeleting}
/>
```

**Modal Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `size`: `'sm'` | `'md'` | `'lg'` | `'xl'` | `'full'`
- `closeOnBackdrop`: boolean
- `closeOnEscape`: boolean
- `showCloseButton`: boolean

---

## Error Handling

### ErrorBoundary

```tsx
import { ErrorBoundary, PageError, NotFoundPage, EmptyState } from '@/components/ErrorBoundary'

// Wrap components
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// For Next.js error.tsx
export default function Error({ error, reset }) {
  return <PageError error={error} reset={reset} />
}

// For Next.js not-found.tsx
export default function NotFound() {
  return <NotFoundPage />
}

// Empty state
<EmptyState
  icon={<SearchIcon />}
  title="No properties found"
  description="Try adjusting your filters"
  action={{ label: 'Clear filters', onClick: handleClear }}
/>
```

---

## Layout Components

### Header

```tsx
import { Header } from '@/components/layout/Header'

// Public header (unauthenticated)
<Header />
```

### Footer

```tsx
import { Footer, MinimalFooter } from '@/components/layout/Footer'

// Full footer
<Footer />

// Minimal footer (for auth pages)
<MinimalFooter />
```

---

## Best Practices

1. **Use design tokens**: Prefer CSS variables over hardcoded values
2. **Consistent spacing**: Use the spacing scale (`gap-4`, `p-6`, etc.)
3. **Accessible**: All components include proper ARIA attributes
4. **Responsive**: Components adapt to mobile/desktop views
5. **Animation**: Use built-in animation classes for smooth transitions

## Import Example

```tsx
// Recommended: Import from index
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
  Spinner,
  Container,
  Modal
} from '@/components/ui'
```
