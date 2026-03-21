'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, logout, firebaseUser } = useAuth()

  // Resolve email: from URL param, or from auth context
  const emailFromParam = searchParams.get('email') || ''
  const emailFromAuth = user?.email || firebaseUser?.email || ''
  const email = emailFromParam || emailFromAuth

  const token = searchParams.get('token') || ''

  type VerificationStatus = 'pending' | 'verifying' | 'success' | 'expired' | 'error'
  const [status, setStatus] = useState<VerificationStatus>('pending')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle direct verification with token in URL
  useEffect(() => {
    if (!token) return
    const doVerify = async () => {
      setStatus('verifying')
      setError(null)
      try {
        const response = await api.post<{
          success: boolean
          message?: string
          requires_onboarding?: boolean
        }>('/api/v1/auth/verify-email', { token })
        if (response.success) {
          setStatus('success')
          setTimeout(() => {
            router.push(response.requires_onboarding ? '/onboarding' : '/dashboard')
          }, 2000)
        } else {
          setStatus('error')
          setError(response.message || 'การยืนยันอีเมลล้มเหลว')
        }
      } catch {
        setStatus('error')
        setError('ลิงก์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุ')
      }
    }
    doVerify()
  }, [token, router])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown((v) => Math.max(0, v - 1)), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return
    setError(null)
    setResendSuccess(false)
    try {
      await api.post('/api/v1/auth/resend-verification', { email })
      setResendCooldown(60)
      setResendSuccess(true)
    } catch {
      setError('ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่')
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  // Verifying state
  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">กำลังยืนยันอีเมล...</h2>
          <p className="text-gray-500 text-sm mt-2">กรุณารอสักครู่</p>
        </div>
      </div>
    )
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">ยืนยันอีเมลสำเร็จ!</h2>
          <p className="text-gray-500 text-sm">กำลังนำคุณไปยังหน้าถัดไป...</p>
        </div>
      </div>
    )
  }

  // Main pending/error state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-bold text-orange-600">SolarIQ</span>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          {/* Envelope icon */}
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">กรุณายืนยันอีเมล</h1>

          {email ? (
            <p className="text-gray-600 text-sm mb-1">
              เราได้ส่งลิงก์ยืนยันไปยัง
            </p>
          ) : (
            <p className="text-gray-600 text-sm mb-4">
              เราได้ส่งลิงก์ยืนยันไปยังอีเมลของคุณ
            </p>
          )}
          {email && (
            <p className="text-orange-600 font-semibold text-sm mb-4 break-all">{email}</p>
          )}

          <p className="text-gray-500 text-xs mb-6">
            กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์ Spam) และคลิกลิงก์ยืนยัน
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {/* Resend success */}
          {resendSuccess && !error && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 mb-4">
              ส่งอีเมลยืนยันใหม่แล้ว กรุณาตรวจสอบกล่องจดหมาย
            </div>
          )}

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0 || !email}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {resendCooldown > 0 ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ส่งใหม่ได้ในอีก {resendCooldown} วินาที
              </span>
            ) : (
              'ส่งอีเมลยืนยันใหม่'
            )}
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full py-3 border border-gray-300 text-gray-600 rounded-2xl font-semibold text-sm transition-colors hover:bg-gray-50"
          >
            ออกจากระบบ
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          ต้องการความช่วยเหลือ?{' '}
          <a href="mailto:support@solariq.th" className="text-orange-500 hover:underline">
            support@solariq.th
          </a>
        </p>
      </div>
    </div>
  )
}
