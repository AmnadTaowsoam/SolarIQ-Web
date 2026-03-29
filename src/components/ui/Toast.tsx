'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { v4 as uuidv4 } from 'uuid'
import clsx from 'clsx'
import { Toast as ToastType, ToastType as ToastVariant } from '@/types'
import { sanitizeErrorMessage } from '@/lib/security'

interface ToastContextType {
  toasts: ToastType[]
  addToast: (type: ToastVariant, message: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastType[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    (type: ToastVariant, message: string, duration = 5000) => {
      const id = uuidv4()
      // Sanitize error messages to prevent sensitive info leakage
      const sanitizedMessage = type === 'error' ? sanitizeErrorMessage(message) : message
      const toast: ToastType = { id, type, message: sanitizedMessage, duration }

      setToasts((prev) => [...prev, toast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: ToastType[]
  removeToast: (id: string) => void
}

function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  if (toasts.length === 0) {
    return null
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      aria-live="polite"
      aria-label="Notifications"
      role="region"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: ToastType
  onClose: () => void
}

const toastStyles: Record<ToastVariant, string> = {
  success: 'bg-green-500/10 border-green-200 text-green-800',
  error: 'bg-red-500/10 border-red-500/20 text-red-400',
  warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600',
  info: 'bg-blue-500/10 border-blue-200 text-blue-800',
}

const toastIcons: Record<ToastVariant, ReactNode> = {
  success: (
    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
}

interface ToastProps {
  type: ToastVariant
  message: string
  onClose: () => void
}

export function Toast({ type, message, onClose }: ToastProps) {
  const toast: ToastType = { id: 'standalone', type, message, duration: 0 }
  return <ToastItem toast={toast} onClose={onClose} />
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg',
        'animate-slide-in min-w-[300px] max-w-md',
        toastStyles[toast.type]
      )}
      role="alert"
    >
      {toastIcons[toast.type]}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="text-[var(--brand-text-secondary)] hover:text-[var(--brand-text-secondary)] focus:outline-none"
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}
