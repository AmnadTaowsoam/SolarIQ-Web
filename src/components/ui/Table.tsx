'use client'

import { HTMLAttributes, forwardRef, ReactNode } from 'react'
import clsx from 'clsx'

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  children: ReactNode
}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="overflow-x-auto">
        <table
          ref={ref}
          className={clsx('min-w-full divide-y divide-[var(--brand-border)]', className)}
          {...props}
        >
          {children}
        </table>
      </div>
    )
  }
)

Table.displayName = 'Table'

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode
}

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead ref={ref} className={clsx('bg-[var(--brand-background)]', className)} {...props}>
        {children}
      </thead>
    )
  }
)

TableHeader.displayName = 'TableHeader'

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode
}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={clsx(
          'bg-[var(--brand-surface)] divide-y divide-[var(--brand-border)]',
          className
        )}
        {...props}
      >
        {children}
      </tbody>
    )
  }
)

TableBody.displayName = 'TableBody'

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode
  isClickable?: boolean
  isSelected?: boolean
}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, children, isClickable = false, isSelected = false, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={clsx(
          isSelected && 'bg-primary-50',
          isClickable && 'cursor-pointer hover:bg-[var(--brand-primary-light)]',
          className
        )}
        {...props}
      >
        {children}
      </tr>
    )
  }
)

TableRow.displayName = 'TableRow'

export interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode
  sortable?: boolean
  sorted?: 'asc' | 'desc' | null
  onSort?: () => void
}

export const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, children, sortable = false, sorted, onSort, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={clsx(
          'px-6 py-3 text-left text-xs font-medium text-[var(--brand-text-secondary)] uppercase tracking-wider',
          sortable && 'cursor-pointer hover:bg-[var(--brand-primary-light)] select-none',
          className
        )}
        onClick={sortable ? onSort : undefined}
        {...props}
      >
        <div className="flex items-center gap-2">
          {children}
          {sortable && (
            <span className="text-[var(--brand-text-secondary)]">
              {sorted === 'asc' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              ) : sorted === 'desc' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              )}
            </span>
          )}
        </div>
      </th>
    )
  }
)

TableHead.displayName = 'TableHead'

export interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={clsx('px-6 py-4 whitespace-nowrap text-sm text-[var(--brand-text)]', className)}
        {...props}
      >
        {children}
      </td>
    )
  }
)

TableCell.displayName = 'TableCell'

// Empty state component
export interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="mx-auto h-12 w-12 text-[var(--brand-text-secondary)]">{icon}</div>}
      <h3 className="mt-2 text-sm font-medium text-[var(--brand-text)]">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

// Loading skeleton
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="animate-pulse">
      <div className="bg-[var(--brand-background)] h-10 rounded-t-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-[var(--brand-border)] py-4 px-6 flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div key={j} className="h-4 bg-[var(--brand-border)] rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}
