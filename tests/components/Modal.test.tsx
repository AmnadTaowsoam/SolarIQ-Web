import { render, screen, fireEvent } from '@testing-library/react'
import { Modal, ModalFooter } from '@/components/ui/Modal'

// Mock @headlessui/react to avoid transition complexity in tests
jest.mock('@headlessui/react', () => {
  const Fragment = ({ children }: { children: React.ReactNode }) => <>{children}</>
  return {
    Dialog: Object.assign(
      ({ children, onClose, className }: any) => (
        <div role="dialog" className={className} onClick={(e: any) => e.target === e.currentTarget && onClose()}>
          {children}
        </div>
      ),
      {
        Panel: ({ children, className }: any) => <div className={className}>{children}</div>,
        Title: ({ children, className, as: Tag = 'h3' }: any) => <Tag className={className}>{children}</Tag>,
        Description: ({ children, className }: any) => <p className={className}>{children}</p>,
      }
    ),
    Transition: Object.assign(
      ({ show, children }: any) => (show ? <>{children}</> : null),
      {
        Child: ({ children }: any) => <>{children}</>,
      }
    ),
  }
})

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    children: <p>Modal content</p>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when isOpen is true', () => {
    render(<Modal {...defaultProps} />)
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />)
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('renders title and description', () => {
    render(<Modal {...defaultProps} title="My Title" description="My Description" />)
    expect(screen.getByText('My Title')).toBeInTheDocument()
    expect(screen.getByText('My Description')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(<Modal {...defaultProps} title="Title" />)
    const closeBtn = screen.getByLabelText('Close modal')
    fireEvent.click(closeBtn)
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('calls onClose on Escape key', () => {
    render(<Modal {...defaultProps} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(defaultProps.onClose).toHaveBeenCalled()
  })
})

describe('ModalFooter', () => {
  it('renders children', () => {
    render(<ModalFooter><button>OK</button></ModalFooter>)
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument()
  })
})
