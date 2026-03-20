import { render, screen, fireEvent } from '@testing-library/react'
import KnowledgePage from '@/app/knowledge/page'
import { useAuth } from '@/context'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { useDocuments, useUploadDocument, useDeleteDocument } from '@/hooks'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/knowledge'),
}))

jest.mock('@/context', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/components/ui/Toast', () => ({
  useToast: jest.fn(),
}))

jest.mock('@/hooks', () => ({
  useDocuments: jest.fn(),
  useUploadDocument: jest.fn(),
  useDeleteDocument: jest.fn(),
}))

describe('KnowledgePage', () => {
  const mockRouter = { replace: jest.fn() }
  const mockAddToast = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useToast as jest.Mock).mockReturnValue({ addToast: mockAddToast })
    ;(useDocuments as jest.Mock).mockReturnValue({ data: [], isLoading: false })
    ;(useUploadDocument as jest.Mock).mockReturnValue({ mutateAsync: jest.fn() })
    ;(useDeleteDocument as jest.Mock).mockReturnValue({ mutateAsync: jest.fn() })
  })

  it('redirects non-admin users', () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: { id: '1', role: 'user' }, isLoading: false })
    render(<KnowledgePage />)
    expect(mockAddToast).toHaveBeenCalledWith('error', 'You do not have permission to access this page')
    expect(mockRouter.replace).toHaveBeenCalledWith('/dashboard')
  })

  it('renders correctly for admin users', () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: { id: '1', role: 'admin' }, isLoading: false })
    ;(useDocuments as jest.Mock).mockReturnValue({
      data: [{ id: '1', filename: 'test.pdf', fileType: 'pdf', fileSize: 1024, status: 'ready', uploadedAt: new Date().toISOString() }],
      isLoading: false
    })
    render(<KnowledgePage />)
    expect(screen.getAllByText('Knowledge Base')[0]).toBeInTheDocument()
    expect(screen.getByText('test.pdf')).toBeInTheDocument()
  })
})
