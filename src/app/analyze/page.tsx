'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context'
import { AppLayout } from '@/components/layout'
import { Card, CardHeader, CardBody, Button, Input } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { useSolarAnalysisAdvanced } from '@/hooks'
import { ROUTES, DEFAULT_MAP_CENTER } from '@/lib/constants'
import type { SolarAnalysisAdvanced } from '@/types'
import {
  RoofSegmentAnalysis,
  PanelLayoutMap,
  ShadeAnalysisChart,
  HourlyIrradianceChart,
  AerialImagery,
  PanelComparison,
  LocalIncentives,
  CashflowChart,
  GeoTIFFDownload,
  MonthlyProductionChart,
  SystemSizeOptimizer,
  EnvironmentalImpact,
  SelfConsumptionSlider,
  AnalysisReportExport,
} from '@/components/solar'
import {
  Sun,
  MapPin,
  Wallet,
  Cpu,
  Gift,
  Database,
  Zap,
  TrendingUp,
  DollarSign,
  Leaf,
  Building,
  Calendar,
  Wrench,
} from 'lucide-react'

// ---- Helpers ----

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

// ---- Tab definitions ----

type TabId = 'overview' | 'roof' | 'solar' | 'financial' | 'equipment' | 'incentives' | 'data'

interface TabDef {
  id: TabId
  label: string
  icon: React.ReactNode
}

const TABS: TabDef[] = [
  { id: 'overview', label: 'Overview', icon: <Sun className="w-4 h-4" /> },
  { id: 'roof', label: 'Roof Analysis', icon: <Building className="w-4 h-4" /> },
  { id: 'solar', label: 'Solar Potential', icon: <Zap className="w-4 h-4" /> },
  { id: 'financial', label: 'Financial', icon: <Wallet className="w-4 h-4" /> },
  { id: 'equipment', label: 'Equipment', icon: <Cpu className="w-4 h-4" /> },
  { id: 'incentives', label: 'Incentives', icon: <Gift className="w-4 h-4" /> },
  { id: 'data', label: 'Data Export', icon: <Database className="w-4 h-4" /> },
]

// ---- Tab Content Components ----

