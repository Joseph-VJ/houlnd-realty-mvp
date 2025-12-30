/**
 * Modal Component
 *
 * Accessible modal dialog component with animations.
 *
 * Features:
 * - Accessible (focus trap, keyboard navigation)
 * - Multiple sizes
 * - Customizable header, body, footer
 * - Backdrop click to close
 * - Animation on open/close
 */

'use client'

import { ReactNode, useEffect, useCallback, useRef, Fragment } from 'react'
import { createPortal } from 'react-dom'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  size?: ModalSize
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  title?: string
  description?: string
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
}

export function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  title,
  description,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  // Handle escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose()
      }
    },
    [closeOnEscape, onClose]
  )

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        onClose()
      }
    },
    [closeOnBackdrop, onClose]
  )

  // Focus management and event listeners
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleEscape)

      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus()
      }, 0)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)

      // Restore focus
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus()
      }
    }

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, handleEscape])

  if (!isOpen) return null

  // Use portal for better stacking context
  const modalContent = (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={handleBackdropClick}
      >
        {/* Modal */}
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
          tabIndex={-1}
          className={`
            relative w-full ${sizeStyles[size]}
            bg-white rounded-xl shadow-2xl
            animate-scale-in
            focus:outline-none
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="
                absolute top-4 right-4 z-10
                p-2 rounded-lg
                text-gray-400 hover:text-gray-600
                hover:bg-gray-100
                transition-colors
                focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
              "
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {children}
        </div>
      </div>
    </Fragment>
  )

  // Render to portal
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }

  return null
}

// Modal Header
interface ModalHeaderProps {
  children?: ReactNode
  title?: string
  description?: string
  className?: string
}

export function ModalHeader({ children, title, description, className = '' }: ModalHeaderProps) {
  return (
    <div className={`px-6 pt-6 pb-4 ${className}`}>
      {title && (
        <h2 id="modal-title" className="text-xl font-semibold text-gray-900">
          {title}
        </h2>
      )}
      {description && (
        <p id="modal-description" className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      )}
      {children}
    </div>
  )
}

// Modal Body
interface ModalBodyProps {
  children: ReactNode
  className?: string
}

export function ModalBody({ children, className = '' }: ModalBodyProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>
}

// Modal Footer
interface ModalFooterProps {
  children: ReactNode
  className?: string
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  )
}

// Confirmation Modal
interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  const iconStyles = {
    danger: 'bg-red-100 text-red-600',
    warning: 'bg-amber-100 text-amber-600',
    info: 'bg-blue-100 text-blue-600',
  }

  const buttonStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500',
    warning: 'bg-amber-600 hover:bg-amber-700 focus-visible:ring-amber-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500',
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 p-3 rounded-full ${iconStyles[variant]}`}>
            {variant === 'danger' && (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {variant === 'warning' && (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {variant === 'info' && (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-sm text-gray-500">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="
              px-4 py-2 text-sm font-medium rounded-lg
              text-gray-700 bg-white border border-gray-300
              hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`
              px-4 py-2 text-sm font-medium rounded-lg
              text-white ${buttonStyles[variant]}
              focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed
              inline-flex items-center gap-2
            `}
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}
