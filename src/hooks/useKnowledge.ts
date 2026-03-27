'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Document {
  doc_id: string
  source: string
  title: string | null
  chunk_count: number
  created_at: string | null
  updated_at: string | null
}

export interface SearchResult {
  content: string
  metadata: Record<string, unknown>
  score: number
  doc_id: string
  chunk_id: string
  source: string
  title: string | null
}

export interface KnowledgeStats {
  total_documents: number
  total_chunks: number
  by_source: Array<{ source: string; document_count: number; chunk_count: number }>
}

export interface UploadDocumentRequest {
  content: string
  source: string
  title?: string
  metadata?: Record<string, unknown>
}

export interface SearchRequest {
  query: string
  source?: string
  top_k?: number
  min_score?: number
}

export function useDocuments(source?: string, limit = 100) {
  return useQuery({
    queryKey: ['knowledge-documents', source, limit],
    queryFn: () =>
      api.get<{ documents: Document[]; total: number }>('/api/v1/knowledge/documents', {
        params: source ? { source, limit } : { limit },
      }),
  })
}

export function useKnowledgeStats() {
  return useQuery({
    queryKey: ['knowledge-stats'],
    queryFn: () => api.get<KnowledgeStats>('/api/v1/knowledge/stats'),
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UploadDocumentRequest) =>
      api.post<{ doc_id: string; message: string }>('/api/v1/knowledge/upload', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-stats'] })
    },
  })
}

export function useSearchKnowledge() {
  return useMutation({
    mutationFn: (request: SearchRequest) =>
      api.post<{ results: SearchResult[]; total: number }>('/api/v1/knowledge/search', request),
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (docId: string) =>
      api.delete<{ message: string }>(`/api/v1/knowledge/documents/${docId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-stats'] })
    },
  })
}
