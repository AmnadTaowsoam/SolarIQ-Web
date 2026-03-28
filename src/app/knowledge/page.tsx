'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, Button, Input, Modal } from '@/components/ui'
import { AppLayout } from '@/components/layout'
import { useAuth } from '@/context'
import {
  useDocuments,
  useKnowledgeStats,
  useUploadDocument,
  useSearchKnowledge,
  useDeleteDocument,
} from '@/hooks/useKnowledge'

export default function KnowledgePage() {
  const { user } = useAuth()
  const t = useTranslations('knowledge')
  const { data: documentsData, isLoading: documentsLoading } = useDocuments()
  const { data: statsData, isLoading: statsLoading } = useKnowledgeStats()
  const uploadMutation = useUploadDocument()
  const searchMutation = useSearchKnowledge()
  const deleteMutation = useDeleteDocument()

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Record<string, unknown>[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    content: '',
    source: 'faq',
    title: '',
    metadata: '',
  })

  const documents = documentsData?.documents || []
  const stats = statsData || {
    total_documents: 0,
    total_chunks: 0,
    by_source: [],
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return
    }
    try {
      const result = await searchMutation.mutateAsync({
        query: searchQuery,
        top_k: 5,
        min_score: 0.5,
      })
      setSearchResults(result.results)
    } catch (err) {
      void err // handled by UI state;
    }
  }

  const handleUpload = async () => {
    if (!uploadForm.content.trim()) {
      alert(t('errors.contentRequired'))
      return
    }

    try {
      const metadata = uploadForm.metadata ? JSON.parse(uploadForm.metadata) : undefined
      await uploadMutation.mutateAsync({
        content: uploadForm.content,
        source: uploadForm.source,
        title: uploadForm.title || undefined,
        metadata,
      })
      setShowUploadModal(false)
      setUploadForm({ content: '', source: 'faq', title: '', metadata: '' })
      setSearchResults([])
    } catch (err) {
      void err // handled by UI state;
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm(t('messages.confirmDelete'))) {
      return
    }

    try {
      await deleteMutation.mutateAsync(docId)
    } catch (err) {
      void err // handled by UI state;
    }
  }

  return (
    <AppLayout user={user}>
      <div className="container mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('description')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">{t('stats.totalDocuments')}</div>
            <div className="text-3xl font-bold">{stats.total_documents}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">{t('stats.totalChunks')}</div>
            <div className="text-3xl font-bold">{stats.total_chunks}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm text-gray-600 mb-1">{t('stats.sources')}</div>
            <div className="text-3xl font-bold">{stats.by_source.length}</div>
          </Card>
        </div>

        {/* Search and Upload */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1">
            <Input
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} isLoading={searchMutation.isPending}>
            {t('search.button')}
          </Button>
          <Button variant="primary" onClick={() => setShowUploadModal(true)}>
            {t('upload.button')}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card className="mb-8 p-6">
            <h2 className="text-xl font-semibold mb-4">{t('search.results')}</h2>
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div key={`${result.doc_id}-${index}`} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">{result.title || result.source}</div>
                      <div className="text-sm text-gray-500">
                        {t('search.score')}: {(result.score * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{result.content}</p>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="mt-4" onClick={() => setSearchResults([])}>
              {t('search.clear')}
            </Button>
          </Card>
        )}

        {/* Documents Table */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t('documents.title')}</h2>
          {documentsLoading || statsLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">{t('documents.titleColumn')}</th>
                  <th className="text-left py-3 px-4">{t('documents.sourceColumn')}</th>
                  <th className="text-left py-3 px-4">{t('documents.chunksColumn')}</th>
                  <th className="text-left py-3 px-4">{t('documents.updatedColumn')}</th>
                  <th className="text-left py-3 px-4">{t('documents.actionsColumn')}</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.doc_id} className="border-b">
                    <td className="py-3 px-4">{doc.title || '-'}</td>
                    <td className="py-3 px-4">{doc.source}</td>
                    <td className="py-3 px-4">{doc.chunk_count}</td>
                    <td className="py-3 px-4">
                      {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString('th-TH') : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(doc.doc_id)}
                        isLoading={deleteMutation.isPending}
                      >
                        {t('documents.delete')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        {/* Upload Modal */}
        {showUploadModal && (
          <Modal
            title={t('upload.modalTitle')}
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('upload.sourceLabel')}</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={uploadForm.source}
                  onChange={(e) => setUploadForm({ ...uploadForm, source: e.target.value })}
                >
                  <option value="faq">FAQ</option>
                  <option value="product_specs">Product Specs</option>
                  <option value="rate_structures">Rate Structures</option>
                  <option value="blog">Blog</option>
                  <option value="policies">Policies</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('upload.titleLabel')}</label>
                <Input
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder={t('upload.titlePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('upload.contentLabel')}</label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg min-h-[200px]"
                  value={uploadForm.content}
                  onChange={(e) => setUploadForm({ ...uploadForm, content: e.target.value })}
                  placeholder={t('upload.contentPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('upload.metadataLabel')} ({t('upload.metadataOptional')})
                </label>
                <Input
                  value={uploadForm.metadata}
                  onChange={(e) => setUploadForm({ ...uploadForm, metadata: e.target.value })}
                  placeholder={t('upload.metadataPlaceholder')}
                />
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="ghost" onClick={() => setShowUploadModal(false)}>
                  {t('upload.cancel')}
                </Button>
                <Button onClick={handleUpload} isLoading={uploadMutation.isPending}>
                  {t('upload.submit')}
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppLayout>
  )
}
