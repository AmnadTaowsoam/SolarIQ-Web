'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface DataSummary {
  name: string
  phone: string
  email: string
  address: string
  province: string
  analysis_count: number
  consent_count: number
}

export default function DataRightsPage(): React.ReactElement {
  const t = useTranslations('dataRightsPage')
  const router = useRouter()
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDataSummary = useCallback(async () => {
    try {
      const lineUserId = localStorage.getItem('line_user_id')
      if (!lineUserId) {
        router.push('/liff/login')
        return
      }
      const response = await fetch(`/api/liff/data-summary/${lineUserId}`)
      if (response.ok) {
        const data: DataSummary = await response.json()
        setDataSummary(data)
      } else {
        // Use placeholder data if endpoint not yet implemented
        setDataSummary({
          name: '-',
          phone: '-',
          email: '-',
          address: '-',
          province: '-',
          analysis_count: 0,
          consent_count: 0,
        })
      }
    } catch {
      setDataSummary({
        name: '-',
        phone: '-',
        email: '-',
        address: '-',
        province: '-',
        analysis_count: 0,
        consent_count: 0,
      })
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchDataSummary()
  }, [fetchDataSummary])

  const handleDownload = async () => {
    setIsDownloading(true)
    setError(null)
    try {
      const lineUserId = localStorage.getItem('line_user_id')
      const response = await fetch(`/api/v1/liff/data-export?line_user_id=${lineUserId}`)
      if (!response.ok) {
        throw new Error('ไม่สามารถดาวน์โหลดข้อมูลได้')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'my-data.json'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      const lineUserId = localStorage.getItem('line_user_id')
      const response = await fetch('/api/v1/liff/data-deletion-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ line_user_id: lineUserId }),
      })
      if (!response.ok) {
        throw new Error('ไม่สามารถส่งคำขอได้')
      }
      setDeleteSuccess(true)
      setShowDeleteModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 rounded hover:bg-green-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold">{t('title')}</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-4">
        {deleteSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-800 font-medium text-sm">{t('deleteSuccess')}</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Data summary card */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-4">{t('dataSummary.title')}</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex justify-between">
              <span className="text-gray-500">{t('dataSummary.name')}</span>
              <span className="font-medium">{dataSummary?.name ?? '-'}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">{t('dataSummary.phone')}</span>
              <span className="font-medium">{dataSummary?.phone ?? '-'}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">{t('dataSummary.email')}</span>
              <span className="font-medium">{dataSummary?.email ?? '-'}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">{t('dataSummary.address')}</span>
              <span className="font-medium">{dataSummary?.address ?? '-'}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">{t('dataSummary.province')}</span>
              <span className="font-medium">{dataSummary?.province ?? '-'}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">{t('dataSummary.analysisHistory')}</span>
              <span className="font-medium">{dataSummary?.analysis_count ?? 0} ครั้ง</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-500">{t('dataSummary.consentHistory')}</span>
              <span className="font-medium">{dataSummary?.consent_count ?? 0} รายการ</span>
            </li>
          </ul>
        </div>

        {/* Action buttons */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="text-base font-semibold text-gray-900 mb-3">{t('actions.title')}</h2>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            <span className="text-xl">⬇️</span>
            <span className="font-medium text-sm">
              {isDownloading ? t('actions.downloading') : t('actions.download')}
            </span>
          </button>

          <Link
            href="/liff/contact"
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
          >
            <span className="text-xl">✏️</span>
            <span className="font-medium text-sm">{t('actions.edit')}</span>
          </Link>

          <Link
            href="/liff/consent"
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
          >
            <span className="text-xl">🚫</span>
            <span className="font-medium text-sm">{t('actions.withdraw')}</span>
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={deleteSuccess}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <span className="text-xl">🗑️</span>
            <span className="font-medium text-sm">{t('actions.delete')}</span>
          </button>
        </div>

        {/* DPO contact */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-base font-semibold text-gray-900 mb-3">{t('dpoContact.title')}</h2>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="text-gray-500">{t('dpoContact.email')} </span>
              <a href="mailto:dpo@solariq.app" className="text-green-600 hover:underline">
                dpo@solariq.app
              </a>
            </p>
            <p>
              <span className="text-gray-500">{t('dpoContact.phone')} </span>
              <a href="tel:085-662-1113" className="text-green-600 hover:underline">
                085-662-1113
              </a>
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center pb-4">{t('pdpaReference')}</p>
      </main>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🗑️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{t('deleteModal.title')}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">{t('deleteModal.description')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
              >
                {t('deleteModal.cancel')}
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-lg bg-red-600 text-white font-medium text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? t('deleteModal.submitting') : t('deleteModal.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
