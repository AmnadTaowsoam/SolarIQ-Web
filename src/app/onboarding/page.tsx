'use client'
// WK-019: Self-Serve Onboarding — full implementation pending
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function OnboardingPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ยินดีต้อนรับสู่ SolarIQ</h1>
        <p className="text-gray-500 mb-6">ระบบ Onboarding กำลังพัฒนา — WK-019</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-colors"
        >
          ไปยัง Dashboard →
        </button>
      </div>
    </div>
  )
}
