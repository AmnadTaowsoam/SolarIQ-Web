import { render, screen, fireEvent } from '@testing-library/react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
  TableSkeleton,
} from '@/components/ui/Table'

describe('Table', () => {
  it('renders a table with content', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>John</TableCell>
            <TableCell>john@test.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('John')).toBeInTheDocument()
  })

  it('applies clickable and selected styles to rows', () => {
    render(
      <Table>
        <TableBody>
          <TableRow isClickable isSelected data-testid="row">
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
    const row = screen.getByTestId('row')
    expect(row).toHaveClass('cursor-pointer')
    expect(row).toHaveClass('bg-primary-50')
  })

  it('renders sortable header with sort handler', () => {
    const onSort = jest.fn()
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sorted="asc" onSort={onSort}>
              Name
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )
    const th = screen.getByText('Name').closest('th')!
    fireEvent.click(th)
    expect(onSort).toHaveBeenCalledTimes(1)
  })

  it('renders unsorted and desc sort icons', () => {
    const { rerender } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sorted={null}>
              Col
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )
    expect(screen.getByText('Col')).toBeInTheDocument()

    rerender(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead sortable sorted="desc">
              Col
            </TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    )
    expect(screen.getByText('Col')).toBeInTheDocument()
  })
})

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState title="No data" description="Nothing here" />)
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('renders icon and action', () => {
    render(
      <EmptyState
        title="Empty"
        icon={<span data-testid="icon">I</span>}
        action={<button>Add</button>}
      />
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })
})

describe('TableSkeleton', () => {
  it('renders with default rows and columns', () => {
    const { container } = render(<TableSkeleton />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders with custom rows and columns', () => {
    const { container } = render(<TableSkeleton rows={3} columns={2} />)
    // 3 rows + 1 header skeleton
    const rows = container.querySelectorAll('.border-b')
    expect(rows).toHaveLength(3)
  })
})
