'use client'

import { useState, useEffect, Component, type ReactNode, type ErrorInfo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
  LiveWeatherYield,
  SevenDayForecast,
  AirQualityImpact,
  SmartAlerts,
  ClimateReliabilityScore,
  EnergyIndependenceScore,
  BillSimulator,
  FinancingCalculator,
  FeedbackButton,
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
  CloudSun,
  ShieldCheck,
} from 'lucide-react'
import {
  useLiveConditions,
  useWeatherForecast,
  useAirQuality,
  useDustSeason,
  useSmartAlerts as useSmartAlertsHook,
  useClimateScore,
} from '@/hooks'
import type {
  LiveConditions,
  WeatherHourly,
  WeatherDaily,
  AirQualityData,
  DustSeasonAnalysis,
  SmartAlertItem,
  ClimateReliabilityData,
  EnergyIndependenceData,
} from '@/types'

// ---- Helpers ----

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)

// ---- Tab definitions ----

type TabId =
  | 'overview'
  | 'roof'
  | 'solar'
  | 'financial'
  | 'equipment'
  | 'incentives'
  | 'data'
  | 'forecast'
  | 'reliability'

interface TabDef {
  id: TabId
  label: string
  icon: React.ReactNode
}

function buildTabs(t: ReturnType<typeof useTranslations<'analyzePage'>>): TabDef[] {
  return [
    { id: 'overview', label: t('tabs.overview'), icon: <Sun className="w-4 h-4" /> },
    { id: 'roof', label: t('tabs.roof'), icon: <Building className="w-4 h-4" /> },
    { id: 'solar', label: t('tabs.solar'), icon: <Zap className="w-4 h-4" /> },
    { id: 'financial', label: t('tabs.financial'), icon: <Wallet className="w-4 h-4" /> },
    { id: 'equipment', label: t('tabs.equipment'), icon: <Cpu className="w-4 h-4" /> },
    { id: 'incentives', label: t('tabs.incentives'), icon: <Gift className="w-4 h-4" /> },
    { id: 'data', label: t('tabs.data'), icon: <Database className="w-4 h-4" /> },
    { id: 'forecast', label: t('tabs.forecast'), icon: <CloudSun className="w-4 h-4" /> },
    { id: 'reliability', label: t('tabs.reliability'), icon: <ShieldCheck className="w-4 h-4" /> },
  ]
}

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
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  {'\u0E02\u0E19\u0E32\u0E14\u0E23\u0E30\u0E1A\u0E1A'}
                </div>
                <div className="text-xl font-bold text-[var(--brand-text)]">
                  {result.panelConfig.capacityKw.toFixed(2)} kWp
                </div>
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  {result.panelConfig.panelsCount} {'\u0E41\u0E1C\u0E07'}
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
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  {'\u0E1C\u0E25\u0E1C\u0E25\u0E34\u0E15\u0E15\u0E48\u0E2D\u0E1B\u0E35'}
                </div>
                <div className="text-xl font-bold text-[var(--brand-text)]">
                  {result.panelConfig.yearlyEnergyDcKwh.toLocaleString()} kWh
                </div>
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  {'\u0E15\u0E48\u0E2D\u0E1B\u0E35'}
                </div>
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
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  {'\u0E04\u0E37\u0E19\u0E17\u0E38\u0E19'}
                </div>
                <div className="text-xl font-bold text-[var(--brand-text)]">
                  {result.financialAnalysis.paybackYears.toFixed(1)} {'\u0E1B\u0E35'}
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
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  {'\u0E25\u0E14\u0E04\u0E32\u0E23\u0E4C\u0E1A\u0E2D\u0E19'}
                </div>
                <div className="text-xl font-bold text-[var(--brand-text)]">
                  {(
                    (result.panelConfig.yearlyEnergyDcKwh *
                      result.solarPotential.carbonOffsetFactorKgPerMwh) /
                    1000
                  ).toFixed(1)}{' '}
                  {'\u0E15\u0E31\u0E19'}
                </div>
                <div className="text-xs text-[var(--brand-text-secondary)]">
                  {'\u0E15\u0E48\u0E2D\u0E1B\u0E35'}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader title={'\u0E2A\u0E23\u0E38\u0E1B\u0E01\u0E32\u0E23\u0E40\u0E07\u0E34\u0E19'} />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-[var(--brand-text-secondary)]">
                {'\u0E04\u0E48\u0E32\u0E15\u0E34\u0E14\u0E15\u0E31\u0E49\u0E07'}
              </div>
              <div className="text-lg font-semibold text-[var(--brand-text)]">
                {formatCurrency(result.financialAnalysis.installationCost)}
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--brand-text-secondary)]">
                {'\u0E23\u0E32\u0E04\u0E32\u0E2A\u0E38\u0E17\u0E18\u0E34'}
              </div>
              <div className="text-lg font-semibold text-[var(--brand-text)]">
                {formatCurrency(result.financialAnalysis.netCost)}
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--brand-text-secondary)]">
                {
                  '\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14\u0E15\u0E48\u0E2D\u0E40\u0E14\u0E37\u0E2D\u0E19'
                }
              </div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(result.financialAnalysis.monthlySavings)}
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--brand-text-secondary)]">
                {'\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14\u0E15\u0E48\u0E2D\u0E1B\u0E35'}
              </div>
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
          <CardHeader
            title={
              '\u0E28\u0E31\u0E01\u0E22\u0E20\u0E32\u0E1E\u0E41\u0E2A\u0E07\u0E2D\u0E32\u0E17\u0E34\u0E15\u0E22\u0E4C'
            }
          />
          <CardBody>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">
                  {
                    '\u0E0A\u0E31\u0E48\u0E27\u0E42\u0E21\u0E07\u0E41\u0E2A\u0E07\u0E41\u0E14\u0E14\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14'
                  }
                </div>
                <div className="text-lg font-semibold text-[var(--brand-text)]">
                  {result.solarPotential.maxSunshineHoursPerYear.toLocaleString()} hrs/yr
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">
                  {'\u0E1E\u0E37\u0E49\u0E19\u0E17\u0E35\u0E48\u0E2B\u0E25\u0E31\u0E07\u0E04\u0E32'}
                </div>
                <div className="text-lg font-semibold text-[var(--brand-text)]">
                  {result.solarPotential.roofAreaM2.toFixed(0)} m&sup2;
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">
                  {'\u0E41\u0E1C\u0E07\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14'}
                </div>
                <div className="text-lg font-semibold text-[var(--brand-text)]">
                  {result.solarPotential.maxPanels}
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">
                  {'\u0E04\u0E38\u0E13\u0E20\u0E32\u0E1E\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25'}
                </div>
                <div className="text-lg font-semibold text-[var(--brand-primary)]">
                  {result.solarPotential.quality}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title={'\u0E17\u0E35\u0E48\u0E15\u0E31\u0E49\u0E07'} />
          <CardBody>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">
                  {'\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48'}
                </div>
                <div className="text-sm font-medium text-[var(--brand-text)]">{result.address}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-sm text-[var(--brand-text-secondary)]">
                    {'\u0E1E\u0E34\u0E01\u0E31\u0E14'}
                  </div>
                  <div className="text-sm font-medium text-[var(--brand-text)]">
                    {result.coordinates.latitude.toFixed(4)},{' '}
                    {result.coordinates.longitude.toFixed(4)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[var(--brand-text-secondary)]">
                    {'\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E04\u0E48\u0E32\u0E44\u0E1F'}
                  </div>
                  <div className="text-sm font-medium text-[var(--brand-text)]">
                    {'\u0E3F'}
                    {result.electricityRate.toFixed(2)}/kWh
                  </div>
                </div>
              </div>
              {result.solarPotential.imageryDate && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--brand-text-secondary)]">
                  <Calendar className="w-3.5 h-3.5" />
                  {'\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E16\u0E48\u0E32\u0E22\u0E20\u0E32\u0E1E'}
                  : {result.solarPotential.imageryDate}
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
      {(result.financialAnalysis.npvThb !== undefined ||
        result.financialAnalysis.irrPercent !== undefined) && (
        <Card>
          <CardHeader
            title={
              '\u0E15\u0E31\u0E27\u0E0A\u0E35\u0E49\u0E27\u0E31\u0E14\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E40\u0E07\u0E34\u0E19\u0E02\u0E31\u0E49\u0E19\u0E2A\u0E39\u0E07'
            }
          />
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">
                  NPV (25 {'\u0E1B\u0E35'})
                </div>
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
                <div className="text-sm text-[var(--brand-text-secondary)]">
                  ROI 25 {'\u0E1B\u0E35'}
                </div>
                <div className="text-lg font-semibold text-green-600">
                  {result.financialAnalysis.roi25Year.toFixed(1)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--brand-text-secondary)]">
                  {'\u0E04\u0E37\u0E19\u0E17\u0E38\u0E19'}
                </div>
                <div className="text-lg font-semibold text-blue-600">
                  {result.financialAnalysis.paybackYears.toFixed(1)} {'\u0E1B\u0E35'}
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
      {result.shadeAnalysis && <ShadeAnalysisChart shadeAnalysis={result.shadeAnalysis} />}
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
      {!result.shadeAnalysis &&
        (!result.hourlyIrradiance || result.hourlyIrradiance.length === 0) &&
        !result.dataLayers &&
        (!result.monthlyProduction || result.monthlyProduction.length === 0) && (
          <Card>
            <CardBody className="p-8 text-center text-[var(--brand-text-secondary)]">
              <Sun className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>
                {
                  '\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E28\u0E31\u0E01\u0E22\u0E20\u0E32\u0E1E\u0E41\u0E2A\u0E07\u0E2D\u0E32\u0E17\u0E34\u0E15\u0E22\u0E4C\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07\u0E19\u0E35\u0E49'
                }
              </p>
            </CardBody>
          </Card>
        )}
    </div>
  )
}

