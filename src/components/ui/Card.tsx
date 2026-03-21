'use client'

import { HTMLAttributes, forwardRef, ReactNode } from 'react'
import clsx from 'clsx'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={clsx('bg-[var(--brand-surface)] rounded-[var(--brand-radius-lg)] shadow-sm border border-[var(--brand-border)]', className)}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: ReactNode
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('px-6 py-4 border-b border-[var(--brand-border)]', className)}
        {...props}
      >
        {(title || subtitle || action) ? (
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className="text-lg font-semibold text-[var(--brand-text)]">{title}</h3>}
              {subtitle && <p className="text-sm text-[var(--brand-text-secondary)] mt-1">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
        ) : (
          children
        )}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('px-6 py-4', className)} {...props}>
        {children}
      </div>
    )
  }
)

CardBody.displayName = 'CardBody'

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('px-6 py-4 border-t border-[var(--brand-border)] bg-[var(--brand-background)] rounded-b-[var(--brand-radius-lg)]', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'
