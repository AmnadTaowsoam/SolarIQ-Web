import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { InvoiceTable } from '@/components/billing/InvoiceTable'
import type { Invoice } from '@/types/billing'

// Mock dependencies
jest.mock('lucide-react', () => ({
  Download: () => <svg data-testid="download-icon" />,
  FileText: () => <svg data-testid="file-text-icon" />,
  ChevronLeft: () => <svg data-testid="chevron-left-icon" />,
  ChevronRight: () => <svg data-testid="chevron-right-icon" />,
}))

jest.mock('@/hooks/useBilling', () => ({
  useInvoices: () => ({
    data: null,
    isLoading: false,
  }),
}))

jest.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    organization_id: 'org-1',
    amount_thb: 7900,
    status: 'paid',
    invoice_number: 'INV-2024-001',
    invoice_pdf_url: 'https://example.com/inv-1.pdf',
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'inv-2',
    organization_id: 'org-1',
    amount_thb: 2900,
    status: 'open',
    invoice_number: 'INV-2024-002',
    created_at: '2024-02-15T00:00:00Z',
  },
  {
    id: 'inv-3',
    organization_id: 'org-1',
    amount_thb: 15000,
    status: 'void',
    invoice_number: 'INV-2024-003',
    created_at: '2024-03-15T00:00:00Z',
  },
]

describe('InvoiceTable', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders invoice rows', () => {
    render(<InvoiceTable invoices={mockInvoices} />, { wrapper: createWrapper() })

    expect(screen.getByText('INV-2024-001')).toBeInTheDocument()
    expect(screen.getByText('INV-2024-002')).toBeInTheDocument()
    expect(screen.getByText('INV-2024-003')).toBeInTheDocument()
  })

  it('shows correct status badges', () => {
    render(<InvoiceTable invoices={mockInvoices} />, { wrapper: createWrapper() })

    expect(screen.getByText('ชำระแล้ว')).toBeInTheDocument()
    expect(screen.getByText('รอชำระ')).toBeInTheDocument()
    expect(screen.getByText('ยกเลิก')).toBeInTheDocument()
  })

  it('renders download PDF link for invoices with pdf_url', () => {
    render(<InvoiceTable invoices={mockInvoices} />, { wrapper: createWrapper() })

    const pdfLink = screen.getByText('PDF').closest('a')
    expect(pdfLink).toHaveAttribute('href', 'https://example.com/inv-1.pdf')
    expect(pdfLink).toHaveAttribute('target', '_blank')
    expect(pdfLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('shows dash when no PDF URL', () => {
    render(<InvoiceTable invoices={mockInvoices} />, { wrapper: createWrapper() })

    // inv-2 and inv-3 have no pdf_url
    const dashes = screen.getAllByText('-')
    expect(dashes.length).toBe(2)
  })

  it('formats amounts in THB', () => {
    render(<InvoiceTable invoices={mockInvoices} />, { wrapper: createWrapper() })

    expect(screen.getByText(/7,900/)).toBeInTheDocument()
    expect(screen.getByText(/2,900/)).toBeInTheDocument()
    expect(screen.getByText(/15,000/)).toBeInTheDocument()
  })

  it('shows empty state when no invoices', () => {
    render(<InvoiceTable invoices={[]} />, { wrapper: createWrapper() })

    expect(screen.getByText('ยังไม่มีใบแจ้งหนี้')).toBeInTheDocument()
    expect(screen.getByText('ใบแจ้งหนี้จะปรากฏที่นี่เมื่อมีการเรียกเก็บเงิน')).toBeInTheDocument()
  })

  it('renders table headers', () => {
    render(<InvoiceTable invoices={mockInvoices} />, { wrapper: createWrapper() })

    expect(screen.getByText('เลขที่ใบแจ้งหนี้')).toBeInTheDocument()
    expect(screen.getByText('วันที่')).toBeInTheDocument()
    expect(screen.getByText('จำนวนเงิน (THB)')).toBeInTheDocument()
    expect(screen.getByText('สถานะ')).toBeInTheDocument()
    expect(screen.getByText('ดาวน์โหลด')).toBeInTheDocument()
  })
})
