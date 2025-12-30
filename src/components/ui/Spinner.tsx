/**
 * Spinner Component
 *
 * Loading spinner with multiple sizes and variants.
 *
 * Features:
 * - Multiple sizes (xs, sm, md, lg, xl)
 * - Color variants
 * - Full-page loading overlay option
 * - Inline loading indicator
 */

import { HTMLAttributes } from 'react'

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type SpinnerVariant = 'primary' | 'secondary' | 'white' | 'current'

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize
  variant?: SpinnerVariant
  label?: string
}

const sizeStyles: Record<SpinnerSize, { spinner: string; label: string }> = {
  xs: { spinner: 'h-3 w-3', label: 'text-xs' },
  sm: { spinner: 'h-4 w-4', label: 'text-sm' },
  md: { spinner: 'h-6 w-6', label: 'text-sm' },
  lg: { spinner: 'h-8 w-8', label: 'text-base' },
  xl: { spinner: 'h-12 w-12', label: 'text-lg' },
}

const variantStyles: Record<SpinnerVariant, string> = {
  primary: 'text-blue-600',
  secondary: 'text-gray-600',
  white: 'text-white',
  current: 'text-current',
}

export function Spinner({
  size = 'md',
  variant = 'primary',
  label,
  className = '',
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label || 'Loading'}
      className={`inline-flex flex-col items-center gap-2 ${className}`}
      {...props}
    >
      <svg
        className={`animate-spin ${sizeStyles[size].spinner} ${variantStyles[variant]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {label && (
        <span className={`${sizeStyles[size].label} ${variantStyles[variant]} font-medium`}>
          {label}
        </span>
      )}
      <span className="sr-only">{label || 'Loading...'}</span>
    </div>
  )
}

// Full-page loading overlay
interface LoadingOverlayProps {
  isLoading: boolean
  label?: string
  blur?: boolean
}

export function LoadingOverlay({ isLoading, label = 'Loading...', blur = true }: LoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        bg-white/80 dark:bg-gray-900/80
        ${blur ? 'backdrop-blur-sm' : ''}
        transition-opacity duration-200
      `}
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size="xl" variant="primary" />
        <p className="text-lg font-medium text-gray-700 dark:text-gray-200">{label}</p>
      </div>
    </div>
  )
}

// Inline loading state for buttons, etc.
interface InlineLoaderProps {
  size?: SpinnerSize
  className?: string
}

export function InlineLoader({ size = 'sm', className = '' }: InlineLoaderProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Spinner size={size} variant="current" />
    </span>
  )
}

// Page loading state (centered in container)
interface PageLoaderProps {
  label?: string
  minHeight?: string
}

export function PageLoader({ label = 'Loading...', minHeight = 'min-h-[400px]' }: PageLoaderProps) {
  return (
    <div className={`flex items-center justify-center ${minHeight}`}>
      <Spinner size="lg" variant="primary" label={label} />
    </div>
  )
}

// Skeleton loader for content placeholders
interface SkeletonProps {
  className?: string
  width?: string
  height?: string
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
}

const roundedStyles = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

export function Skeleton({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = 'md',
}: SkeletonProps) {
  return (
    <div
      className={`
        animate-pulse bg-gray-200
        ${width} ${height} ${roundedStyles[rounded]}
        ${className}
      `}
      aria-hidden="true"
    />
  )
}

// Skeleton for text lines
interface SkeletonTextProps {
  lines?: number
  className?: string
}

export function SkeletonText({ lines = 3, className = '' }: SkeletonTextProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? 'w-3/4' : 'w-full'}
          height="h-4"
        />
      ))}
    </div>
  )
}

// Skeleton for cards
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <Skeleton height="h-40" rounded="lg" className="mb-4" />
      <Skeleton width="w-3/4" className="mb-2" />
      <Skeleton width="w-1/2" className="mb-4" />
      <div className="flex gap-2">
        <Skeleton width="w-16" height="h-6" rounded="full" />
        <Skeleton width="w-20" height="h-6" rounded="full" />
      </div>
    </div>
  )
}

// Skeleton for property cards
export function SkeletonPropertyCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      <Skeleton height="h-48" rounded="none" />
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <Skeleton width="w-24" height="h-6" rounded="full" />
          <Skeleton width="w-20" height="h-6" />
        </div>
        <Skeleton width="w-3/4" className="mb-2" />
        <Skeleton width="w-1/2" className="mb-4" />
        <div className="flex gap-4">
          <Skeleton width="w-16" height="h-4" />
          <Skeleton width="w-16" height="h-4" />
          <Skeleton width="w-16" height="h-4" />
        </div>
      </div>
    </div>
  )
}
