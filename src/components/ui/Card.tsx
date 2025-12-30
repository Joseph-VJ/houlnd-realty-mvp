/**
 * Card Component
 *
 * Container component with optional header, content, and footer sections.
 * Enhanced with smooth hover effects and visual hierarchy.
 *
 * Variants:
 * - default: Standard card with border
 * - elevated: Card with shadow
 * - outlined: Card with stronger border
 * - interactive: Card with hover lift effect
 */

import { ReactNode, forwardRef, HTMLAttributes } from 'react'

type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: CardVariant
  noPadding?: boolean
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  action?: ReactNode
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  align?: 'left' | 'center' | 'right' | 'between'
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-gray-200 shadow-sm',
  elevated: 'bg-white shadow-md hover:shadow-lg',
  outlined: 'bg-white border-2 border-gray-300',
  interactive: `
    bg-white border border-gray-200 shadow-sm
    hover:shadow-lg hover:border-blue-200 hover:-translate-y-1
    cursor-pointer
  `,
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', noPadding = false, className = '', ...props }, ref) => {
    const baseStyles = 'rounded-xl overflow-hidden transition-all duration-200'
    const paddingStyles = noPadding ? '' : ''

    const cleanedStyles = [baseStyles, variantStyles[variant], paddingStyles, className]
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    return (
      <div ref={ref} className={cleanedStyles} {...props}>
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, action, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between ${className}`}
        {...props}
      >
        <div className="flex-1">{children}</div>
        {action && <div className="ml-4 flex-shrink-0">{action}</div>}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`px-6 py-4 ${className}`} {...props}>
        {children}
      </div>
    )
  }
)

CardContent.displayName = 'CardContent'

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, align = 'right', className = '', ...props }, ref) => {
    const alignStyles = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between',
    }

    return (
      <div
        ref={ref}
        className={`px-6 py-4 border-t border-gray-100 flex items-center gap-3 ${alignStyles[align]} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, as: Component = 'h3', className = '', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={`text-lg font-semibold text-gray-900 ${className}`}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

CardTitle.displayName = 'CardTitle'

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <p ref={ref} className={`text-sm text-gray-500 mt-1 ${className}`} {...props}>
        {children}
      </p>
    )
  }
)

CardDescription.displayName = 'CardDescription'

// Compound component for property cards
interface PropertyCardProps extends HTMLAttributes<HTMLDivElement> {
  image?: string
  imageAlt?: string
  badge?: ReactNode
  children: ReactNode
}

export function PropertyCard({
  image,
  imageAlt = 'Property image',
  badge,
  children,
  className = '',
  ...props
}: PropertyCardProps) {
  return (
    <Card variant="interactive" noPadding className={className} {...props}>
      {image && (
        <div className="relative aspect-[16/10] bg-gray-100 overflow-hidden">
          <img
            src={image}
            alt={imageAlt}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {badge && (
            <div className="absolute top-3 left-3">
              {badge}
            </div>
          )}
        </div>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// Stat card for dashboards
interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({ label, value, icon, trend, className = '' }: StatCardProps) {
  return (
    <Card variant="default" className={className}>
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <p
                className={`mt-2 text-sm font-medium ${
                  trend.isPositive ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : '-'}
                {Math.abs(trend.value)}%
              </p>
            )}
          </div>
          {icon && (
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
