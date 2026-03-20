import { render, screen } from '@testing-library/react'
import NotFound from '@/app/not-found'

describe('NotFound page', () => {
  it('renders 404 heading', () => {
    render(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page not found')).toBeInTheDocument()
  })

  it('has link to dashboard', () => {
    render(<NotFound />)
    expect(screen.getByRole('link', { name: 'Go to Dashboard' })).toHaveAttribute('href', '/dashboard')
  })

  it('has link to home', () => {
    render(<NotFound />)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
  })
})
