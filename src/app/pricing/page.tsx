'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, Button, Input, Badge, Modal, ModalFooter } from '@/components/ui'
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
import {
  useInstallationCosts,
  useElectricityRates,
  useCreateInstallationCost,
  useCreateElectricityRate,
} from '@/hooks'
import { ROUTES } from '@/lib/constants'
import { format } from 'date-fns'

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

// Tab Component
function Tabs({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: { id: string; label: string }[]
  activeTab: string
  onTabChange: (id: string) => void
}) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

// Installation Costs Tab
function InstallationCostsTab() {
  const t = useTranslations('pricingPage.installationCosts')
  const { addToast } = useToast()
  const { data: costs = [], isLoading } = useInstallationCosts()
  const createMutation = useCreateInstallationCost()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [costPerKwp, setCostPerKwp] = useState('')

  const handleCreate = async () => {
    const cost = parseFloat(costPerKwp)
    if (isNaN(cost) || cost <= 0) {
      addToast('error', t('invalidCost'))
      return
    }

    try {
      await createMutation.mutateAsync({ costPerKwp: cost })
      addToast('success', t('addSuccess'))
      setIsModalOpen(false)
      setCostPerKwp('')
    } catch {
      addToast('error', t('addFailed'))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)}>{t('addNewRate')}</Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={4} />
      ) : costs.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('costPerKwp')}</TableHead>
              <TableHead>{t('effectiveFrom')}</TableHead>
              <TableHead>{t('effectiveTo')}</TableHead>
              <TableHead>{t('lastUpdated')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costs.map((cost) => (
              <TableRow key={cost.id}>
                <TableCell className="font-medium">{formatCurrency(cost.costPerKwp)}</TableCell>
                <TableCell>{format(new Date(cost.effectiveFrom), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  {cost.effectiveTo
                    ? format(new Date(cost.effectiveTo), 'MMM dd, yyyy')
                    : t('current')}
                </TableCell>
                <TableCell>{format(new Date(cost.updatedAt), 'MMM dd, yyyy HH:mm')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('modalTitle')}
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label={t('costPerKwpLabel')}
            type="number"
            value={costPerKwp}
            onChange={(e) => setCostPerKwp(e.target.value)}
            placeholder={t('costPerKwpPlaceholder')}
            hint={t('costPerKwpHint')}
          />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleCreate} isLoading={createMutation.isPending}>
            {t('add')}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

// Electricity Rates Tab
function ElectricityRatesTab() {
  const t = useTranslations('pricingPage.electricityRates')
  const { addToast } = useToast()
  const { data: rates = [], isLoading } = useElectricityRates()
  const createMutation = useCreateElectricityRate()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [provider, setProvider] = useState<'PEA' | 'MEA'>('PEA')
  const [ratePerKwh, setRatePerKwh] = useState('')
  const [ftRate, setFtRate] = useState('')

  const handleCreate = async () => {
    const rate = parseFloat(ratePerKwh)
    const ft = parseFloat(ftRate)

    if (isNaN(rate) || rate <= 0) {
      addToast('error', t('invalidRate'))
      return
    }

    if (isNaN(ft)) {
      addToast('error', t('invalidFtRate'))
      return
    }

    try {
      await createMutation.mutateAsync({
        provider,
        ratePerKwh: rate,
        ftRate: ft,
      })
      addToast('success', t('addSuccess'))
      setIsModalOpen(false)
      setRatePerKwh('')
      setFtRate('')
    } catch {
      addToast('error', t('addFailed'))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)}>{t('addNewRate')}</Button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={5} />
      ) : rates.length === 0 ? (
        <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('provider')}</TableHead>
              <TableHead>{t('ratePerKwh')}</TableHead>
              <TableHead>{t('ftRate')}</TableHead>
              <TableHead>{t('effectiveFrom')}</TableHead>
              <TableHead>{t('lastUpdated')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell>
                  <Badge variant={rate.provider === 'PEA' ? 'primary' : 'secondary'}>
                    {rate.provider}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(rate.ratePerKwh)}</TableCell>
                <TableCell>{formatCurrency(rate.ftRate)}</TableCell>
                <TableCell>{format(new Date(rate.effectiveFrom), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{format(new Date(rate.updatedAt), 'MMM dd, yyyy HH:mm')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('modalTitle')}
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('providerLabel')}
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="provider"
                  value="PEA"
                  checked={provider === 'PEA'}
                  onChange={() => setProvider('PEA')}
                  className="mr-2"
                />
                PEA
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="provider"
                  value="MEA"
                  checked={provider === 'MEA'}
                  onChange={() => setProvider('MEA')}
                  className="mr-2"
                />
                MEA
              </label>
            </div>
          </div>
          <Input
            label={t('ratePerKwhLabel')}
            type="number"
            value={ratePerKwh}
            onChange={(e) => setRatePerKwh(e.target.value)}
            placeholder={t('ratePerKwhPlaceholder')}
            step="0.01"
          />
          <Input
            label={t('ftRateLabel')}
            type="number"
            value={ftRate}
            onChange={(e) => setFtRate(e.target.value)}
            placeholder={t('ftRatePlaceholder')}
            step="0.01"
            hint={t('ftRateHint')}
          />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleCreate} isLoading={createMutation.isPending}>
            {t('add')}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default function PricingPage() {
  const t = useTranslations('pricingPage')
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { addToast } = useToast()

  const [activeTab, setActiveTab] = useState('installation')

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN)
    } else if (!authLoading && user && user.role !== 'admin') {
      addToast('error', t('noPermission'))
      router.replace(ROUTES.DASHBOARD)
    }
  }, [user, authLoading, router, addToast, t])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  const tabs = [
    { id: 'installation', label: t('tabs.installation') },
    { id: 'electricity', label: t('tabs.electricity') },
  ]

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 mt-1">{t('subtitle')}</p>
        </div>

        {/* Tabs */}
        <Card>
          <CardBody className="p-0">
            <div className="px-6 pt-4">
              <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
            <div className="p-6">
              {activeTab === 'installation' && <InstallationCostsTab />}
              {activeTab === 'electricity' && <ElectricityRatesTab />}
            </div>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  )
}
