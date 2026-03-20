import { render, screen, fireEvent } from '@testing-library/react'
import GlobalError from '@/app/global-error'

describe('GlobalError page', () => {
  it('renders error message', () => {
    const error = new Error('Critical') as Error & { digest?: string }
    render(<GlobalError error={error} reset={jest.fn()} />)
    expect(screen.getByText('Application Error')).toBeInTheDocument()
  })

  it('shows error digest', () => {
    const error = Object.assign(new Error('Crash'), { digest: 'xyz789' })
    render(<GlobalError error={error} reset={jest.fn()} />)
    expect(screen.getByText('Error ID: xyz789')).toBeInTheDocument()
  })

  it('calls reset on button click', () => {
    const reset = jest.fn()
    const error = new Error('Test') as Error & { digest?: string }
    render(<GlobalError error={error} reset={reset} />)
    fireEvent.click(screen.getByText('Refresh Page'))
    expect(reset).toHaveBeenCalledTimes(1)
  })
})
