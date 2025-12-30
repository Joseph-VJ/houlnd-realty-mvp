/**
 * Badge Component
 *
 * Status badge component for displaying listing status, roles, etc.
 * Enhanced with animations and additional variants.
 *
 * Variants:
 * - default: Gray
 * - success: Green (for LIVE listings)
 * - warning: Yellow (for PENDING listings)
 * - danger: Red (for REJECTED listings)
 * - info: Blue
 * - primary: Blue (alternate)
 *
 * Sizes:
 * - sm: Small
 * - md: Medium (default)
 * - lg: Large
 */

import { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  className?: string
  dot?: boolean
  removable?: boolean
  onRemove?: () => void
  icon?: ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 border-gray-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  primary: 'bg-blue-600 text-white border-blue-600',
}

const dotVariantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  primary: 'bg-white',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  removable = false,
  onRemove,
  icon,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-medium rounded-full border
        transition-all duration-150
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `
        .replace(/\s+/g, ' ')
        .trim()}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotVariantStyles[variant]} ${
            variant === 'warning' || variant === 'info' ? 'animate-pulse' : ''
          }`}
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Remove"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  )
}

// Helper function to get badge variant based on listing status
export function getListingStatusBadge(status: string): BadgeVariant {
  switch (status) {
    case 'LIVE':
      return 'success'
    case 'PENDING_VERIFICATION':
      return 'warning'
    case 'REJECTED':
      return 'danger'
    case 'INACTIVE':
    case 'SOLD':
      return 'default'
    default:
      return 'default'
  }
}

// Helper function to get user-friendly status text
export function getListingStatusText(status: string): string {
  switch (status) {
    case 'LIVE':
      return 'Live'
    case 'PENDING_VERIFICATION':
      return 'Pending'
    case 'REJECTED':
      return 'Rejected'
    case 'INACTIVE':
      return 'Inactive'
    case 'SOLD':
      return 'Sold'
    default:
      return status
  }
}

// Pre-styled listing status badge
interface ListingStatusBadgeProps {
  status: string
  size?: BadgeSize
  className?: string
}

export function ListingStatusBadge({ status, size = 'md', className = '' }: ListingStatusBadgeProps) {
  const variant = getListingStatusBadge(status)
  const showDot = status === 'PENDING_VERIFICATION' || status === 'LIVE'

  return (
    <Badge variant={variant} size={size} dot={showDot} className={className}>
      {getListingStatusText(status)}
    </Badge>
  )
}

// Role badge
interface RoleBadgeProps {
  role: 'ADMIN' | 'PROMOTER' | 'CUSTOMER' | string
  size?: BadgeSize
  className?: string
}

export function RoleBadge({ role, size = 'md', className = '' }: RoleBadgeProps) {
  const getVariant = (): BadgeVariant => {
    switch (role) {
      case 'ADMIN':
        return 'primary'
      case 'PROMOTER':
        return 'info'
      case 'CUSTOMER':
        return 'default'
      default:
        return 'default'
    }
  }

  const getIcon = () => {
    switch (role) {
      case 'ADMIN':
        return (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )
      case 'PROMOTER':
        return (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <Badge variant={getVariant()} size={size} icon={getIcon()} className={className}>
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </Badge>
  )
}

// Count badge (for notifications, etc.)
interface CountBadgeProps {
  count: number
  max?: number
  variant?: BadgeVariant
  className?: string
}

export function CountBadge({ count, max = 99, variant = 'danger', className = '' }: CountBadgeProps) {
  const displayCount = count > max ? `${max}+` : count.toString()

  if (count === 0) return null

  return (
    <Badge variant={variant} size="sm" className={`min-w-[1.25rem] justify-center ${className}`}>
      {displayCount}
    </Badge>
  )
}
