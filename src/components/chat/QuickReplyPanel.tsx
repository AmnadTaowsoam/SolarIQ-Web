/**
 * QuickReplyPanel component for SolarIQ Chat (WK-028)
 *
 * Panel for selecting and managing quick reply templates.
 */

'use client'

import React, { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { QuickReply, QuickReplyCategory, QuickReplyCreate, QuickReplyUpdate } from '@/types/chat'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

// ============== Types ==============

interface QuickReplyPanelProps {
  replies: QuickReply[]
  isLoading?: boolean
  onSelect: (reply: QuickReply) => void
  onCreate?: (data: QuickReplyCreate) => Promise<void>
  onUpdate?: (id: string, data: QuickReplyUpdate) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  className?: string
}

interface QuickReplyFormData {
  name: string
  content: string
  category: QuickReplyCategory
  variables?: string[]
}

// ============== Helper Functions ==============

function getCategoryColor(category: QuickReplyCategory): string {
  switch (category) {
    case QuickReplyCategory.GREETING:
      return 'bg-green-500/10 text-green-800'
    case QuickReplyCategory.PRICING:
      return 'bg-blue-500/10 text-blue-800'
    case QuickReplyCategory.SCHEDULING:
      return 'bg-purple-500/10 text-purple-800'
    case QuickReplyCategory.FOLLOW_UP:
      return 'bg-yellow-500/10 text-yellow-600'
    case QuickReplyCategory.CLOSING:
      return 'bg-red-100 text-red-400'
    case QuickReplyCategory.CUSTOM:
    default:
      return 'bg-[var(--brand-background)] text-[var(--brand-text)]'
  }
}

function getCategoryLabel(
  category: QuickReplyCategory,
  t: ReturnType<typeof useTranslations<'quickReply'>>
): string {
  switch (category) {
    case QuickReplyCategory.GREETING:
      return t('greet')
    case QuickReplyCategory.PRICING:
      return t('quote')
    case QuickReplyCategory.SCHEDULING:
      return t('followUp')
    case QuickReplyCategory.FOLLOW_UP:
      return t('followUp')
    case QuickReplyCategory.CLOSING:
      return t('confirm')
    case QuickReplyCategory.CUSTOM:
      return t('custom')
    default:
      return category
  }
}

function extractVariables(content: string): string[] {
  const regex = /\{\{(\w+)\}\}/g
  const variables: string[] = []
  let match

  while ((match = regex.exec(content)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1])
    }
  }

  return variables
}

function replaceVariables(content: string, variables: Record<string, string>): string {
  return content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match
  })
}

// ============== Sub-Components ==============

interface QuickReplyItemProps {
  reply: QuickReply
  onSelect: () => void
  onEdit?: () => void
  onDelete?: () => void
  t: ReturnType<typeof useTranslations<'quickReply'>>
}

function QuickReplyItem({ reply, onSelect, onEdit, onDelete, t }: QuickReplyItemProps) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      className="relative p-3 border border-[var(--brand-border)] rounded-lg hover:border-blue-300 hover:bg-blue-500/10 cursor-pointer transition-colors"
      onClick={onSelect}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-[var(--brand-text)] truncate">{reply.name}</span>
            <Badge className={getCategoryColor(reply.category)}>
              {getCategoryLabel(reply.category, t)}
            </Badge>
          </div>
          <p className="text-sm text-[var(--brand-text-secondary)] line-clamp-2">{reply.content}</p>
          {reply.usageCount > 0 && (
            <p className="text-xs text-[var(--brand-text-secondary)] mt-1">{reply.usageCount}x</p>
          )}
        </div>

        {/* Action buttons */}
        {showActions && (onEdit || onDelete) && (
          <div className="flex gap-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                className="p-1 text-[var(--brand-text-secondary)] hover:text-blue-500"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-1 text-[var(--brand-text-secondary)] hover:text-red-500"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface QuickReplyFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: QuickReplyFormData) => Promise<void>
  initialData?: QuickReply
  isLoading?: boolean
  t: ReturnType<typeof useTranslations<'quickReply'>>
}

function QuickReplyFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  t,
}: QuickReplyFormModalProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [category, setCategory] = useState<QuickReplyCategory>(
    initialData?.category || QuickReplyCategory.CUSTOM
  )
  const [detectedVariables, setDetectedVariables] = useState<string[]>(initialData?.variables || [])

  // Detect variables when content changes
  const handleContentChange = (value: string) => {
    setContent(value)
    setDetectedVariables(extractVariables(value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      name,
      content,
      category,
      variables: detectedVariables,
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? t('edit') : t('add')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
            {t('name')}
          </label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
            {t('category')}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as QuickReplyCategory)}
            className="w-full border border-[var(--brand-border)] rounded-md px-3 py-2"
          >
            {Object.values(QuickReplyCategory).map((cat) => (
              <option key={cat} value={cat}>
                {getCategoryLabel(cat, t)}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
            {t('message')}
          </label>
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={t('insertVariable')}
            rows={4}
            className="w-full border border-[var(--brand-border)] rounded-md px-3 py-2 resize-none"
            required
          />
        </div>

        {/* Detected variables */}
        {detectedVariables.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
              {t('insertVariable')}
            </label>
            <div className="flex flex-wrap gap-2">
              {detectedVariables.map((variable) => (
                <Badge key={variable} className="bg-blue-500/10 text-blue-800">
                  {variable}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={isLoading || !name || !content}>
            {isLoading ? t('save') : initialData ? t('save') : t('add')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

interface VariableInputModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (variables: Record<string, string>) => void
  reply: QuickReply
  t: ReturnType<typeof useTranslations<'quickReply'>>
}

function VariableInputModal({ isOpen, onClose, onSubmit, reply, t }: VariableInputModalProps) {
  const [values, setValues] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(values)
    onClose()
  }

  // Reset values when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {}
      reply.variables?.forEach((v) => {
        initial[v] = ''
      })
      setValues(initial)
    }
  }, [isOpen, reply.variables])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('insertVariable')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {reply.variables?.map((variable) => (
          <div key={variable}>
            <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
              {variable}
            </label>
            <Input
              value={values[variable] || ''}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  [variable]: e.target.value,
                }))
              }
              required
            />
          </div>
        ))}

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-[var(--brand-text)] mb-1">
            {t('preview')}
          </label>
          <div className="bg-[var(--brand-background)] rounded-md p-3 text-sm text-[var(--brand-text)]">
            {replaceVariables(reply.content, values)}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit">{t('use')}</Button>
        </div>
      </form>
    </Modal>
  )
}

