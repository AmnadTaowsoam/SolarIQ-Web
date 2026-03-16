'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context'
import { AppLayout } from '@/components/layout'
import { Card, CardBody, Button, Badge, Modal, ModalFooter } from '@/components/ui'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, EmptyState, TableSkeleton } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import { useDocuments, useUploadDocument, useDeleteDocument } from '@/hooks'
import { ROUTES } from '@/lib/constants'
import { KnowledgeDocument, DocumentStatus } from '@/types'
import { format } from 'date-fns'

const statusColors: Record<DocumentStatus, string> = {
  processing: 'bg-yellow-100 text-yellow-800',
  ready: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
}

const statusLabels: Record<DocumentStatus, string> = {
  processing: 'Processing',
  ready: 'Ready',
  error: 'Error',
}

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default function KnowledgePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { addToast } = useToast()

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<KnowledgeDocument | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: documents = [], isLoading } = useDocuments()
  const uploadMutation = useUploadDocument()
  const deleteMutation = useDeleteDocument()

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN)
    } else if (!authLoading && user && user.role !== 'admin') {
      addToast('error', 'You do not have permission to access this page')
      router.replace(ROUTES.DASHBOARD)
    }
  }, [user, authLoading, router, addToast])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      await uploadMutation.mutateAsync(selectedFile)
      addToast('success', 'Document uploaded successfully')
      setIsUploadModalOpen(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload document'
      addToast('error', errorMessage)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return

    try {
      await deleteMutation.mutateAsync(deleteConfirm.id)
      addToast('success', 'Document deleted successfully')
      setDeleteConfirm(null)
    } catch (error) {
      addToast('error', 'Failed to delete document')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <AppLayout user={user}>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-gray-500 mt-1">
              Manage documents for the RAG knowledge base
            </p>
          </div>
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Document
          </Button>
        </div>

        {/* Documents table */}
        <Card>
          <CardBody className="p-0">
            {isLoading ? (
              <TableSkeleton rows={5} columns={5} />
            ) : documents.length === 0 ? (
              <EmptyState
                title="No documents"
                description="Upload documents to build your knowledge base"
                icon={
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                action={
                  <Button onClick={() => setIsUploadModalOpen(true)}>
                    Upload First Document
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="font-medium">{doc.filename}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-500 uppercase">{doc.fileType}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatFileSize(doc.fileSize)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[doc.status]}>
                          {statusLabels[doc.status]}
                        </Badge>
                        {doc.status === 'error' && doc.errorMessage && (
                          <p className="text-xs text-red-600 mt-1">{doc.errorMessage}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{format(new Date(doc.uploadedAt), 'MMM dd, yyyy HH:mm')}</div>
                        {doc.chunkCount && (
                          <div className="text-xs text-gray-500">{doc.chunkCount} chunks</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteConfirm(doc)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardBody>
        </Card>

        {/* Upload Modal */}
        <Modal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false)
            setSelectedFile(null)
          }}
          title="Upload Document"
          description="Upload a PDF or DOCX file to add to the knowledge base"
        >
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  <span className="text-primary-600 hover:text-primary-700 font-medium">
                    Click to upload
                  </span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
              </label>
            </div>

            {selectedFile && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</span>
                </div>
              </div>
            )}
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              isLoading={uploadMutation.isPending}
              disabled={!selectedFile}
            >
              Upload
            </Button>
          </ModalFooter>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Delete Document"
          size="sm"
        >
          <p className="text-sm text-gray-500">
            Are you sure you want to delete <strong>{deleteConfirm?.filename}</strong>?
            This action cannot be undone.
          </p>
          <ModalFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
            >
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </AppLayout>
  )
}
