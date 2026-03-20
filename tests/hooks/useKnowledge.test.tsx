import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useDocuments, useUploadDocument, useDeleteDocument } from '@/hooks/useKnowledge'
import { api } from '@/lib/api'

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    uploadFile: jest.fn(),
  },
}))

jest.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
}))

const mockApi = api as jest.Mocked<typeof api>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useDocuments', () => {
  beforeEach(() => jest.clearAllMocks())

  it('fetches documents', async () => {
    const mockDocs = [{ id: '1', filename: 'test.pdf', status: 'ready' }]
    mockApi.get.mockResolvedValueOnce(mockDocs)

    const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockDocs)
  })
})

describe('useUploadDocument', () => {
  beforeEach(() => jest.clearAllMocks())

  it('uploads a valid file', async () => {
    mockApi.uploadFile.mockResolvedValueOnce({ success: true })

    const { result } = renderHook(() => useUploadDocument(), { wrapper: createWrapper() })

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    Object.defineProperty(file, 'size', { value: 1024 })

    result.current.mutate(file)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })

  it('rejects files exceeding 10MB', async () => {
    const { result } = renderHook(() => useUploadDocument(), { wrapper: createWrapper() })

    const file = new File([''], 'big.pdf', { type: 'application/pdf' })
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 })

    result.current.mutate(file)

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toContain('10MB')
  })

  it('rejects disallowed file types', async () => {
    const { result } = renderHook(() => useUploadDocument(), { wrapper: createWrapper() })

    const file = new File([''], 'script.exe', { type: 'application/x-msdownload' })
    Object.defineProperty(file, 'size', { value: 1024 })

    result.current.mutate(file)

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toContain('not allowed')
  })
})

describe('useDeleteDocument', () => {
  beforeEach(() => jest.clearAllMocks())

  it('deletes a document', async () => {
    mockApi.delete.mockResolvedValueOnce({ success: true })

    const { result } = renderHook(() => useDeleteDocument(), { wrapper: createWrapper() })

    result.current.mutate('doc-1')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockApi.delete).toHaveBeenCalledWith('/api/v1/knowledge/documents/doc-1')
  })
})
