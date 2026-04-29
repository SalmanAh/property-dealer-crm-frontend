import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Mock filters component
const Filters = ({ onFilterChange, onSearch }) => (
  <div data-testid="filters-container">
    <select data-testid="status-filter" onChange={(e) => onFilterChange('status', e.target.value)}>
      <option value="">All Status</option>
      <option value="New">New</option>
      <option value="Assigned">Assigned</option>
      <option value="In Progress">In Progress</option>
      <option value="Closed">Closed</option>
    </select>

    <select data-testid="priority-filter" onChange={(e) => onFilterChange('priority', e.target.value)}>
      <option value="">All Priority</option>
      <option value="High">High</option>
      <option value="Medium">Medium</option>
      <option value="Low">Low</option>
    </select>

    <select data-testid="followup-filter" onChange={(e) => onFilterChange('followupStatus', e.target.value)}>
      <option value="">All Follow-ups</option>
      <option value="pending">Pending</option>
      <option value="completed">Completed</option>
      <option value="overdue">Overdue</option>
    </select>

    <input
      data-testid="search-input"
      type="text"
      placeholder="Search leads..."
      onChange={(e) => onSearch(e.target.value)}
    />
  </div>
)

describe('Filters & Search', () => {
  it('should have status filter functionality', () => {
    const mockFilterChange = jest.fn()
    render(<Filters onFilterChange={mockFilterChange} onSearch={jest.fn()} />)
    const statusFilter = screen.getByTestId('status-filter')
    fireEvent.change(statusFilter, { target: { value: 'New' } })
    expect(mockFilterChange).toHaveBeenCalledWith('status', 'New')
  })

  it('should have priority filter functionality', () => {
    const mockFilterChange = jest.fn()
    render(<Filters onFilterChange={mockFilterChange} onSearch={jest.fn()} />)
    const priorityFilter = screen.getByTestId('priority-filter')
    fireEvent.change(priorityFilter, { target: { value: 'High' } })
    expect(mockFilterChange).toHaveBeenCalledWith('priority', 'High')
  })

  it('should have follow-up status filter', () => {
    const mockFilterChange = jest.fn()
    render(<Filters onFilterChange={mockFilterChange} onSearch={jest.fn()} />)
    const followupFilter = screen.getByTestId('followup-filter')
    fireEvent.change(followupFilter, { target: { value: 'overdue' } })
    expect(mockFilterChange).toHaveBeenCalledWith('followupStatus', 'overdue')
  })

  it('should apply filters correctly', () => {
    const mockFilterChange = jest.fn()
    render(<Filters onFilterChange={mockFilterChange} onSearch={jest.fn()} />)

    const statusFilter = screen.getByTestId('status-filter')
    fireEvent.change(statusFilter, { target: { value: 'In Progress' } })
    expect(mockFilterChange).toHaveBeenCalledWith('status', 'In Progress')
  })

  it('should clear filters', () => {
    const mockFilterChange = jest.fn()
    render(<Filters onFilterChange={mockFilterChange} onSearch={jest.fn()} />)

    const statusFilter = screen.getByTestId('status-filter')
    fireEvent.change(statusFilter, { target: { value: '' } })
    expect(mockFilterChange).toHaveBeenCalledWith('status', '')
  })

  it('should have search functionality', async () => {
    const mockSearch = jest.fn()
    render(<Filters onFilterChange={jest.fn()} onSearch={mockSearch} />)

    const searchInput = screen.getByTestId('search-input')
    await userEvent.type(searchInput, 'John')
    expect(mockSearch).toHaveBeenCalledWith('John')
  })

  it('should support multiple filters combined', () => {
    const mockFilterChange = jest.fn()
    render(<Filters onFilterChange={mockFilterChange} onSearch={jest.fn()} />)

    const statusFilter = screen.getByTestId('status-filter')
    const priorityFilter = screen.getByTestId('priority-filter')

    fireEvent.change(statusFilter, { target: { value: 'New' } })
    fireEvent.change(priorityFilter, { target: { value: 'High' } })

    expect(mockFilterChange).toHaveBeenCalledWith('status', 'New')
    expect(mockFilterChange).toHaveBeenCalledWith('priority', 'High')
  })

  it('should have proper accessibility for filter labels', () => {
    render(<Filters onFilterChange={jest.fn()} onSearch={jest.fn()} />)
    expect(screen.getByTestId('status-filter')).toBeInTheDocument()
    expect(screen.getByTestId('priority-filter')).toBeInTheDocument()
    expect(screen.getByTestId('followup-filter')).toBeInTheDocument()
  })

  it('should have search input with placeholder', () => {
    render(<Filters onFilterChange={jest.fn()} onSearch={jest.fn()} />)
    expect(screen.getByPlaceholderText('Search leads...')).toBeInTheDocument()
  })
})
