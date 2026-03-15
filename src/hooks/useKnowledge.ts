'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { API_ENDPOINTS, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/lib/constants'
import { KnowledgeDocument, ApiResponse } from '@/types'

export function useDocuments() {
  return useQuery({
    queryKey: ['knowledge-documents'],
    queryFn: () => api.get<KnowledgeDocument[]>(API_ENDPOINTS.KNOWLEDGE.LIST),
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['knowledge-document', id],
    queryFn: () => api.get<KnowledgeDocument>(API_ENDPOINTS.KNOWLEDGE.DETAIL(id)),
    enabled: !!id,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File size exceeds 10MB limit')
      }

      // Validate file type
      const allowedTypes = [...ALLOWED_FILE_TYPES.documents, ...ALLOWED_FILE_TYPES.images]
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not allowed')
      }

      return api.uploadFile<ApiResponse<KnowledgeDocument>>(
        API_ENDPOINTS.KNOWLEDGE.UPLOAD,
        file
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => api.delete(API_ENDPOINTS.KNOWLEDGE.DETAIL(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-documents'] })
    },
  })
}

export function useDocumentPreview(id: string) {
  return useQuery({
    queryKey: ['document-preview', id],
    queryFn: () => api.get(API_ENDPOINTS.KNOWLEDGE.PREVIEW(id)),
    enabled: !!id,
  })
}