function OverviewTab({ result }: { result: SolarAnalysisAdvanced }) {
  return (
    <div className="space-y-6 transition-opacity duration-300">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--brand-primary)]/10">
                <Zap className="w-5 h-5 text-[var(--brand-primary)]" />
              </div>
              <div>
                <div className="text-xs text-[var(--brand-text-secondary)]">System Size</div>
                <div className="text-xl font-bold text-[var(--brand-text)]">
                  {result.panelConfig.capacityKw.toFixed(2)} kWp
                </div>
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  {result.panelConfig.panelsCount} panels
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-xs text-[var(--brand-text-secondary)]">Yearly Production</div>
                <div className="text-xl font-bold text-[var(--brand-text)]">
                  {result.panelConfig.yearlyEnergyDcKwh.toLocaleString()} kWh
                </div>
                <div className="text-xs text-[var(--brand-text-secondary)]">per year</div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-xs text-[var(--brand-text-secondary)]">Payback Period</div>
                <div className="text-xl font-bold text-[var(--brand-text)]">
                  {result.financialAnalysis.paybackYears.toFixed(1)} years
                </div>
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  ROI: {result.financialAnalysis.roi25Year.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Leaf className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <div className="text-xs text-[var(--brand-text-secondary)]">CO2 Offset</div>
                <div className="text-xl font-bold text-[var(--brand-text)]">
                  {((result.panelConfig.yearlyEnergyDcKwh * result.solarPotential.carbonOffsetFactorKgPerMwh) / 1000).toFixed(1)} tons
                </div>
                <div className="text-xs text-[var(--brand-text-secondary)]">per year</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader title="Financial Summary" />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-[var(--brand-text-secondary)]">Installation Cost</div>
              <div className="text-lg font-semibold text-[var(--brand-text)]">
                {formatCurrency(result.financialAnalysis.installationCost)}
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--brand-text-secondary)]">Net Cost</div>
              <div className="text-lg font-semibold text-[var(--brand-text)]">
                {formatCurrency(result.financialAnalysis.netCost)}
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--brand-text-secondary)]">Monthly Savings</div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(result.financialAnalysis.monthlySavings)}
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--brand-text-secondary)]">Yearly Savings</div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(result.financialAnalysis.yearlySavings)}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Solar Potential & Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Solar Potential" />
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">Max Sunshine Hours</div>
                <div className="text-lg font-semibold text-[var(--brand-text)]">
                  {result.solarPotential.maxSunshineHoursPerYear.toLocaleString()} hrs/yr
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">Roof Area</div>
                <div className="text-lg font-semibold text-[var(--brand-text)]">
                  {result.solarPotential.roofAreaM2.toFixed(0)} m&sup2;
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">Max Panels</div>
                <div className="text-lg font-semibold text-[var(--brand-text)]">
                  {result.solarPotential.maxPanels}
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">Quality</div>
                <div className="text-lg font-semibold text-[var(--brand-primary)]">
                  {result.solarPotential.quality}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Location" />
          <CardBody>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">Address</div>
                <div className="text-sm font-medium text-[var(--brand-text)]">{result.address}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-[var(--brand-text-secondary)]">Coordinates</div>
                  <div className="text-sm font-medium text-[var(--brand-text)]">
                    {result.coordinates.latitude.toFixed(4)}, {result.coordinates.longitude.toFixed(4)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[var(--brand-text-secondary)]">Electricity Rate</div>
                  <div className="text-sm font-medium text-[var(--brand-text)]">
                    ฿{result.electricityRate.toFixed(2)}/kWh
                  </div>
                </div>
              </div>
              {result.solarPotential.imageryDate && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--brand-text-secondary)]">
                  <Calendar className="w-3.5 h-3.5" />
                  Imagery date: {result.solarPotential.imageryDate}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Environmental Impact */}
      {result.environmentalImpact && (
        <EnvironmentalImpact
          data={result.environmentalImpact}
          annualProductionKwh={result.panelConfig.yearlyEnergyDcKwh}
        />
      )}

      {/* Advanced financial metrics */}
      {(result.financialAnalysis.npvThb !== undefined || result.financialAnalysis.irrPercent !== undefined) && (
        <Card>
          <CardHeader title="Advanced Financial Metrics" />
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">NPV (25-Year)</div>
                <div className="text-lg font-semibold text-[var(--brand-text)]">
                  {formatCurrency(result.financialAnalysis.npvThb)}
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">IRR</div>
                <div className="text-lg font-semibold text-[var(--brand-text)]">
                  {result.financialAnalysis.irrPercent.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">25-Year ROI</div>
                <div className="text-lg font-semibold text-green-600">
                  {result.financialAnalysis.roi25Year.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">Payback Period</div>
                <div className="text-lg font-semibold text-blue-600">
                  {result.financialAnalysis.paybackYears.toFixed(1)} years
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

function RoofTab({ result }: { result: SolarAnalysisAdvanced }) {
  return (
    <div className="space-y-6 transition-opacity duration-300">
      <RoofSegmentAnalysis segments={result.roofSegments} />
      <PanelLayoutMap
        latitude={result.coordinates.latitude}
        longitude={result.coordinates.longitude}
        panels={result.solarPanels}
        segments={result.roofSegments}
        panelConfigs={result.panelConfigs}
      />
    </div>
  )
}

function SolarPotentialTab({ result }: { result: SolarAnalysisAdvanced }) {
  return (
    <div className="space-y-6 transition-opacity duration-300">
      {result.shadeAnalysis && (
        <ShadeAnalysisChart shadeAnalysis={result.shadeAnalysis} />
      )}
      {result.hourlyIrradiance && result.hourlyIrradiance.length > 0 && (
        <HourlyIrradianceChart data={result.hourlyIrradiance} />
      )}
      {result.dataLayers && (
        <AerialImagery
          dataLayers={result.dataLayers}
          imageryDate={result.solarPotential.imageryDate}
        />
      )}
      {/* Monthly Production Chart */}
      {result.monthlyProduction && result.monthlyProduction.length > 0 && (
        <MonthlyProductionChart
          data={result.monthlyProduction}
          systemSizeKwp={result.panelConfig.capacityKw}
        />
      )}
      {!result.shadeAnalysis && (!result.hourlyIrradiance || result.hourlyIrradiance.length === 0) && !result.dataLayers && (!result.monthlyProduction || result.monthlyProduction.length === 0) && (
        <Card>
          <CardBody className="p-8 text-center text-[var(--brand-text-secondary)]">
            <Sun className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No detailed solar potential data available for this location.</p>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

function FinancialTab({ result, monthlyBill }: { result: SolarAnalysisAdvanced; monthlyBill: number }) {
  const annualMaintenance = result.annualMaintenanceCost || 0
  const netYearlySavings = result.financialAnalysis.yearlySavings - annualMaintenance

  return (
    <div className="space-y-6 transition-opacity duration-300">
      {result.yearlyCashflow && result.yearlyCashflow.length > 0 && (
        <CashflowChart
          cashflow={result.yearlyCashflow}
          paybackYears={result.financialAnalysis.paybackYears}
          installationCost={result.financialAnalysis.installationCost}
        />
      )}

      {/* System Size Optimizer */}
      {result.systemOptions && result.systemOptions.length > 0 && (
        <SystemSizeOptimizer
          options={result.systemOptions}
          currentBillThb={monthlyBill}
        />
      )}

      {/* Self-Consumption & Maintenance Summary */}
      <Card>
        <CardHeader title="ข้อมูลการใช้ไฟและค่าบำรุงรักษา" subtitle="Consumption & Maintenance" />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-[var(--brand-text-secondary)]">อัตราใช้เอง</div>
              <div className="text-lg font-semibold text-[var(--brand-primary)]">
                {result.selfConsumptionRate ? `${(result.selfConsumptionRate * 100).toFixed(0)}%` : 'N/A'}
              </div>
              <div className="text-xs text-[var(--brand-text-secondary)]">Self-Consumption Rate</div>
            </div>
            <div>
              <div className="text-sm text-[var(--brand-text-secondary)]">ราคาขายคืน</div>
              <div className="text-lg font-semibold text-[var(--brand-text)]">
                {result.netBillingRate ? `฿${result.netBillingRate.toFixed(1)}/kWh` : 'N/A'}
              </div>
              <div className="text-xs text-[var(--brand-text-secondary)]">Net Billing Rate</div>
            </div>
            <div>
              <div className="text-sm text-[var(--brand-text-secondary)]">ค่าบำรุงรักษา/ปี</div>
              <div className="text-lg font-semibold text-[var(--brand-text)]">
                {annualMaintenance > 0 ? formatCurrency(annualMaintenance) : 'N/A'}
              </div>
              <div className="text-xs text-[var(--brand-text-secondary)]">Annual Maintenance</div>
            </div>
            <div>
              <div className="text-sm text-[var(--brand-text-secondary)]">ผลประหยัดรวม (หลังหักค่าบำรุง)</div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(netYearlySavings)}/ปี
              </div>
              <div className="text-xs text-[var(--brand-text-secondary)]">Net Savings After Maintenance</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Detailed financial breakdown */}
      <Card>
        <CardHeader title="Detailed Financial Breakdown" />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-[var(--brand-text)] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[var(--brand-primary)]" />
                Costs
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-[var(--brand-border)]">
                  <span className="text-sm text-[var(--brand-text-secondary)]">Installation Cost</span>
                  <span className="text-sm font-medium text-[var(--brand-text)]">
                    {formatCurrency(result.financialAnalysis.installationCost)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--brand-border)]">
                  <span className="text-sm text-[var(--brand-text-secondary)]">Net Cost (after incentives)</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(result.financialAnalysis.netCost)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--brand-border)]">
                  <span className="text-sm text-[var(--brand-text-secondary)]">Cost per kWp</span>
                  <span className="text-sm font-medium text-[var(--brand-text)]">
                    {formatCurrency(result.financialAnalysis.installationCost / Math.max(result.panelConfig.capacityKw, 0.01))}
                  </span>
                </div>
                {annualMaintenance > 0 && (
                  <div className="flex justify-between py-2 border-b border-[var(--brand-border)]">
                    <span className="text-sm text-[var(--brand-text-secondary)] flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5" />
                      ค่าบำรุงรักษา/ปี
                    </span>
                    <span className="text-sm font-medium text-[var(--brand-text)]">
                      {formatCurrency(annualMaintenance)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-[var(--brand-text)] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Returns
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-[var(--brand-border)]">
                  <span className="text-sm text-[var(--brand-text-secondary)]">Monthly Savings</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(result.financialAnalysis.monthlySavings)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--brand-border)]">
                  <span className="text-sm text-[var(--brand-text-secondary)]">Yearly Savings</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(result.financialAnalysis.yearlySavings)}
                  </span>
                </div>
                {annualMaintenance > 0 && (
                  <div className="flex justify-between py-2 border-b border-[var(--brand-border)] bg-green-50/50">
                    <span className="text-sm font-medium text-[var(--brand-text)]">ผลประหยัดรวม (หลังหักค่าบำรุง)</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(netYearlySavings)}/ปี
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-[var(--brand-border)]">
                  <span className="text-sm text-[var(--brand-text-secondary)]">NPV (25-Year)</span>
                  <span className="text-sm font-medium text-[var(--brand-text)]">
                    {formatCurrency(result.financialAnalysis.npvThb)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--brand-border)]">
                  <span className="text-sm text-[var(--brand-text-secondary)]">IRR</span>
                  <span className="text-sm font-medium text-[var(--brand-text)]">
                    {result.financialAnalysis.irrPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}

function EquipmentTab({ result }: { result: SolarAnalysisAdvanced }) {
  return (
    <div className="space-y-6 transition-opacity duration-300">
      <PanelComparison
        panels={result.panelSpecs}
        systemSizeKw={result.panelConfig.capacityKw}
      />
    </div>
  )
}

function IncentivesTab({ result }: { result: SolarAnalysisAdvanced }) {
  return (
    <div className="space-y-6 transition-opacity duration-300">
      <LocalIncentives
        incentives={result.incentives}
        installationCost={result.financialAnalysis.installationCost}
      />
    </div>
  )
}

function DataExportTab({ result }: { result: SolarAnalysisAdvanced }) {
  return (
    <div className="space-y-6 transition-opacity duration-300">
      {/* Report Export */}
      <Card>
        <CardHeader title="Analysis Report" subtitle="ดาวน์โหลดหรือคัดลอกรายงาน" />
        <CardBody>
          <AnalysisReportExport result={result} />
        </CardBody>
      </Card>

      {/* GeoTIFF Downloads */}
      {result.dataLayers ? (
        <GeoTIFFDownload dataLayers={result.dataLayers} />
      ) : (
        <Card>
          <CardBody className="p-8 text-center text-[var(--brand-text-secondary)]">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No data layers available for download.</p>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

// ---- Tab Bar Component ----

function TabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}) {
  return (
    <div className="border-b border-[var(--brand-border)] overflow-x-auto">
      <nav className="flex -mb-px min-w-max" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-[var(--brand-primary)] text-[var(--brand-primary)]'
                : 'border-transparent text-[var(--brand-text-secondary)] hover:text-[var(--brand-text)] hover:border-[var(--brand-border)]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

// ---- Main Page ----

export default function AnalyzePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { addToast } = useToast()

  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [address, setAddress] = useState('')
  const [monthlyBill, setMonthlyBill] = useState('')
  const [selfConsumptionRate, setSelfConsumptionRate] = useState(0.7)
  const [netBillingRate, setNetBillingRate] = useState(2.2)
  const [result, setResult] = useState<SolarAnalysisAdvanced | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const analysisMutation = useSolarAnalysisAdvanced()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN)
    }
  }, [user, authLoading, router])

  const handleAnalyze = async () => {
    if (!latitude || !longitude || !monthlyBill) {
      addToast('error', 'Please fill in all required fields')
      return
    }

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    const bill = parseFloat(monthlyBill)

    if (isNaN(lat) || lat < -90 || lat > 90) {
      addToast('error', 'Invalid latitude (must be between -90 and 90)')
      return
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      addToast('error', 'Invalid longitude (must be between -180 and 180)')
      return
    }

    if (isNaN(bill) || bill <= 0) {
      addToast('error', 'Monthly bill must be a positive number')
      return
    }

    const sanitizedAddress = address
      ? address.replace(/[^\w\s,.\u0E00-\u0E7F-]/gi, '').trim()
      : undefined

    try {
      const response = await analysisMutation.mutateAsync({
        latitude: lat,
        longitude: lng,
        monthlyBill: bill,
        address: sanitizedAddress,
        selfConsumptionRate,
        netBillingRate,
      })
      setResult(response as unknown as SolarAnalysisAdvanced)
      setActiveTab('overview')
      addToast('success', 'Advanced solar analysis completed successfully!')
    } catch (error) {
      addToast('error', 'Failed to perform solar analysis. Please try again.')
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      addToast('error', 'Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6))
        setLongitude(position.coords.longitude.toFixed(6))
        addToast('success', 'Location retrieved successfully')
      },
      () => {
        addToast('error', 'Failed to get your location. Please enter manually.')
      }
    )
  }

  const useDefaultLocation = () => {
    setLatitude(DEFAULT_MAP_CENTER.lat.toString())
    setLongitude(DEFAULT_MAP_CENTER.lng.toString())
    setAddress('Bangkok, Thailand')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--brand-surface)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary)]" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const renderTabContent = () => {
    if (!result) return null
    switch (activeTab) {
      case 'overview':
        return <OverviewTab result={result} />
      case 'roof':
        return <RoofTab result={result} />
      case 'solar':
        return <SolarPotentialTab result={result} />
      case 'financial':
        return <FinancialTab result={result} monthlyBill={parseFloat(monthlyBill) || 0} />
      case 'equipment':
        return <EquipmentTab result={result} />
      case 'incentives':
        return <IncentivesTab result={result} />
      case 'data':
        return <DataExportTab result={result} />
      default:
        return <OverviewTab result={result} />
    }
  }

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-text)]">Solar Analysis</h1>
          <p className="text-[var(--brand-text-secondary)] mt-1">
            Comprehensive solar potential analysis with roof mapping, shade analysis, and financial projections
          </p>
        </div>

        {/* Input Form */}
        <Card>
          <CardHeader title="Location & Bill Information" />
          <CardBody>
            <div className="space-y-4">
              {/* Quick actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={useCurrentLocation}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Use My Location
                </Button>
                <Button variant="outline" size="sm" onClick={useDefaultLocation}>
                  Use Bangkok (Default)
                </Button>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Latitude"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g., 13.7563"
                  hint="Enter latitude (-90 to 90)"
                />
                <Input
                  label="Longitude"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g., 100.5018"
                  hint="Enter longitude (-180 to 180)"
                />
              </div>

              {/* Address */}
              <Input
                label="Address (Optional)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 123 Sukhumvit Rd, Bangkok"
              />

              {/* Monthly Bill */}
              <Input
                label="Monthly Electricity Bill (THB)"
                type="number"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(e.target.value)}
                placeholder="e.g., 5000"
                hint="Enter your average monthly electricity bill in Thai Baht"
              />
            </div>
          </CardBody>
        </Card>

        {/* Self-Consumption Slider */}
        <SelfConsumptionSlider
          value={selfConsumptionRate}
          onChange={setSelfConsumptionRate}
          netBillingRate={netBillingRate}
          onNetBillingRateChange={setNetBillingRate}
        />

        {/* Analyze Button */}
        <div>
          <Button
            onClick={handleAnalyze}
            isLoading={analysisMutation.isPending}
            size="lg"
          >
            <Sun className="w-5 h-5 mr-2" />
            Analyze Solar Potential
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Results Header with Export */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-bold text-[var(--brand-text)]">
                Analysis Results
              </h2>
              <AnalysisReportExport result={result} />
            </div>

            <Card className="overflow-hidden">
              <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
              <div className="p-6">
                {renderTabContent()}
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
