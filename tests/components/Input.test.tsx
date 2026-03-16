import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<Input label="Email" error="Required field" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Required field')
  })

  it('sets aria-invalid when error exists', () => {
    render(<Input label="Email" error="Bad" />)
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('shows hint text when no error', () => {
    render(<Input label="Email" hint="Enter your email" />)
    expect(screen.getByText('Enter your email')).toBeInTheDocument()
  })

  it('hides hint when error is present', () => {
    render(<Input label="Email" hint="Enter your email" error="Required" />)
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument()
  })

  it('handles value changes', () => {
    const onChange = jest.fn()
    render(<Input label="Name" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'John' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('renders left and right icons', () => {
    render(
      <Input
        label="Search"
        leftIcon={<span data-testid="search-icon">S</span>}
        rightIcon={<span data-testid="clear-icon">X</span>}
      />
    )
    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    expect(screen.getByTestId('clear-icon')).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input label="Disabled" disabled />)
    expect(screen.getByLabelText('Disabled')).toBeDisabled()
  })
})
