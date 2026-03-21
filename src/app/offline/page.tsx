'use client'
export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-4xl mb-4">📡</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">ไม่มีการเชื่อมต่อ</h1>
        <p className="text-gray-500 text-sm">กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg text-sm">
          ลองใหม่
        </button>
      </div>
    </div>
  )
}
