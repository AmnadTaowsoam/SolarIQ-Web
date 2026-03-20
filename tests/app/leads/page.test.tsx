import { render, screen, fireEvent } from '@testing-library/react'
import LeadsPage from '@/app/leads/page'
import { useAuth } from '@/context'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { useLeads, useUpdateLeadStatus } from '@/hooks'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/leads'),
}))

jest.mock('@/context', () => ({
  useAuth: jest.fn(),
}))

jest.mock('@/components/ui/Toast', () => ({
  useToast: jest.fn(),
}))

jest.mock('@/hooks', () => ({
  useLeads: jest.fn(),
  useUpdateLeadStatus: jest.fn(),
}))

describe('LeadsPage', () => {
  const mockRouter = { replace: jest.fn(), push: jest.fn() }
  
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useToast as jest.Mock).mockReturnValue({ addToast: jest.fn() })
    ;(useLeads as jest.Mock).mockReturnValue({ data: { items: [], total: 0, totalPages: 1 }, isLoading: false })
    ;(useUpdateLeadStatus as jest.Mock).mockReturnValue({ mutateAsync: jest.fn() })
  })

  it('redirects to login if not authenticated', () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: null, isLoading: false })
    render(<LeadsPage />)
    expect(mockRouter.replace).toHaveBeenCalledWith('/login')
  })

  it('renders leads table', () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: { id: '1', role: 'user' }, isLoading: false })
    ;(useLeads as jest.Mock).mockReturnValue({
      data: {
        items: [{ id: '1', name: 'John Doe', phone: '123', email: 'j@d.com', address: 'BKK', monthlyBill: 5000, status: 'new', createdAt: new Date().toISOString() }],
        total: 1,
        totalPages: 1
      },
      isLoading: false
    })
    
    render(<LeadsPage />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
  })
})