// ============== Main Component ==============

export function QuickReplyPanel({
  replies,
  isLoading = false,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
  className,
}: QuickReplyPanelProps) {
  const t = useTranslations('quickReply')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<QuickReplyCategory | 'all'>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingReply, setEditingReply] = useState<QuickReply | null>(null)
  const [variableModalReply, setVariableModalReply] = useState<QuickReply | null>(null)

  // Filter replies
  const filteredReplies = useMemo(() => {
    return replies.filter((reply) => {
      // Category filter
      if (categoryFilter !== 'all' && reply.category !== categoryFilter) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          reply.name.toLowerCase().includes(query) || reply.content.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [replies, searchQuery, categoryFilter])

  // Handle reply selection
  const handleSelect = (reply: QuickReply) => {
    // If reply has variables, show variable input modal
    if (reply.variables && reply.variables.length > 0) {
      setVariableModalReply(reply)
    } else {
      onSelect(reply)
    }
  }

  // Handle variable submission
  const handleVariableSubmit = (variables: Record<string, string>) => {
    if (variableModalReply) {
      const processedReply: QuickReply = {
        ...variableModalReply,
        content: replaceVariables(variableModalReply.content, variables),
      }
      onSelect(processedReply)
    }
  }

  // Handle form submission
  const handleFormSubmit = async (data: QuickReplyFormData) => {
    if (editingReply && onUpdate) {
      await onUpdate(editingReply.id, data)
    } else if (onCreate) {
      await onCreate(data as QuickReplyCreate)
    }
    setEditingReply(null)
  }

  return (
    <div className={cn('flex flex-col h-full bg-[var(--brand-surface)]', className)}>
      {/* Header */}
      <div className="p-4 border-b border-[var(--brand-border)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[var(--brand-text)]">{t('title')}</h3>
          {onCreate && (
            <Button
              size="sm"
              onClick={() => {
                setEditingReply(null)
                setIsFormOpen(true)
              }}
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {t('add')}
            </Button>
          )}
        </div>

        {/* Search */}
        <Input
          type="search"
          placeholder={t('search')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />

        {/* Category filter */}
        <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryFilter('all')}
            className={cn(
              'px-3 py-1 text-xs rounded-full whitespace-nowrap',
              categoryFilter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-[var(--brand-background)] text-[var(--brand-text-secondary)] hover:bg-[var(--brand-border)]'
            )}
          >
            {t('selectCategory')}
          </button>
          {Object.values(QuickReplyCategory).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'px-3 py-1 text-xs rounded-full whitespace-nowrap',
                categoryFilter === cat
                  ? 'bg-blue-500 text-white'
                  : 'bg-[var(--brand-background)] text-[var(--brand-text-secondary)] hover:bg-[var(--brand-border)]'
              )}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Reply list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-[var(--brand-border)] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[var(--brand-border)] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredReplies.length === 0 ? (
          <div className="text-center py-8 text-[var(--brand-text-secondary)]">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-[var(--brand-text-secondary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p>{t('noReplies')}</p>
            {onCreate && (
              <Button size="sm" className="mt-3" onClick={() => setIsFormOpen(true)}>
                {t('addFirst')}
              </Button>
            )}
          </div>
        ) : (
          filteredReplies.map((reply) => (
            <QuickReplyItem
              key={reply.id}
              reply={reply}
              t={t}
              onSelect={() => handleSelect(reply)}
              onEdit={
                onUpdate
                  ? () => {
                      setEditingReply(reply)
                      setIsFormOpen(true)
                    }
                  : undefined
              }
              onDelete={
                onDelete
                  ? () => {
                      if (confirm(t('deleteConfirm'))) {
                        onDelete(reply.id)
                      }
                    }
                  : undefined
              }
            />
          ))
        )}
      </div>

      {/* Form modal */}
      <QuickReplyFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingReply(null)
        }}
        onSubmit={handleFormSubmit}
        initialData={editingReply || undefined}
        isLoading={isLoading}
        t={t}
      />

      {/* Variable input modal */}
      {variableModalReply && (
        <VariableInputModal
          isOpen={!!variableModalReply}
          onClose={() => setVariableModalReply(null)}
          onSubmit={handleVariableSubmit}
          reply={variableModalReply}
          t={t}
        />
      )}
    </div>
  )
}

export default QuickReplyPanel
