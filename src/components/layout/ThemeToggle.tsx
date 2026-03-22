'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor } from 'lucide-react'

const THEME_OPTIONS = [
  { value: 'light', label: '\u0e2a\u0e27\u0e48\u0e32\u0e07', icon: Sun },
  { value: 'dark', label: '\u0e21\u0e37\u0e14', icon: Moon },
  { value: 'system', label: '\u0e23\u0e30\u0e1a\u0e1a', icon: Monitor },
] as const

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg bg-[var(--brand-surface)] border border-[var(--brand-border)]" />
    )
  }

  const ActiveIcon = resolvedTheme === 'dark' ? Moon : Sun

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] hover:bg-[var(--brand-border)]/30 rounded-lg transition-colors"
        aria-label="Toggle theme"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <ActiveIcon className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-36 bg-[var(--brand-surface)] rounded-xl shadow-lg border border-[var(--brand-border)] py-1 animate-fade-in z-50">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon
            const isActive = theme === option.value
            return (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value)
                  setOpen(false)
                }}
                className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'text-[var(--brand-primary)] bg-[var(--brand-primary-light)]'
                    : 'text-[var(--brand-text-secondary)] hover:bg-[var(--brand-border)]/30 hover:text-[var(--brand-text)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
