/**
 * Button Component
 *
 * Reusable button component with multiple variants and sizes.
 * Enhanced with smooth animations and modern styling.
 *
 * Variants:
 * - primary: Blue background (default)
 * - secondary: Gray background
 * - outline: Transparent with border
 * - ghost: Transparent, no border
 * - danger: Red background
 * - success: Green background
 *
 * Sizes:
 * - sm: Small
 * - md: Medium (default)
 * - lg: Large
 * - xl: Extra Large
 */

import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: ReactNode
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-semibold rounded-lg
      transition-all duration-200 ease-out
      focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      active:scale-[0.98]
    `

    const variantStyles = {
      primary: `
        bg-blue-600 text-white
        hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25
        active:bg-blue-800
        focus-visible:ring-blue-500
      `,
      secondary: `
        bg-gray-100 text-gray-900
        hover:bg-gray-200 hover:shadow-md
        active:bg-gray-300
        focus-visible:ring-gray-500
        border border-gray-200
      `,
      outline: `
        bg-transparent text-gray-700
        border-2 border-gray-300
        hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900
        active:bg-gray-100
        focus-visible:ring-gray-500
      `,
      ghost: `
        bg-transparent text-gray-700
        hover:bg-gray-100 hover:text-gray-900
        active:bg-gray-200
        focus-visible:ring-gray-500
      `,
      danger: `
        bg-red-600 text-white
        hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/25
        active:bg-red-800
        focus-visible:ring-red-500
      `,
      success: `
        bg-emerald-600 text-white
        hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/25
        active:bg-emerald-800
        focus-visible:ring-emerald-500
      `,
    }

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm min-h-[32px]',
      md: 'px-4 py-2 text-sm min-h-[40px]',
      lg: 'px-5 py-2.5 text-base min-h-[44px]',
      xl: 'px-6 py-3 text-lg min-h-[52px]',
    }

    const widthStyles = fullWidth ? 'w-full' : ''

    // Clean up whitespace from template literals
    const cleanedStyles = [
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      widthStyles,
      className,
    ]
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()

    return (
      <button
        ref={ref}
        className={cleanedStyles}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4"
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
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

// Convenience components for common use cases
export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="primary" {...props} />
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="secondary" {...props} />
}

export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="danger" {...props} />
}

export function SuccessButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button variant="success" {...props} />
}

// Icon-only button variant
interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon'> {
  icon: ReactNode
  'aria-label': string
}

export function IconButton({ icon, size = 'md', className = '', ...props }: IconButtonProps) {
  const sizeStyles = {
    sm: 'p-1.5 min-h-[32px] min-w-[32px]',
    md: 'p-2 min-h-[40px] min-w-[40px]',
    lg: 'p-2.5 min-h-[44px] min-w-[44px]',
    xl: 'p-3 min-h-[52px] min-w-[52px]',
  }

  return (
    <Button size={size} className={`${sizeStyles[size]} ${className}`} {...props}>
      {icon}
    </Button>
  )
}