class TabErrorBoundary extends Component<
  { children: ReactNode; tabName: string },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; tabName: string }) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Error boundary caught a render error — displayed in fallback UI
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border-2 border-dashed border-red-200 bg-red-50 p-8 text-center">
          <svg
            className="mx-auto h-10 w-10 text-red-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <h3 className="text-sm font-semibold text-red-700 mb-1">
            Unable to load {this.props.tabName}
          </h3>
          <p className="text-xs text-red-500 mb-3">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-lg bg-red-100 px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function FinancialTab({
  result,
  monthlyBill,
}: {
  result: SolarAnalysisAdvanced
  monthlyBill: number
}) {
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
        <SystemSizeOptimizer options={result.systemOptions} currentBillThb={monthlyBill} />
      )}

      {/* Bill Simulator */}
      <BillSimulator
        monthlyBillThb={monthlyBill}
        monthlySavingsThb={result.financialAnalysis.monthlySavings}
        annualProductionKwh={result.panelConfig.yearlyEnergyDcKwh}
        electricityRate={result.electricityRate}
      />

      {/* Financing Calculator */}
      <FinancingCalculator
        systemCost={result.financialAnalysis.installationCost}
        annualSavings={result.financialAnalysis.yearlySavings}
      />

      {/* Self-Consumption & Maintenance Summary */}
      <Card>
        <CardHeader
          title={
            '\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E44\u0E1F\u0E41\u0E25\u0E30\u0E04\u0E48\u0E32\u0E1A\u0E33\u0E23\u0E38\u0E07\u0E23\u0E31\u0E01\u0E29\u0E32'
          }
          subtitle="Consumption & Maintenance"
        />
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-[var(--brand-text-secondary)]">
                {'\u0E2D\u0E31\u0E15\u0E23\u0E32\u0E43\u0E0A\u0E49\u0E40\u0E2D\u0E07'}
              </div>
              <div className="text-lg font-semibold text-[var(--brand-primary)]">
                {result.selfConsumptionRate
                  ? `${(result.selfConsumptionRate * 100).toFixed(0)}%`
                  : 'N/A'}
              </div>
              <div className="text-xs text-[var(--brand-text-secondary)]">
                Self-Consumption Rate
              </div>
            </div>
            <div>
              <div className="text-sm text-[var(--brand-text-secondary)]">
                {'\u0E23\u0E32\u0E04\u0E32\u0E02\u0E32\u0E22\u0E04\u0E37\u0E19'}
              </div>
              <div className="text-lg font-semibold text-[var(--brand-text)]">
                {result.netBillingRate ? `\u0E3F${result.netBillingRate.toFixed(1)}/kWh` : 'N/A'}
              </div>
              <div className="text-xs text-[var(--brand-text-secondary)]">Net Billing Rate</div>
            </div>
            <div>
              <div className="text-sm text-[var(--brand-text-secondary)]">
                {
                  '\u0E04\u0E48\u0E32\u0E1A\u0E33\u0E23\u0E38\u0E07\u0E23\u0E31\u0E01\u0E29\u0E32/\u0E1B\u0E35'
                }
              </div>
              <div className="text-lg font-semibold text-[var(--brand-text)]">
                {annualMaintenance > 0 ? formatCurrency(annualMaintenance) : 'N/A'}
              </div>
              <div className="text-xs text-[var(--brand-text-secondary)]">Annual Maintenance</div>
            </div>
            <div>
              <div className="text-sm text-[var(--brand-text-secondary)]">
                {
                  '\u0E1C\u0E25\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14\u0E23\u0E27\u0E21 (\u0E2B\u0E25\u0E31\u0E07\u0E2B\u0E31\u0E01\u0E04\u0E48\u0E32\u0E1A\u0E33\u0E23\u0E38\u0E07)'
                }
              </div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(netYearlySavings)}/{'\u0E1B\u0E35'}
              </div>
              <div className="text-xs text-[var(--brand-text-secondary)]">
                Net Savings After Maintenance
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Detailed financial breakdown */}
      <Card>
        <CardHeader
          title={
            '\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E17\u0E32\u0E07\u0E01\u0E32\u0E23\u0E40\u0E07\u0E34\u0E19'
          }
        />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-[var(--brand-text)] flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[var(--brand-primary)]" />
                {'\u0E15\u0E49\u0E19\u0E17\u0E38\u0E19'}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-[var(--brand-border)]">
                  <span className="text-sm text-[var(--brand-text-secondary)]">
                    {'\u0E04\u0E48\u0E32\u0E15\u0E34\u0E14\u0E15\u0E31\u0E49\u0E07'}
                  </span>
                  <span className="text-sm font-medium text-[var(--brand-text)]">
                    {formatCurrency(result.financialAnalysis.installationCost)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--brand-border)]">
                  <span className="text-sm text-[var(--brand-text-secondary)]">
                    {
                      '\u0E23\u0E32\u0E04\u0E32\u0E2A\u0E38\u0E17\u0E18\u0E34 (\u0E2B\u0E25\u0E31\u0E07\u0E2B\u0E31\u0E01\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E1B\u0E23\u0E30\u0E42\u0E22\u0E0A\u0E19\u0E4C)'
                    }
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(result.financialAnalysis.netCost)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--brand-border)]">
                  <span className="text-sm text-[var(--brand-text-secondary)]">
                    {'\u0E23\u0E32\u0E04\u0E32\u0E15\u0E48\u0E2D kWp'}
                  </span>
                  <span className="text-sm font-medium text-[var(--brand-text)]">
                    {formatCurrency(
                      result.financialAnalysis.installationCost /
                        Math.max(result.panelConfig.capacityKw, 0.01)
                    )}
                  </span>
                </div>
                {annualMaintenance > 0 && (
                  <div className="flex justify-between py-2 border-b border-[var(--brand-border)]">
                    <span className="text-sm text-[var(--brand-text-secondary)] flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5" />
                      {
                        '\u0E04\u0E48\u0E32\u0E1A\u0E33\u0E23\u0E38\u0E07\u0E23\u0E31\u0E01\u0E29\u0E32/\u0E1B\u0E35'
                      }
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
                {'\u0E1C\u0E25\u0E15\u0E2D\u0E1A\u0E41\u0E17\u0E19'}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-[var(--brand-border)]">
                  <span className="text-sm text-[var(--brand-text-secondary)]">
                    {
                      '\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14\u0E15\u0E48\u0E2D\u0E40\u0E14\u0E37\u0E2D\u0E19'
                    }
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(result.financialAnalysis.monthlySavings)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--brand-border)]">
                  <span className="text-sm text-[var(--brand-text-secondary)]">
                    {'\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14\u0E15\u0E48\u0E2D\u0E1B\u0E35'}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {formatCurrency(result.financialAnalysis.yearlySavings)}
                  </span>
                </div>
                {annualMaintenance > 0 && (
                  <div className="flex justify-between py-2 border-b border-[var(--brand-border)] bg-green-50/50">
                    <span className="text-sm font-medium text-[var(--brand-text)]">
                      {
                        '\u0E1C\u0E25\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14\u0E23\u0E27\u0E21 (\u0E2B\u0E25\u0E31\u0E07\u0E2B\u0E31\u0E01\u0E04\u0E48\u0E32\u0E1A\u0E33\u0E23\u0E38\u0E07)'
                      }
                    </span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(netYearlySavings)}/{'\u0E1B\u0E35'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-[var(--brand-border)]">
                  <span className="text-sm text-[var(--brand-text-secondary)]">
                    NPV (25 {'\u0E1B\u0E35'})
                  </span>
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
      <PanelComparison panels={result.panelSpecs} systemSizeKw={result.panelConfig.capacityKw} />
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
        <CardHeader
          title={
            '\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19\u0E01\u0E32\u0E23\u0E27\u0E34\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C'
          }
          subtitle={
            '\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14\u0E2B\u0E23\u0E37\u0E2D\u0E04\u0E31\u0E14\u0E25\u0E2D\u0E01\u0E23\u0E32\u0E22\u0E07\u0E32\u0E19'
          }
        />
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
            <p>
              {
                '\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E0A\u0E31\u0E49\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E14\u0E32\u0E27\u0E19\u0E4C\u0E42\u0E2B\u0E25\u0E14'
              }
            </p>
          </CardBody>
        </Card>
      )}
    </div>
  )
}

