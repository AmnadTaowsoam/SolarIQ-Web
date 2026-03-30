export interface KPIValue {
  value: number
  previous?: number | null
  change?: number | null
  sparkline: number[]
}

export interface DashboardKPIs {
  revenue: KPIValue
  dealsWon: KPIValue
  conversionRate: KPIValue
  avgDealValue: KPIValue
  satisfaction: KPIValue
  responseTime: KPIValue
}

export interface Insight {
  id: string
  type: string
  title: string
  body: string
  severity: string
  data?: Record<string, unknown> | null
  actionable?: boolean
  action?: string | null
  created_at?: string
}

export interface DashboardResponse {
  kpis: DashboardKPIs
  topSources: { source: string; count: number; percentage: number }[]
  recentInsights: Insight[]
}

export interface FunnelStage {
  stage: string
  count: number
  conversionRate?: number | null
  value?: number | null
  avgDays?: number | null
}

export interface PipelineResponse {
  funnel: FunnelStage[]
  bottlenecks: { stage: string; issue: string; recommendation: string }[]
  forecast: { weighted: number; best: number; worst: number }
}

export interface LeadAnalyticsResponse {
  sources: { source: string; count: number; conversionRate: number; avgDealValue: number }[]
  quality: { grade: string; count: number; percentage: number }[]
  responseTime: { avg: number; median: number; distribution: Record<string, number> }
  timing: { heatmap: number[][] }
}

export interface RevenueTrendPoint {
  date: string
  total: number
  subscription: number
  commission: number
  leadFee: number
}

export interface RevenueAnalyticsResponse {
  trend: RevenueTrendPoint[]
  mrr: { current: number; previous: number; change: number }
  mrrWaterfall: {
    starting: number
    new: number
    expansion: number
    contraction: number
    churn: number
    ending: number
  }
  arpu: { value: number; trend: number[] }
  churnRate: { value: number; trend: number[] }
}

export interface MarketResponse {
  systemSize: { avg: number; distribution: Record<string, number>; trend: number[] }
  pricePerKwp: { avg: number; min: number; max: number; trend: number[] }
  popularBrands: {
    panels: { name: string; count: number }[]
    inverters: { name: string; count: number }[]
  }
  seasonalPattern: number[]
  roiBenchmarks: { region: string; avgRoi: number; avgPayback: number }[]
}

export interface ReportConfig {
  dataSources: string[]
  fields: { source: string; field: string; aggregation?: string; alias?: string }[]
  calculatedFields?: { name: string; expression: string }[]
  filters?: { field: string; operator: string; value: unknown }[]
  groupBy?: string[]
  sortBy?: { field: string; direction: 'asc' | 'desc' }[]
  visualization: 'table' | 'bar' | 'line' | 'pie' | 'summary'
  limit?: number
}

export interface CustomReport {
  id: string
  name: string
  description?: string | null
  category: string
  config: ReportConfig
  schedule?: Record<string, unknown> | null
  recipients?: string[] | null
  sharedWith?: string[] | null
  lastRunAt?: string | null
  lastRunStatus?: string | null
}

export interface Scorecard {
  contractorId: string
  periodYear: number
  periodMonth: number
  responseTimeScore: number
  conversionRateScore: number
  satisfactionScore: number
  cycleTimeScore: number
  activityScore: number
  overallScore: number
  grade: string
  rank?: number | null
  percentile?: number | null
  rawMetrics: Record<string, unknown>
  recommendations?: Record<string, unknown>[] | null
}
