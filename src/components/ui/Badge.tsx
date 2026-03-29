'use client'

import { HTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles = {
  default: 'bg-[var(--brand-background)] text-[var(--brand-text)]',
  primary: 'bg-primary-100 text-primary-800',
  secondary: 'bg-secondary-100 text-secondary-800',
  success: 'bg-green-500/10 text-green-800',
  warning: 'bg-yellow-500/10 text-yellow-600',
  danger: 'bg-red-100 text-red-400',
  info: 'bg-blue-500/10 text-blue-800',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base',
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={clsx(
          'inline-flex items-center font-medium rounded-full',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'
