import { render, screen, fireEvent, act } from '@testing-library/react'
import { ToastProvider, useToast } from '@/components/ui/Toast'

// Mock uuid
jest.mock('uuid', () => ({ v4: () => 'test-uuid' }))

function TestComponent() {
  const { addToast } = useToast()
  return (
    <div>
      <button onClick={() => addToast('success', 'Saved!')}>Show Success</button>
      <button onClick={() => addToast('error', 'Failed!', 0)}>Show Error</button>
    </div>
  )
}

describe('Toast', () => {
  it('shows toast when triggered', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    fireEvent.click(screen.getByText('Show Success'))
    expect(screen.getByText('Saved!')).toBeInTheDocument()
  })

  it('shows error toast', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    fireEvent.click(screen.getByText('Show Error'))
    expect(screen.getByText('Failed!')).toBeInTheDocument()
  })

  it('removes toast when close button is clicked', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    fireEvent.click(screen.getByText('Show Error'))
    expect(screen.getByText('Failed!')).toBeInTheDocument()

    const closeBtn = screen.getByLabelText('Close notification')
    fireEvent.click(closeBtn)
    expect(screen.queryByText('Failed!')).not.toBeInTheDocument()
  })

  it('auto-dismisses toast after duration', () => {
    jest.useFakeTimers()
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )
    fireEvent.click(screen.getByText('Show Success'))
    expect(screen.getByText('Saved!')).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(5000)
    })
    expect(screen.queryByText('Saved!')).not.toBeInTheDocument()
    jest.useRealTimers()
  })

  it('throws error when useToast is used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    expect(() => render(<TestComponent />)).toThrow(
      'useToast must be used within a ToastProvider'
    )
    consoleSpy.mockRestore()
  })
})