function ForecastTab({ result }: { result: SolarAnalysisAdvanced }) {
  const lat = result.coordinates.latitude
  const lng = result.coordinates.longitude
  const { data: liveData } = useLiveConditions(lat, lng)
  const { data: forecastData } = useWeatherForecast(lat, lng)
  const { data: airQualityData } = useAirQuality(lat, lng)
  const { data: dustSeasonData } = useDustSeason(lat, lng)
  const { data: alertsData } = useSmartAlertsHook(lat, lng)

  const liveConditions = (liveData as LiveConditions | undefined) ?? null
  const hourlyForecast = (forecastData as { hourly?: WeatherHourly[] } | undefined)?.hourly ?? []
  const dailyForecast = (forecastData as { daily?: WeatherDaily[] } | undefined)?.daily ?? []
  const totalPredicted7Day =
    (forecastData as { totalPredicted7Day?: number } | undefined)?.totalPredicted7Day ?? 0
  const totalIdeal7Day =
    (forecastData as { totalIdeal7Day?: number } | undefined)?.totalIdeal7Day ?? 0
  const airQuality = (airQualityData as AirQualityData | undefined) ?? null
  const dustSeason = (dustSeasonData as DustSeasonAnalysis | undefined) ?? null
  const alerts = (alertsData as SmartAlertItem[] | undefined) ?? []

  return (
    <div className="space-y-6 transition-opacity duration-300">
      <LiveWeatherYield liveConditions={liveConditions} hourlyForecast={hourlyForecast} />
      <SevenDayForecast
        daily={dailyForecast}
        totalPredicted7Day={totalPredicted7Day}
        totalIdeal7Day={totalIdeal7Day}
      />
      <AirQualityImpact airQuality={airQuality} dustSeason={dustSeason} />
      <SmartAlerts alerts={alerts} />
    </div>
  )
}

