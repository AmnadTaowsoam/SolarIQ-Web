/**
 * LIFF App Layout
 * Provides LIFF context for all LIFF pages
 */

'use client'

import React from 'react'
import { LIFFProvider } from '../../context/LIFFContext'

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || ''

interface LIFFLayoutProps {
  children: React.ReactNode
}

export default function LIFFLayout({ children }: LIFFLayoutProps): React.ReactElement {
  if (!LIFF_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-xl font-bold text-red-600 mb-2">Configuration Error</h1>
          <p className="text-red-500">NEXT_PUBLIC_LIFF_ID is not configured</p>
        </div>
      </div>
    )
  }

  return (
    <LIFFProvider liffId={LIFF_ID}>
      <div className="liff-app min-h-screen bg-gray-50">
        {children}
      </div>
    </LIFFProvider>
  )
}
