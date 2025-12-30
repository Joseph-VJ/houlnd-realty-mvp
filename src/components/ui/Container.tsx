/**
 * Container Component
 *
 * Layout container component for consistent page width and padding.
 *
 * Features:
 * - Multiple max-width sizes
 * - Responsive padding
 * - Centered content
 */

import { HTMLAttributes, ReactNode, forwardRef } from 'react'

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  size?: ContainerSize
  noPadding?: boolean
  centered?: boolean
}

const sizeStyles: Record<ContainerSize, string> = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full',
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      size = 'xl',
      noPadding = false,
      centered = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'w-full'
    const paddingStyles = noPadding ? '' : 'px-4 sm:px-6 lg:px-8'
    const centerStyles = centered ? 'mx-auto' : ''

    const containerClasses = [baseStyles, sizeStyles[size], paddingStyles, centerStyles, className]
      .filter(Boolean)
      .join(' ')

    return (
      <div ref={ref} className={containerClasses} {...props}>
        {children}
      </div>
    )
  }
)

Container.displayName = 'Container'

// Page wrapper with consistent vertical padding
interface PageWrapperProps extends ContainerProps {
  verticalPadding?: 'none' | 'sm' | 'md' | 'lg'
}

const verticalPaddingStyles = {
  none: '',
  sm: 'py-4 sm:py-6',
  md: 'py-8 sm:py-12',
  lg: 'py-12 sm:py-16 lg:py-20',
}

export function PageWrapper({
  children,
  verticalPadding = 'md',
  className = '',
  ...props
}: PageWrapperProps) {
  return (
    <Container className={`${verticalPaddingStyles[verticalPadding]} ${className}`} {...props}>
      {children}
    </Container>
  )
}

// Section component for page sections
interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  background?: 'white' | 'gray' | 'primary' | 'dark'
  spacing?: 'none' | 'sm' | 'md' | 'lg'
}

const backgroundStyles = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  primary: 'bg-blue-600 text-white',
  dark: 'bg-gray-900 text-white',
}

const spacingStyles = {
  none: '',
  sm: 'py-8 sm:py-12',
  md: 'py-12 sm:py-16',
  lg: 'py-16 sm:py-20 lg:py-24',
}

export function Section({
  children,
  background = 'white',
  spacing = 'md',
  className = '',
  ...props
}: SectionProps) {
  return (
    <section
      className={`${backgroundStyles[background]} ${spacingStyles[spacing]} ${className}`}
      {...props}
    >
      {children}
    </section>
  )
}

// Grid component for responsive layouts
interface GridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'none' | 'sm' | 'md' | 'lg'
}

const colStyles = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  12: 'grid-cols-4 sm:grid-cols-6 lg:grid-cols-12',
}

const gapStyles = {
  none: 'gap-0',
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
}

export function Grid({
  children,
  cols = 3,
  gap = 'md',
  className = '',
  ...props
}: GridProps) {
  return (
    <div className={`grid ${colStyles[cols]} ${gapStyles[gap]} ${className}`} {...props}>
      {children}
    </div>
  )
}

// Flex component for flexible layouts
interface FlexProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  direction?: 'row' | 'col'
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  gap?: 'none' | 'sm' | 'md' | 'lg'
  wrap?: boolean
}

const directionStyles = {
  row: 'flex-row',
  col: 'flex-col',
}

const alignStyles = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
  baseline: 'items-baseline',
}

const justifyStyles = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}

export function Flex({
  children,
  direction = 'row',
  align = 'start',
  justify = 'start',
  gap = 'md',
  wrap = false,
  className = '',
  ...props
}: FlexProps) {
  return (
    <div
      className={`
        flex
        ${directionStyles[direction]}
        ${alignStyles[align]}
        ${justifyStyles[justify]}
        ${gapStyles[gap]}
        ${wrap ? 'flex-wrap' : ''}
        ${className}
      `
        .replace(/\s+/g, ' ')
        .trim()}
      {...props}
    >
      {children}
    </div>
  )
}

// Stack component (vertical flex)
interface StackProps extends Omit<FlexProps, 'direction'> {}

export function Stack({ children, ...props }: StackProps) {
  return (
    <Flex direction="col" {...props}>
      {children}
    </Flex>
  )
}

// HStack component (horizontal flex)
interface HStackProps extends Omit<FlexProps, 'direction'> {}

export function HStack({ children, align = 'center', ...props }: HStackProps) {
  return (
    <Flex direction="row" align={align} {...props}>
      {children}
    </Flex>
  )
}

// Spacer component
export function Spacer({ className = '' }: { className?: string }) {
  return <div className={`flex-1 ${className}`} aria-hidden="true" />
}

// Divider component
interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Divider({ orientation = 'horizontal', className = '' }: DividerProps) {
  return orientation === 'horizontal' ? (
    <hr className={`border-t border-gray-200 ${className}`} />
  ) : (
    <div className={`w-px bg-gray-200 self-stretch ${className}`} aria-hidden="true" />
  )
}