function ReliabilityTab({ result }: { result: SolarAnalysisAdvanced }) {
  const lat = result.coordinates.latitude
  const lng = result.coordinates.longitude
  const { data: climateData } = useClimateScore(lat, lng)

  const climateReliability = (climateData as ClimateReliabilityData | undefined) ?? null

  // Calculate energy independence from existing data
  const selfConsumption = result.selfConsumptionRate || 0.7
  const energyIndependence: EnergyIndependenceData = {
    score: Math.round(selfConsumption * 100),
    level:
      selfConsumption >= 0.9
        ? 'full'
        : selfConsumption >= 0.75
          ? 'almost'
          : selfConsumption >= 0.5
            ? 'transition'
            : 'start',
    solarSelfUsePercent: Math.round(selfConsumption * 100),
    gridImportPercent: Math.round((1 - selfConsumption) * 80),
    surplusExportPercent: Math.round((1 - selfConsumption) * 20),
    tips: [
      '\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E41\u0E1A\u0E15\u0E40\u0E15\u0E2D\u0E23\u0E35\u0E48\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E01\u0E31\u0E01\u0E40\u0E01\u0E47\u0E1A\u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E2A\u0E48\u0E27\u0E19\u0E40\u0E01\u0E34\u0E19',
      '\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E08\u0E33\u0E19\u0E27\u0E19\u0E41\u0E1C\u0E07\u0E42\u0E0B\u0E25\u0E32\u0E23\u0E4C\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E21\u0E32\u0E01\u0E02\u0E36\u0E49\u0E19',
      '\u0E22\u0E49\u0E32\u0E22\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E44\u0E1F\u0E2B\u0E19\u0E31\u0E01\u0E44\u0E1B\u0E0A\u0E48\u0E27\u0E07\u0E01\u0E25\u0E32\u0E07\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E21\u0E35\u0E41\u0E2A\u0E07\u0E41\u0E14\u0E14',
    ],
  }

  return (
    <div className="space-y-6 transition-opacity duration-300">
      <ClimateReliabilityScore data={climateReliability} />
      <EnergyIndependenceScore data={energyIndependence} />
    </div>
  )
}

