import { render, screen, fireEvent } from '@testing-library/react'
import ErrorPage from '@/app/error'

describe('Error page', () => {
  it('renders error message', () => {
    const error = new Error('Test error') as Error & { digest?: string }
    render(<ErrorPage error={error} reset={jest.fn()} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('shows error digest when available', () => {
    const error = Object.assign(new Error('Test'), { digest: 'abc123' })
    render(<ErrorPage error={error} reset={jest.fn()} />)
    expect(screen.getByText('Error ID: abc123')).toBeInTheDocument()
  })

  it('calls reset when Try Again is clicked', () => {
    const reset = jest.fn()
    const error = new Error('Test') as Error & { digest?: string }
    render(<ErrorPage error={error} reset={reset} />)
    fireEvent.click(screen.getByText('Try Again'))
    expect(reset).toHaveBeenCalledTimes(1)
  })

  it('has link to dashboard', () => {
    const error = new Error('Test') as Error & { digest?: string }
    render(<ErrorPage error={error} reset={jest.fn()} />)
    expect(screen.getByText('Go to Dashboard')).toHaveAttribute('href', '/dashboard')
  })
})
