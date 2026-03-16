import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/Badge'

describe('Badge', () => {
  it('renders children text', () => {
    render(<Badge>Active</Badge>)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('applies default variant', () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByText('Default')).toHaveClass('bg-gray-100')
  })

  it('applies success variant', () => {
    render(<Badge variant="success">Won</Badge>)
    expect(screen.getByText('Won')).toHaveClass('bg-green-100')
  })

  it('applies danger variant', () => {
    render(<Badge variant="danger">Lost</Badge>)
    expect(screen.getByText('Lost')).toHaveClass('bg-red-100')
  })

  it('applies size sm', () => {
    render(<Badge size="sm">Small</Badge>)
    expect(screen.getByText('Small')).toHaveClass('text-xs')
  })

  it('applies size lg', () => {
    render(<Badge size="lg">Large</Badge>)
    expect(screen.getByText('Large')).toHaveClass('text-base')
  })

  it('applies custom className', () => {
    render(<Badge className="ml-2">Custom</Badge>)
    expect(screen.getByText('Custom')).toHaveClass('ml-2')
  })
})
