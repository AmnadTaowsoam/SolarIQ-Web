'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { useTranslations } from 'next-intl'
import { User } from '@/types'
import { ROUTES } from '@/lib/constants'
import { extractLocaleFromPath } from '@/lib/locale'
import { useBrand, useAuth } from '@/context'

interface SidebarProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  adminOnly?: boolean
}

interface NavGroup {
  label: string
  items: NavItem[]
  adminOnly?: boolean
}

export function Sidebar({ user, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()
  const tNav = useTranslations('nav')
  const tNavbar = useTranslations('navbar')
  const { brand } = useBrand()
  const isAdmin = user?.role === 'admin'
  const { pathname: cleanPath } = extractLocaleFromPath(pathname)
  const planLabel = 'PRO'
  const brandName = brand && 'company_name' in brand ? brand.company_name : 'SolarIQ'
  const brandLogo = brand && 'logo' in brand ? brand.logo?.light : brand?.logo_light_url
  const defaultLogo = '/SolarIQ/4.png' // SolarIQ icon (orange, light bg)

  const navGroups: NavGroup[] = [
    {
      label: tNav('overview'),
      items: [
        {
          name: tNav('dashboard'),
          href: ROUTES.DASHBOARD,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
          ),
        },
        {
          name: tNav('analytics'),
          href: ROUTES.ANALYTICS,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3v18h18M7.5 15l3-3 3 3 4.5-6"
              />
            </svg>
          ),
        },
        {
          name: tNav('leads'),
          href: ROUTES.LEADS,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          ),
        },
        {
          name: tNav('deals'),
          href: ROUTES.DEALS,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3.15h-3.15a1.575 1.575 0 000 3.15h3.15v3.15a1.575 1.575 0 003.15 0v-3.15h3.15a1.575 1.575 0 000-3.15h-3.15v-3.15zM15 12a3 3 0 110 6 3 3 0 010-6zm6.75 3a.75.75 0 01-.75.75H18a.75.75 0 010-1.5h3a.75.75 0 01.75.75z"
              />
            </svg>
          ),
        },
        {
          name: tNav('messages'),
          href: ROUTES.MESSAGES,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      label: tNav('tools'),
      items: [
        {
          name: tNav('calendar'),
          href: '/calendar',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
              />
            </svg>
          ),
        },
        {
          name: tNav('solarAnalysis'),
          href: ROUTES.ANALYZE,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      label: tNav('myBusiness'),
      items: [
        {
          name: tNav('commissions'),
          href: ROUTES.COMMISSIONS,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6v12m6-6H6m15 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        },
        {
          name: tNav('invoices'),
          href: ROUTES.INVOICES,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 8.25V6a2.25 2.25 0 00-2.25-2.25h-10.5A2.25 2.25 0 004.5 6v12a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 18v-2.25M15 8.25h-6M15 12h-6m6 3.75h-6"
              />
            </svg>
          ),
        },
        {
          name: tNav('maintenance'),
          href: '/maintenance',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.42 15.17l-5.2-5.2a2 2 0 010-2.83l.18-.18a2 2 0 012.83 0l2.19 2.19 5.56-5.56a2 2 0 012.83 0l.18.18a2 2 0 010 2.83l-8.57 8.57zM6 21h12"
              />
            </svg>
          ),
        },
        {
          name: tNav('serviceCenter'),
          href: '/service-requests',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
              />
            </svg>
          ),
        },
      ],
    },
    {
      label: tNav('accountAndPlan'),
      items: [
        {
          name: tNav('billing'),
          href: '/billing',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
              />
            </svg>
          ),
        },
        {
          name: tNav('settings'),
          href: ROUTES.SETTINGS,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ),
        },
        {
          name: tNav('serviceArea'),
          href: ROUTES.SERVICE_AREA,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
          ),
        },
        {
          name: tNav('sessions'),
          href: ROUTES.SESSIONS,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      label: tNav('admin'),
      adminOnly: true,
      items: [
        {
          name: tNav('knowledgeBase'),
          href: ROUTES.KNOWLEDGE,
          adminOnly: true,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          ),
        },
        {
          name: tNav('pricing'),
          href: ROUTES.PRICING,
          adminOnly: true,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 6h.008v.008H6V6z"
              />
            </svg>
          ),
        },
        {
          name: tNav('revenue'),
          href: ROUTES.ADMIN_REVENUE,
          adminOnly: true,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
              />
            </svg>
          ),
        },
        {
          name: tNav('auditLogs'),
          href: ROUTES.AUDIT_LOGS,
          adminOnly: true,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          ),
        },
        {
          name: 'Developer API',
          href: ROUTES.DEVELOPERS,
          adminOnly: true,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
              />
            </svg>
          ),
        },
      ],
    },
  ]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'sidebar-nav w-[260px] bg-[var(--brand-sidebar)] border-r border-[var(--brand-border)]',
          'transition-transform duration-200 ease-out',
          'flex flex-col flex-shrink-0',
          // Mobile: slide in/out (controlled by CSS below + isOpen)
          !isOpen && 'sidebar-closed'
        )}
      >
        <div className="flex items-center justify-between h-16 px-5 border-b border-[var(--brand-border)] flex-shrink-0">
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm overflow-hidden bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={brandLogo || defaultLogo}
                alt={brandName}
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <span className="text-lg font-bold text-[var(--brand-sidebar-text)] tracking-tight">
                {brandName}
              </span>
              <span className="text-[10px] text-[var(--brand-primary)] font-semibold ml-1.5 px-1.5 py-0.5 bg-[var(--brand-primary-light)] rounded-full">
                {planLabel}
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {navGroups
            .filter((group) => !group.adminOnly || isAdmin)
            .map((group) => (
              <div key={group.label}>
                <p className="px-3 text-[10px] font-bold text-[var(--brand-sidebar-text)]/40 uppercase tracking-[0.1em] mb-2">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.items
                    .filter((item) => !item.adminOnly || isAdmin)
                    .map((item) => {
                      const isActive =
                        cleanPath === item.href || cleanPath.startsWith(`${item.href}/`)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={clsx(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative',
                            isActive
                              ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border-l-[3px] border-[var(--brand-primary)] ml-0 pl-[9px]'
                              : 'text-[var(--brand-sidebar-text)] opacity-80 hover:bg-[var(--brand-primary-light)] hover:text-[var(--brand-primary)]'
                          )}
                        >
                          <span
                            className={clsx(
                              'text-[var(--brand-sidebar-text)] opacity-70',
                              isActive && 'text-[var(--brand-primary)] opacity-100'
                            )}
                          >
                            {item.icon}
                          </span>
                          {item.name}
                        </Link>
                      )
                    })}
                </div>
              </div>
            ))}
        </nav>

        {/* Marketing Links */}
        <div className="border-t border-[var(--brand-border)] px-3 py-3">
          <p className="px-3 text-[10px] font-bold text-[var(--brand-sidebar-text)]/40 uppercase tracking-[0.1em] mb-2">
            SolarIQ
          </p>
          <div className="space-y-0.5">
            <Link
              href="/pricing-plans"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--brand-sidebar-text)] opacity-80 hover:bg-[var(--brand-primary-light)] hover:text-[var(--brand-primary)] transition-colors"
            >
              <svg
                className="w-5 h-5 opacity-70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 6h.008v.008H6V6z"
                />
              </svg>
              {tNav('pricingPlans')}
            </Link>
            <Link
              href="/about"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--brand-sidebar-text)] opacity-80 hover:bg-[var(--brand-primary-light)] hover:text-[var(--brand-primary)] transition-colors"
            >
              <svg
                className="w-5 h-5 opacity-70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
              {tNav('about')}
            </Link>
            <Link
              href="/contact"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--brand-sidebar-text)] opacity-80 hover:bg-[var(--brand-primary-light)] hover:text-[var(--brand-primary)] transition-colors"
            >
              <svg
                className="w-5 h-5 opacity-70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              {tNav('contact')}
            </Link>
          </div>
        </div>

        <div className="border-t border-[var(--brand-border)] p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center gap-3 px-3 py-2 text-sm font-medium text-[var(--brand-sidebar-text)] opacity-80 hover:bg-[var(--brand-primary-light)] hover:text-[var(--brand-primary)] rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-[var(--brand-sidebar-text)] opacity-70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
              {tNavbar('signOut')}
            </button>
            <span className="text-[10px] text-[var(--brand-sidebar-text)]/40 font-mono px-2">
              v2.3
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}
