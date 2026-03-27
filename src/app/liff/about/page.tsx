/**
 * LIFF About Page
 * Displays information about SolarIQ service
 */

'use client'

import React from 'react'
import { useLIFF, useLIFFUser } from '../../../context/LIFFContext'
import { closeWindow, openWindow } from '../../../lib/liff'
import { useTranslations } from 'next-intl'

export default function AboutPage(): React.ReactElement {
  const t = useTranslations('aboutPage')
  const { isInitialized, isLoading: liffLoading, error: liffError, isInLINE } = useLIFF()
  const user = useLIFFUser()

  const handleContactUs = async () => {
    if (isInLINE) {
      // In LINE app, open phone dialer
      await openWindow('tel:+66800000000', { external: true })
    } else {
      // In external browser, open LINE to add friend
      window.open('https://line.me/ti/p/@solariq', '_blank')
    }
  }

  const handleClose = async () => {
    await closeWindow()
  }

  // Loading state
  if (liffLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  // Error state
  if (liffError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-red-600 mb-2">{t('error')}</h1>
          <p className="text-red-500">{liffError.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 pb-16">
        <div className="text-center">
          <div className="text-5xl mb-3">☀️</div>
          <h1 className="text-2xl font-bold mb-1">SolarIQ</h1>
          <p className="text-green-100 text-sm">{t('subtitle')}</p>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 -mt-8">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">🎯 {t('title')}</h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">{t('description')}</p>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600">{t('features.locationAnalysis.icon')}</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 text-sm">
                  {t('features.locationAnalysis.title')}
                </h3>
                <p className="text-gray-500 text-xs">
                  {t('features.locationAnalysis.description')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <span className="text-yellow-600">{t('features.billScanning.icon')}</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 text-sm">
                  {t('features.billScanning.title')}
                </h3>
                <p className="text-gray-500 text-xs">{t('features.billScanning.description')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600">{t('features.roiCalculation.icon')}</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 text-sm">
                  {t('features.roiCalculation.title')}
                </h3>
                <p className="text-gray-500 text-xs">{t('features.roiCalculation.description')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600">{t('features.pdfQuote.icon')}</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 text-sm">
                  {t('features.pdfQuote.title')}
                </h3>
                <p className="text-gray-500 text-xs">{t('features.pdfQuote.description')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span className="text-green-600">{t('features.carbonFootprint.icon')}</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 text-sm">
                  {t('features.carbonFootprint.title')}
                </h3>
                <p className="text-gray-500 text-xs">{t('features.carbonFootprint.description')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">
            📊 {t('stats.title')}
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">1,200+</div>
              <div className="text-xs text-gray-500">{t('stats.analyses')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">500+</div>
              <div className="text-xs text-gray-500">{t('stats.installations')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">15M+</div>
              <div className="text-xs text-gray-500">{t('stats.savings')}</div>
            </div>
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">📞 {t('contact.title')}</h2>
          <div className="space-y-3">
            <button
              onClick={handleContactUs}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600">📱</span>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800 text-sm">{t('contact.call')}</div>
                <div className="text-gray-500 text-xs">02-000-0000</div>
              </div>
            </button>

            <a
              href="https://solariq.app"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600">🌐</span>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800 text-sm">{t('contact.website')}</div>
                <div className="text-gray-500 text-xs">solariq.app</div>
              </div>
            </a>

            <a
              href="mailto:contact@solariq.app"
              className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600">✉️</span>
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800 text-sm">{t('contact.email')}</div>
                <div className="text-gray-500 text-xs">contact@solariq.app</div>
              </div>
            </a>
          </div>
        </div>

        {/* Version */}
        <div className="text-center text-gray-400 text-xs mb-4">
          <p>{t('version')}</p>
          <p>{t('copyright')}</p>
        </div>

        {/* Close Button (only in LINE) */}
        {isInLINE && (
          <button
            onClick={handleClose}
            className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium mb-4"
          >
            {t('close')}
          </button>
        )}
      </main>

      {/* User info */}
      {user && (
        <div className="fixed top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow text-xs text-gray-600">
          {user.displayName}
        </div>
      )}
    </div>
  )
}
