import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>)
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('CardHeader', () => {
  it('renders title and subtitle', () => {
    render(<CardHeader title="My Title" subtitle="My Subtitle" />)
    expect(screen.getByText('My Title')).toBeInTheDocument()
    expect(screen.getByText('My Subtitle')).toBeInTheDocument()
  })

  it('renders action element', () => {
    render(
      <CardHeader title="Title" action={<button>Action</button>} />
    )
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
  })

  it('renders children when no title/subtitle', () => {
    render(<CardHeader>Custom header content</CardHeader>)
    expect(screen.getByText('Custom header content')).toBeInTheDocument()
  })
})

describe('CardBody', () => {
  it('renders children', () => {
    render(<CardBody>Body content</CardBody>)
    expect(screen.getByText('Body content')).toBeInTheDocument()
  })
})

describe('CardFooter', () => {
  it('renders children', () => {
    render(<CardFooter>Footer content</CardFooter>)
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })
})
