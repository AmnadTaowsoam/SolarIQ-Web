'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, Button, Input, Select, Badge, Modal, ModalFooter } from '@/components/ui'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
  TableSkeleton,
} from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import { useLeads, useUpdateLeadStatus } from '@/hooks'
import { ROUTES, LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, PAGE_SIZE_OPTIONS } from '@/lib/constants'
import { Lead, LeadStatus, LeadFilters } from '@/types'
import { format } from 'date-fns'

export default function LeadsPage() {
  const t = useTranslations('leadsPage')
  const tc = useTranslations('common')
  const tl = useTranslations('leads')
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { addToast } = useToast()

  const statusOptions = [
    { value: '', label: t('allStatuses') },
    { value: 'new', label: tl('statusOptions.new') },
    { value: 'contacted', label: tl('statusOptions.contacted') },
    { value: 'quoted', label: tl('statusOptions.quoted') },
    { value: 'won', label: tl('statusOptions.won') },
    { value: 'lost', label: tl('statusOptions.lost') },
  ]

  const [filters, setFilters] = useState<LeadFilters>({})
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<LeadStatus>('new')

  const { data, isLoading } = useLeads({ page, pageSize, filters })
  const updateStatusMutation = useUpdateLeadStatus()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN)
    }
  }, [user, authLoading, router])
  const handleSearch = () => {
    const sanitizedSearch = search.replace(/[^\w\s@.-]/gi, '').trim()
    setFilters((prev) => ({ ...prev, search: sanitizedSearch }))
    setPage(1)
  }

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status as LeadStatus | undefined,
    }))
    setPage(1)
  }

  const openStatusModal = (lead: Lead) => {
    setSelectedLead(lead)
    setNewStatus(lead.status)
    setIsStatusModalOpen(true)
  }

  const handleUpdateStatus = async () => {
    if (!selectedLead) {
      return
    }

    try {
      await updateStatusMutation.mutateAsync({
        id: selectedLead.id,
        status: newStatus,
      })
      addToast('success', t('messages.statusUpdated'))
      setIsStatusModalOpen(false)
      setSelectedLead(null)
    } catch {
      addToast('error', t('messages.statusUpdateError'))
    }
  }

  const viewLeadDetail = (leadId: string) => {
    router.push(`${ROUTES.LEADS}/${leadId}`)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const leads = data?.items || []
  const total = data?.total || 0
  const totalPages = data?.totalPages || 1

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-500 mt-1">{t('subtitle')}</p>
          </div>
          <Button onClick={() => router.push(ROUTES.ANALYZE)}>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t('newAnalysis')}
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardBody className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>{tc('search')}</Button>
              </div>
              <div className="w-full md:w-48">
                <Select
                  options={statusOptions}
                  value={filters.status || ''}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  placeholder={tc('filter')}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Leads table */}
        <Card>
          <CardBody className="p-0">
            {isLoading ? (
              <TableSkeleton rows={pageSize} columns={6} />
            ) : leads.length === 0 ? (
              <EmptyState
                title={t('empty.title')}
                description={t('empty.description')}
                icon={
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                }
                action={
                  <Button onClick={() => router.push(ROUTES.ANALYZE)}>
                    {t('empty.createNew')}
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.name')}</TableHead>
                    <TableHead>{t('table.contact')}</TableHead>
                    <TableHead>{t('table.address')}</TableHead>
                    <TableHead>{t('table.monthlyBill')}</TableHead>
                    <TableHead>{t('table.status')}</TableHead>
                    <TableHead>{t('table.created')}</TableHead>
                    <TableHead>{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead: Lead) => (
                    <TableRow key={lead.id} isClickable onClick={() => viewLeadDetail(lead.id)}>
                      <TableCell>
                        <div className="font-medium">{lead.name || lead.address || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{lead.phone || '-'}</div>
                        <div className="text-sm text-gray-500">{lead.email || ''}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm max-w-xs truncate">{lead.address || '-'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ฿{(lead.monthlyBill ?? 0).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={LEAD_STATUS_COLORS[lead.status || 'new']}>
                          {LEAD_STATUS_LABELS[lead.status || 'new']}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {(() => {
                            try {
                              return format(new Date(lead.createdAt), 'MMM dd, yyyy')
                            } catch {
                              return '-'
                            }
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="outline" onClick={() => openStatusModal(lead)}>
                            {t('updateStatus')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{t('pagination.rowsPerPage')}</span>
              <Select
                options={PAGE_SIZE_OPTIONS.map((size) => ({
                  value: String(size),
                  label: String(size),
                }))}
                value={String(pageSize)}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
                className="w-20"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {t('pagination.pageInfo', { page, totalPages, total })}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  {tc('previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  {tc('next')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal */}
        <Modal
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          title={t('updateStatusModal.title')}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {t('updateStatusModal.description', { name: selectedLead?.name || '' })}
            </p>
            <Select
              label={t('updateStatusModal.newStatus')}
              options={statusOptions.filter((opt) => opt.value)}
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as LeadStatus)}
            />
          </div>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
              {tc('cancel')}
            </Button>
            <Button onClick={handleUpdateStatus} isLoading={updateStatusMutation.isPending}>
              {t('updateStatus')}
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </AppLayout>
  )
}
