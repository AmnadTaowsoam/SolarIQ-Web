'use client'

/**
 * API Key Management page (WK-031)
 * Auth and AppLayout handled by developers/layout.tsx
 */

import { useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import { th } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useApiKeys } from '@/hooks/useDeveloperApi'
import type { ApiKey, ApiKeyCreateResult } from '@/hooks/useDeveloperApi'

const ALL_PERMISSIONS = [
  { id: 'leads:read', label: 'ลีด — อ่าน' },
  { id: 'leads:write', label: 'ลีด — เขียน' },
  { id: 'solar:analyze', label: 'วิเคราะห์โซลาร์' },
  { id: 'proposals:read', label: 'ใบเสนอราคา — อ่าน' },
  { id: 'proposals:write', label: 'ใบเสนอราคา — เขียน' },
  { id: 'deals:read', label: 'Deal — อ่าน' },
  { id: 'deals:write', label: 'Deal — เขียน' },
  { id: 'webhooks:manage', label: 'จัดการ Webhooks' },
]

// ============== Create Key Modal ==============

function CreateKeyModal({
  onClose,
  onCreate,
}: {
  onClose: () => void
  onCreate: (data: { name: string; environment: 'live' | 'test'; permissions: string[] }) => Promise<ApiKeyCreateResult>
}) {
  const [name, setName] = useState('')
  const [environment, setEnvironment] = useState<'live' | 'test'>('test')
  const [permissions, setPermissions] = useState<string[]>(['leads:read'])
  const [isCreating, setIsCreating] = useState(false)
  const [createdKey, setCreatedKey] = useState<ApiKeyCreateResult | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) return
    setIsCreating(true)
    try {
      const result = await onCreate({ name: name.trim(), environment, permissions })
      setCreatedKey(result)
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopy = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey.fullKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const togglePermission = (id: string) => {
    setPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">
            {createdKey ? 'API Key สร้างแล้ว' : 'สร้าง API Key ใหม่'}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5">
          {createdKey ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-green-800">Key สร้างสำเร็จ!</p>
                </div>
                <p className="text-xs text-green-700">
                  คัดลอก key ด้านล่างและเก็บไว้ในที่ปลอดภัย — <strong>จะแสดงครั้งเดียวเท่านั้น</strong>
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">API Key</p>
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                  <code className="flex-1 text-xs font-mono text-gray-800 break-all">{createdKey.fullKey}</code>
                  <button
                    onClick={handleCopy}
                    className={cn(
                      'flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                      copied ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    )}
                  >
                    {copied ? 'คัดลอกแล้ว!' : 'คัดลอก'}
                  </button>
                </div>
              </div>
              <button onClick={onClose} className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                เสร็จสิ้น
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อ Key</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น Production Key, Test Server"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Environment</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['test', 'live'] as const).map((env) => (
                    <button
                      key={env}
                      onClick={() => setEnvironment(env)}
                      className={cn(
                        'py-3 px-4 rounded-xl border-2 text-sm font-medium transition-colors',
                        environment === env
                          ? env === 'live' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center gap-2 justify-center">
                        <div className={cn('w-2 h-2 rounded-full', env === 'live' ? 'bg-orange-500' : 'bg-blue-500')} />
                        {env === 'live' ? 'Live' : 'Test'}
                      </div>
                      <div className="text-xs opacity-70 mt-0.5">{env === 'live' ? 'ข้อมูลจริง' : 'ข้อมูลทดสอบ'}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">สิทธิ์การเข้าถึง</label>
                <div className="space-y-2">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                          permissions.includes(perm.id) ? 'bg-orange-500 border-orange-500' : 'border-gray-300 group-hover:border-orange-400'
                        )}
                        onClick={() => togglePermission(perm.id)}
                      >
                        {permissions.includes(perm.id) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm text-gray-700" onClick={() => togglePermission(perm.id)}>{perm.label}</span>
                      <code className="text-xs text-gray-400 font-mono ml-auto">{perm.id}</code>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={onClose} className="flex-1 py-3 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                  ยกเลิก
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!name.trim() || permissions.length === 0 || isCreating}
                  className="flex-1 py-3 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCreating ? 'กำลังสร้าง...' : 'สร้าง Key'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ============== Revoke Confirm Modal ==============

function RevokeConfirmModal({ keyName, onConfirm, onCancel }: { keyName: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900 text-center mb-2">เพิกถอน API Key</h3>
        <p className="text-sm text-gray-600 text-center mb-6">
          คุณแน่ใจหรือไม่? Key <strong>"{keyName}"</strong> จะถูกเพิกถอนและไม่สามารถใช้งานได้อีก
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">ยกเลิก</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 transition-colors">เพิกถอน</button>
        </div>
      </div>
    </div>
  )
}

// ============== Main Page ==============

export default function ApiKeysPage() {
  const { keys, isLoading, isDemoMode, createKey, revokeKey } = useApiKeys()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (key: ApiKey) => {
    navigator.clipboard.writeText(key.keyMasked)
    setCopiedId(key.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRevoke = async () => {
    if (!revokeTarget) return
    await revokeKey(revokeTarget.id)
    setRevokeTarget(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">API Keys</h2>
          <p className="text-sm text-gray-500 mt-0.5">จัดการ keys สำหรับเข้าถึง SolarIQ API</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          สร้าง Key ใหม่
        </button>
      </div>

      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-amber-800">Demo Mode — แสดงข้อมูลตัวอย่าง</span>
        </div>
      )}

      {/* Keys table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="py-16 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
            <p className="text-sm text-gray-500">ยังไม่มี API Key</p>
            <button onClick={() => setShowCreateModal(true)} className="mt-3 text-sm text-orange-600 font-medium hover:text-orange-700">สร้าง Key แรก</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-gray-100">
                <tr>
                  {['ชื่อ', 'Key', 'สร้างเมื่อ', 'ใช้ล่าสุด', 'Calls', 'สถานะ', 'จัดการ'].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{key.name}</p>
                        <span className={cn(
                          'inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5',
                          key.environment === 'live' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        )}>
                          {key.environment === 'live' ? 'Live' : 'Test'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">{key.keyMasked}</code>
                        <button
                          onClick={() => handleCopy(key)}
                          className={cn('p-1.5 rounded-lg text-xs transition-colors', copiedId === key.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}
                          title="คัดลอก"
                        >
                          {copiedId === key.id ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {format(new Date(key.createdAt), 'd MMM', { locale: th })}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                      {key.lastUsedAt ? formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true, locale: th }) : 'ไม่เคยใช้'}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {key.callCount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full',
                        key.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      )}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', key.status === 'active' ? 'bg-green-500' : 'bg-red-500')} />
                        {key.status === 'active' ? 'ใช้งานได้' : 'เพิกถอนแล้ว'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {key.status === 'active' && (
                        <button
                          onClick={() => setRevokeTarget(key)}
                          className="text-xs font-medium text-red-600 hover:text-red-700 px-3 py-1.5 border border-red-200 hover:border-red-300 rounded-lg transition-colors"
                        >
                          เพิกถอน
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security note */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-blue-800">ความปลอดภัย</p>
          <p className="text-xs text-blue-700 mt-0.5">
            อย่าเปิดเผย API Key ในโค้ดสาธารณะ ใช้ environment variables เสมอ Key จะแสดงเต็มครั้งเดียวเมื่อสร้าง
          </p>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateKeyModal onClose={() => setShowCreateModal(false)} onCreate={createKey} />
      )}
      {revokeTarget && (
        <RevokeConfirmModal
          keyName={revokeTarget.name}
          onConfirm={handleRevoke}
          onCancel={() => setRevokeTarget(null)}
        />
      )}
    </div>
  )
}