// ---- Tab Bar Component ----

function TabBar({
  activeTab,
  onTabChange,
  tabs,
}: {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  tabs: TabDef[]
}) {
  return (
    <div className="border-b border-[var(--brand-border)] overflow-x-auto">
      <nav className="flex -mb-px min-w-max" role="tablist">
        {tabs.map((tab) => (
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
  const t = useTranslations('analyzePage')
  const tabs = buildTabs(t)

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
      addToast('error', t('messages.fillAllFields'))
      return
    }

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)
    const bill = parseFloat(monthlyBill)

    if (isNaN(lat) || lat < -90 || lat > 90) {
      addToast('error', t('messages.invalidLatitude'))
      return
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      addToast('error', t('messages.invalidLongitude'))
      return
    }

    if (isNaN(bill) || bill <= 0) {
      addToast('error', t('messages.invalidBill'))
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
      addToast('success', t('messages.analysisSuccess'))
    } catch {
      addToast('error', t('messages.analysisFailed'))
    }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      addToast('error', t('messages.geolocationNotSupported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6))
        setLongitude(position.coords.longitude.toFixed(6))
        addToast('success', t('messages.locationSuccess'))
      },
      () => {
        addToast('error', t('messages.locationFailed'))
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
    if (!result) {
      return null
    }
    switch (activeTab) {
      case 'overview':
        return <OverviewTab result={result} />
      case 'roof':
        return <RoofTab result={result} />
      case 'solar':
        return <SolarPotentialTab result={result} />
      case 'financial':
        return (
          <TabErrorBoundary tabName="Financial">
            <FinancialTab result={result} monthlyBill={parseFloat(monthlyBill) || 0} />
          </TabErrorBoundary>
        )
      case 'equipment':
        return <EquipmentTab result={result} />
      case 'incentives':
        return <IncentivesTab result={result} />
      case 'data':
        return <DataExportTab result={result} />
      case 'forecast':
        return (
          <TabErrorBoundary tabName="Forecast">
            <ForecastTab result={result} />
          </TabErrorBoundary>
        )
      case 'reliability':
        return <ReliabilityTab result={result} />
      default:
        return <OverviewTab result={result} />
    }
  }

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-text)]">{t('title')}</h1>
          <p className="text-[var(--brand-text-secondary)] mt-1">{t('subtitle')}</p>
        </div>

        {/* Input Form */}
        <Card>
          <CardHeader title={t('inputForm.title')} />
          <CardBody>
            <div className="space-y-4">
              {/* Quick actions */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={useCurrentLocation}>
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('inputForm.useCurrentLocation')}
                </Button>
                <Button variant="outline" size="sm" onClick={useDefaultLocation}>
                  {t('inputForm.useDefaultLocation')}
                </Button>
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t('inputForm.latitude')}
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g., 13.7563"
                  hint={t('inputForm.latitudeHint')}
                />
                <Input
                  label={t('inputForm.longitude')}
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g., 100.5018"
                  hint={t('inputForm.longitudeHint')}
                />
              </div>

              {/* Address */}
              <Input
                label={t('inputForm.address')}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('inputForm.addressPlaceholder')}
              />

              {/* Monthly Bill */}
              <Input
                label={t('inputForm.monthlyBill')}
                type="number"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(e.target.value)}
                placeholder="e.g., 5000"
                hint={t('inputForm.monthlyBillHint')}
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

        {/* Location Preview - shows when coordinates are entered */}
        {latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude)) && (
          <Card className="border-2 border-dashed border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/5">
            <CardHeader
              title={t('locationPreview.title')}
              subtitle={t('locationPreview.subtitle')}
            />
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Mini Map Preview */}
                <div className="rounded-lg overflow-hidden h-48 bg-gray-100">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/view?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&center=${latitude},${longitude}&zoom=18&maptype=satellite`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                  />
                </div>
                {/* Quick Info Cards */}
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-[var(--brand-surface)]">
                    <div className="text-xs text-[var(--brand-text-secondary)]">
                      {t('locationPreview.coordinates')}
                    </div>
                    <div className="text-sm font-medium text-[var(--brand-text)]">
                      {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--brand-surface)]">
                    <div className="text-xs text-[var(--brand-text-secondary)]">
                      {t('locationPreview.region')}
                    </div>
                    <div className="text-sm font-medium text-[var(--brand-text)]">
                      {parseFloat(latitude) > 15
                        ? t('locationPreview.regionNorth')
                        : parseFloat(latitude) > 13
                          ? t('locationPreview.regionCentral')
                          : t('locationPreview.regionSouth')}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--brand-surface)]">
                    <div className="text-xs text-[var(--brand-text-secondary)]">
                      {t('locationPreview.avgSolarPotential')}
                    </div>
                    <div className="text-sm font-medium text-[var(--brand-text)]">
                      {parseFloat(latitude) > 15
                        ? '1,700-1,800'
                        : parseFloat(latitude) > 13
                          ? '1,600-1,700'
                          : '1,500-1,600'}{' '}
                      {t('locationPreview.hoursPerYear')}
                    </div>
                  </div>
                </div>
                {/* Feature Highlights */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-[var(--brand-text-secondary)] mb-2">
                    {t('locationPreview.youWillReceive')}
                  </div>
                  {[
                    { icon: '\u{1F3E0}', text: t('locationPreview.roofPlan') },
                    { icon: '\u{1F4B0}', text: t('locationPreview.investment25yr') },
                    { icon: '\u{1F324}\uFE0F', text: t('locationPreview.forecast7day') },
                    { icon: '\u{1F32B}\uFE0F', text: t('locationPreview.pm25impact') },
                    { icon: '\u{1F4C8}', text: t('locationPreview.reliabilityIndex') },
                    { icon: '\u{1F3E6}', text: t('locationPreview.financingComparison') },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-[var(--brand-text)]"
                    >
                      <span>{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Analyze Button */}
        <div className="flex flex-col items-center gap-3">
          <Button
            onClick={handleAnalyze}
            isLoading={analysisMutation.isPending}
            size="lg"
            className="w-full md:w-auto px-12 py-4 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all"
          >
            <Sun className="w-5 h-5 mr-2" />
            {t('analyzeButton')}
          </Button>
          <p className="text-xs text-[var(--brand-text-secondary)]">{t('analyzeHint')}</p>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Results Header with Export */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-xl font-bold text-[var(--brand-text)]">{t('results.title')}</h2>
              <AnalysisReportExport result={result} />
              <button
                onClick={async () => {
                  try {
                    const { apiClient } = await import('@/lib/api')
                    await apiClient.post('/api/v1/leads', {
                      name: address || 'New Lead',
                      address: address,
                      latitude: result.coordinates.latitude,
                      longitude: result.coordinates.longitude,
                      monthly_bill: parseFloat(monthlyBill) || 0,
                      status: 'new',
                      notes: `Solar Analysis: ${result.panelConfig.capacityKw.toFixed(1)} kWp, Payback: ${result.financialAnalysis.paybackYears.toFixed(1)} years`,
                      solar_analysis: {
                        system_size_kw: result.panelConfig.capacityKw,
                        annual_production_kwh: result.panelConfig.yearlyEnergyDcKwh,
                        yearly_savings: result.financialAnalysis.yearlySavings,
                        payback_years: result.financialAnalysis.paybackYears,
                        installation_cost: result.financialAnalysis.installationCost,
                      },
                    })
                    addToast('Saved as Lead successfully!', 'success')
                  } catch {
                    addToast('Failed to save as Lead. Please try again.', 'error')
                  }
                }}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                + Save as Lead
              </button>
            </div>

            {/* Quick Summary Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {result.panelConfig.capacityKw.toFixed(1)} kWp
                </div>
                <div className="text-xs text-gray-600">
                  {'\u0E02\u0E19\u0E32\u0E14\u0E23\u0E30\u0E1A\u0E1A\u0E41\u0E19\u0E30\u0E19\u0E33'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(result.financialAnalysis.yearlySavings)}
                </div>
                <div className="text-xs text-gray-600">
                  {'\u0E1B\u0E23\u0E30\u0E2B\u0E22\u0E31\u0E14\u0E15\u0E48\u0E2D\u0E1B\u0E35'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {result.financialAnalysis.paybackYears.toFixed(1)} {'\u0E1B\u0E35'}
                </div>
                <div className="text-xs text-gray-600">
                  {'\u0E04\u0E37\u0E19\u0E17\u0E38\u0E19'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {(
                    (result.panelConfig.yearlyEnergyDcKwh *
                      result.solarPotential.carbonOffsetFactorKgPerMwh) /
                    1000
                  ).toFixed(1)}{' '}
                  {'\u0E15\u0E31\u0E19'}
                </div>
                <div className="text-xs text-gray-600">
                  CO{'\u2082'} {'\u0E25\u0E14\u0E44\u0E14\u0E49\u0E15\u0E48\u0E2D\u0E1B\u0E35'}
                </div>
              </div>
            </div>

            <Card className="overflow-hidden">
              <TabBar activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs} />
              <div className="p-6">{renderTabContent()}</div>
            </Card>
          </div>
        )}
      </div>
      {/* Floating Feedback Button */}
      {result && <FeedbackButton />}
    </AppLayout>
  )
}
