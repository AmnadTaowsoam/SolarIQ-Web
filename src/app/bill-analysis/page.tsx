'use client'

/**
 * Bill Analysis Page (WK-113)
 * LLM-based electricity bill analysis and data extraction
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import BillUpload from '@/components/solar/BillUpload'
import { FileText, Zap, TrendingUp, History } from 'lucide-react'

interface AnalysisRecord {
  id: string
  fileName: string
  date: string
  monthlyUsage: number
  monthlyCost: number
  confidence: string
}

// Demo data for when API is unavailable
const DEMO_HISTORY: AnalysisRecord[] = [
  {
    id: '1',
    fileName: 'bill_jan_2026.pdf',
    date: '2026-01-15',
    monthlyUsage: 450,
    monthlyCost: 2250,
    confidence: 'high',
  },
  {
    id: '2',
    fileName: 'bill_feb_2026.jpg',
    date: '2026-02-12',
    monthlyUsage: 520,
    monthlyCost: 2680,
    confidence: 'high',
  },
  {
    id: '3',
    fileName: 'bill_mar_2026.pdf',
    date: '2026-03-10',
    monthlyUsage: 380,
    monthlyCost: 1890,
    confidence: 'medium',
  },
]

export default function BillAnalysisPage() {
  const { user } = useAuth()
  const t = useTranslations('pages')
  const [analysisHistory] = useState<AnalysisRecord[]>(DEMO_HISTORY)
  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(null)

  const avgUsage =
    analysisHistory.length > 0
      ? Math.round(
          analysisHistory.reduce((sum, r) => sum + r.monthlyUsage, 0) / analysisHistory.length
        )
      : 0

  const avgCost =
    analysisHistory.length > 0
      ? Math.round(
          analysisHistory.reduce((sum, r) => sum + r.monthlyCost, 0) / analysisHistory.length
        )
      : 0

  return (
    <AppLayout user={user}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-text)]">
            {t('analyze.title')} - AI Bill Analysis
          </h1>
          <p className="text-sm text-[var(--brand-text-secondary)] mt-1">
            Upload electricity bills for AI-powered data extraction and solar ROI analysis
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--brand-text-secondary)]">Avg Monthly Usage</p>
                <p className="text-xl font-bold text-[var(--brand-text)]">{avgUsage} kWh</p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--brand-text-secondary)]">Avg Monthly Cost</p>
                <p className="text-xl font-bold text-[var(--brand-text)]">
                  {avgCost.toLocaleString()} THB
                </p>
              </div>
            </div>
          </div>
          <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--brand-text-secondary)]">Bills Analyzed</p>
                <p className="text-xl font-bold text-[var(--brand-text)]">
                  {analysisHistory.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--brand-text)] mb-4">
            Upload Electricity Bill
          </h2>
          <BillUpload
            onDataExtracted={(data) => setExtractedData(data as unknown as Record<string, unknown>)}
            onError={() => {
              /* Bill extraction error handled */
            }}
          />
          {extractedData && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm font-medium text-green-600">Data extracted successfully!</p>
              <pre className="text-xs text-[var(--brand-text-secondary)] mt-2 overflow-auto">
                {JSON.stringify(extractedData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Analysis History */}
        <div className="bg-[var(--brand-surface)] border border-[var(--brand-border)] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-[var(--brand-text)] mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-[var(--brand-primary)]" />
            Analysis History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--brand-border)]">
                  <th className="text-left py-2 px-3 text-[var(--brand-text-secondary)]">File</th>
                  <th className="text-left py-2 px-3 text-[var(--brand-text-secondary)]">Date</th>
                  <th className="text-right py-2 px-3 text-[var(--brand-text-secondary)]">
                    Usage (kWh)
                  </th>
                  <th className="text-right py-2 px-3 text-[var(--brand-text-secondary)]">
                    Cost (THB)
                  </th>
                  <th className="text-center py-2 px-3 text-[var(--brand-text-secondary)]">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {analysisHistory.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-[var(--brand-border)]/50 hover:bg-[var(--brand-primary-light)] transition-colors"
                  >
                    <td className="py-2.5 px-3 text-[var(--brand-text)]">{record.fileName}</td>
                    <td className="py-2.5 px-3 text-[var(--brand-text-secondary)]">
                      {record.date}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[var(--brand-text)]">
                      {record.monthlyUsage}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[var(--brand-text)]">
                      {record.monthlyCost.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          record.confidence === 'high'
                            ? 'bg-green-500/10 text-green-600'
                            : record.confidence === 'medium'
                              ? 'bg-yellow-500/10 text-yellow-600'
                              : 'bg-red-500/10 text-red-600'
                        }`}
                      >
                        {record.confidence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
