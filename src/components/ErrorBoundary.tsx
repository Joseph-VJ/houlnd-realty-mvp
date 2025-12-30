/**
 * Error Boundary Component
 *
 * React Error Boundary for catching and displaying errors gracefully.
 * Works with Next.js App Router for improved error handling.
 */

'use client'

import { Component, ReactNode } from 'react'
import Link from 'next/link'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <ErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

// Default Error Fallback UI
interface ErrorFallbackProps {
  error: Error | null
  onReset?: () => void
}

export function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100 mb-6">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-6">
          We're sorry, but something unexpected happened. Please try again.
        </p>

        {/* Error details (development only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error details
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs text-red-600 overflow-auto max-h-40">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onReset && (
            <button
              onClick={onReset}
              className="
                px-5 py-2.5 rounded-lg font-medium
                bg-blue-600 text-white
                hover:bg-blue-700 active:bg-blue-800
                transition-colors
              "
            >
              Try again
            </button>
          )}
          <Link
            href="/"
            className="
              px-5 py-2.5 rounded-lg font-medium
              bg-gray-100 text-gray-700
              hover:bg-gray-200 active:bg-gray-300
              transition-colors
            "
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}

// Page-level error component for Next.js error.tsx files
interface PageErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export function PageError({ error, reset }: PageErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Error Icon */}
          <div className="mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-red-100 mb-6">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-8">
            We encountered an unexpected error. Our team has been notified and is working on a fix.
          </p>

          {/* Error digest for support */}
          {error.digest && (
            <p className="text-xs text-gray-400 mb-6">
              Error ID: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="
                px-6 py-3 rounded-lg font-semibold
                bg-blue-600 text-white
                hover:bg-blue-700 active:bg-blue-800
                transition-all hover:shadow-lg
              "
            >
              Try again
            </button>
            <Link
              href="/"
              className="
                px-6 py-3 rounded-lg font-semibold
                bg-gray-100 text-gray-700
                hover:bg-gray-200 active:bg-gray-300
                transition-colors
              "
            >
              Go to homepage
            </Link>
          </div>
        </div>

        {/* Help text */}
        <p className="mt-6 text-center text-sm text-gray-500">
          If this problem persists, please{' '}
          <Link href="/contact" className="text-blue-600 hover:underline">
            contact support
          </Link>
        </p>
      </div>
    </div>
  )
}

// Not Found component for Next.js not-found.tsx files
export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Illustration */}
        <div className="text-9xl font-bold text-gray-200 mb-4">404</div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page not found
        </h1>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="
              px-6 py-3 rounded-lg font-semibold
              bg-blue-600 text-white
              hover:bg-blue-700 active:bg-blue-800
              transition-all hover:shadow-lg
            "
          >
            Go to homepage
          </Link>
          <Link
            href="/search"
            className="
              px-6 py-3 rounded-lg font-semibold
              bg-gray-100 text-gray-700
              hover:bg-gray-200 active:bg-gray-300
              transition-colors
            "
          >
            Browse properties
          </Link>
        </div>
      </div>
    </div>
  )
}

// Empty state component
interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      {icon && (
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && <p className="text-gray-500 mb-6">{description}</p>}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="
              inline-flex items-center px-4 py-2 rounded-lg font-medium
              bg-blue-600 text-white
              hover:bg-blue-700 transition-colors
            "
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="
              inline-flex items-center px-4 py-2 rounded-lg font-medium
              bg-blue-600 text-white
              hover:bg-blue-700 transition-colors
            "
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
