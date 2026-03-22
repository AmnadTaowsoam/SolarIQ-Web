'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, ArrowRight, Mail, FileText, Sparkles } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Confetti CSS animation (pure CSS approach)                         */
/* ------------------------------------------------------------------ */
function ConfettiEffect() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        >
          <div
            className="h-2.5 w-2.5 rounded-sm"
            style={{
              backgroundColor: ['#f97316', '#22c55e', '#3b82f6', '#eab308', '#ec4899', '#8b5cf6'][
                Math.floor(Math.random() * 6)
              ],
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        </div>
      ))}

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('charge_id') ?? searchParams.get('session_id')
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4 py-16">
      {showConfetti && <ConfettiEffect />}

      <div className="w-full max-w-lg text-center">
        {/* Success icon with animation */}
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/30 animate-ping opacity-20" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-14 w-14 text-green-500 dark:text-green-400" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
          ชำระเงินสำเร็จ!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          ขอบคุณที่เลือกใช้ SolarIQ
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          บัญชีของคุณพร้อมใช้งานแล้ว
        </p>

        {/* Info cards */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 mb-8 text-left space-y-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 mt-0.5 text-primary-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                ใบเสร็จรับเงินส่งทาง Email
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                คุณจะได้รับใบเสร็จรับเงินอิเล็กทรอนิกส์ทาง Email ที่ลงทะเบียนไว้ภายในไม่กี่นาที
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 mt-0.5 text-primary-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                จัดการการสมัครสมาชิก
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                คุณสามารถจัดการแพ็กเกจ ดูใบเสร็จ และเปลี่ยนแพลนได้ที่หน้า Billing
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 mt-0.5 text-primary-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                เริ่มใช้งานฟีเจอร์ทั้งหมด
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ฟีเจอร์ทั้งหมดในแพ็กเกจของคุณพร้อมใช้งานทันที
              </p>
            </div>
          </div>
        </div>

        {/* Session ID */}
        {sessionId && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
            รหัสอ้างอิง: {sessionId.slice(0, 20)}...
          </p>
        )}

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-amber-500 px-8 py-4 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all"
          >
            เริ่มใช้งาน SolarIQ
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/billing"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 dark:border-gray-700 px-6 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            ดูรายละเอียดการสมัคร
          </Link>
        </div>
      </div>
    </div>
  )
}
