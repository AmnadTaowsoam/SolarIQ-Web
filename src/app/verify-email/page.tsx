'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type VerificationStatus = 'pending' | 'verifying' | 'success' | 'expired' | 'error'

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const [status, setStatus] = useState<VerificationStatus>('pending')
  const [countdown, setCountdown] = useState(60)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Handle direct verification with token
  useEffect(() => {
    if (token) {
      const doVerify = async () => {
        setStatus('verifying')
        setError(null)

        try {
          const response = await api.post<{
            success: boolean;
            message?: string;
            requires_onboarding?: boolean;
          }>('/signup/verify-email', {
            token,
          })

          if (response.success) {
            setStatus('success')
            setTimeout(() => {
              if (response.requires_onboarding) {
                router.push('/onboarding')
              } else {
                router.push('/dashboard')
              }
            }, 2000)
          } else {
            setStatus('error')
            setError(response.message || 'การยืนยันอีเมลล้มเหลว')
          }
        } catch (err) {
          setStatus('error')
          setError(
            err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการยืนยันอีเมล'
          )
        }
      }
      doVerify()
    }
  }, [token, router])

  // Countdown for polling
  useEffect(() => {
    if (status !== 'pending') { return }
    if (!email) { return }

    const checkStatus = async () => {
      try {
        const response = await api.get<{
          verified: boolean;
          requires_onboarding?: boolean;
        }>('/signup/verification-status', {
          email,
        })

        if (response.verified) {
          setStatus('success')
          setTimeout(() => {
            if (response.requires_onboarding) {
              router.push('/onboarding')
            } else {
              router.push('/dashboard')
            }
          }, 2000)
        }
      } catch {
        // Silently fail - user may not have verified yet
      }
    }

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          checkStatus()
          return 60
        }
        return prev - 1
      })
    }, 1000)

    return () => { clearInterval(interval) }
  }, [status, email, router])

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) { return }

    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)

    return () => { clearInterval(interval) }
  }, [resendCooldown])

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) { return }

    setError(null)

    try {
      const response = await api.post<{ success: boolean; message?: string }>(
        '/signup/resend-verification',
        { email }
      )

      if (response.success) {
        setResendCooldown(60) // 60 second cooldown
      } else {
        setError(response.message || 'การส่งอีเมลซ้ำล้มเหลว')
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งอีเมล'
      )
    }
  }

  const getStatusContent = () => {
    switch (status) {
      case 'verifying':
        return {
          icon: (
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          ),
          title: 'กำลังยืนยันอีเมล...',
          description: 'กรุณารอสักครู่',
        }
      case 'success':
        return {
          icon: (
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ),
          title: 'ยืนยันอีเมลสำเร็จ!',
          description: 'กำลังนำคุณไปยังหน้าถัดไป...',
        }
      case 'expired':
        return {
          icon: (
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          ),
          title: 'ลิงก์หมดอายุ',
          description: 'ลิงก์ยืนยันอีเมลหมดอายุแล้ว กรุณาขอลิงก์ใหม่',
        }
      case 'error':
        return {
          icon: (
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          ),
          title: 'เกิดข้อผิดพลาด',
          description: error || 'การยืนยันอีเมลล้มเหลว กรุณาลองใหม่อีกครั้ง',
        }
      case 'pending':
      default:
        return {
          icon: (
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          ),
          title: 'ตรวจสอบอีเมลของคุณ',
          description: email
            ? `เราได้ส่งลิงก์ยืนยันไปยัง ${email} กรุณาคลิกลิงก์เพื่อยืนยันอีเมลของคุณ`
            : 'เราได้ส่งลิงก์ยืนยันไปยังอีเมลของคุณ กรุณาคลิกลิงก์เพื่อยืนยัน',
        }
    }
  }

  const content = getStatusContent()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-blue-600">SolarIQ</h1>
          </Link>
        </div>

        <Card className="p-8 text-center">
          {/* Status Icon */}
          {content.icon}

          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {content.title}
          </h2>

          {/* Description */}
          <p className="text-gray-600 mb-6">{content.description}</p>

          {/* Error Message */}
          {error && status !== 'error' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Polling indicator for pending status */}
          {status === 'pending' && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">
                กำลังตรวจสอบสถานะใน {countdown} วินาที...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${(countdown / 60) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Resend button */}
          {(status === 'pending' || status === 'expired' || status === 'error') && email && (
            <div className="space-y-4">
              <Button
                onClick={handleResendEmail}
                disabled={resendCooldown > 0}
                variant="outline"
                className="w-full"
              >
                {resendCooldown > 0
                  ? `ส่งอีเมลซ้ำใน ${resendCooldown} วินาที`
                  : 'ส่งอีเมลยืนยันซ้ำ'}
              </Button>

              <p className="text-sm text-gray-500">
                ไม่ได้รับอีเมล? ตรวจสอบโฟลเดอร์ Spam หรือ{' '}
                <Link href="/signup" className="text-blue-600 hover:underline">
                  สมัครสมาชิกใหม่
                </Link>
              </p>
            </div>
          )}

          {/* Success redirect info */}
          {status === 'success' && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                ไม่ได้เปลี่ยนหน้าโดยอัตโนมัติ?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          )}
        </Card>

        {/* Help */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            ต้องการความช่วยเหลือ?{' '}
            <a
              href="mailto:support@solariq.th"
              className="text-blue-600 hover:underline"
            >
              ติดต่อ support@solariq.th
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
