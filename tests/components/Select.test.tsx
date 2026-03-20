import { render, screen } from '@testing-library/react'
import { Select } from '@/components/ui/Select'

const options = [
  { value: 'a', label: 'Option A' },
  { value: 'b', label: 'Option B' },
  { value: 'c', label: 'Option C', disabled: true },
]

describe('Select', () => {
  it('renders options', () => {
    render(<Select options={options} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('renders label', () => {
    render(<Select label="Status" options={options} />)
    expect(screen.getByLabelText('Status')).toBeInTheDocument()
  })

  it('renders placeholder option', () => {
    render(<Select options={options} placeholder="Choose..." />)
    expect(screen.getByText('Choose...')).toBeInTheDocument()
  })

  it('renders error message', () => {
    render(<Select options={options} label="Role" error="Required" />)
    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('renders hint when no error', () => {
    render(<Select options={options} label="Role" hint="Pick one" />)
    expect(screen.getByText('Pick one')).toBeInTheDocument()
  })

  it('does not render hint when error present', () => {
    render(<Select options={options} label="Role" error="Required" hint="Pick one" />)
    expect(screen.queryByText('Pick one')).not.toBeInTheDocument()
  })

  it('disables individual options', () => {
    render(<Select options={options} />)
    const disabledOption = screen.getByRole('option', { name: 'Option C' }) as HTMLOptionElement
    expect(disabledOption.disabled).toBe(true)
  })

  it('is disabled when disabled prop passed', () => {
    render(<Select options={options} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })
})
