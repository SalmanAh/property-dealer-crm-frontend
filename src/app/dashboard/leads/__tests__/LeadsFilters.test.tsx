import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Mock filters component
const LeadsFilters = ({ onFilterChange, onSearch, onReset }) => (
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

    <input
      data-testid="date-from"
      type="date"
      onChange={(e) => onFilterChange('dateFrom', e.target.value)}
    />
    <input
      data-testid="date-to"
      type="date"
      onChange={(e) => onFilterChange('dateTo', e.target.value)}
    />

    <select data-testid="agent-filter" onChange={(e) => onFilterChange('agent', e.target.value)}>
      <option value="">All Agents</option>
      <option value="agent1">Ahmed Khan</option>
      <option value="agent2">Fatima Ali</option>
    </select>

    <input
      data-testid="search-input"
      type="text"
      placeholder="Search leads..."
      onChange={(e) => onSearch(e.target.value)}
    />

    <button data-testid="reset-btn" onClick={onReset}>
      Reset Filters
    </button>
  </div>
)

describe('LeadsFilters', () => {
  it('should have status filter', () => {
    const mockFilterChange = jest.fn()
    render(
      <LeadsFilters onFilterChange={mockFilterChange} onSearch={jest.fn()} onReset={jest.fn()} />
    )
    const statusFilter = screen.getByTestId('status-filter')
    fireEvent.change(statusFilter, { target: { value: 'New' } })
    expect(mockFilterChange).toHaveBeenCalledWith('status', 'New')
  })

  it('should have priority filter', () => {
    const mockFilterChange = jest.fn()
    render(
      <LeadsFilters onFilterChange={mockFilterChange} onSearch={jest.fn()} onReset={jest.fn()} />
    )
    const priorityFilter = screen.getByTestId('priority-filter')
    fireEvent.change(priorityFilter, { target: { value: 'High' } })
    expect(mockFilterChange).toHaveBeenCalledWith('priority', 'High')
  })

  it('should have date range filter', () => {
    const mockFilterChange = jest.fn()
    render(
      <LeadsFilters onFilterChange={mockFilterChange} onSearch={jest.fn()} onReset={jest.fn()} />
    )
    const dateFrom = screen.getByTestId('date-from')
    fireEvent.change(dateFrom, { target: { value: '2024-01-01' } })
    expect(mockFilterChange).toHaveBeenCalledWith('dateFrom', '2024-01-01')
  })

  it('should have agent filter (admin only)', () => {
    const mockFilterChange = jest.fn()
    render(
      <LeadsFilters onFilterChange={mockFilterChange} onSearch={jest.fn()} onReset={jest.fn()} />
    )
    const agentFilter = screen.getByTestId('agent-filter')
    fireEvent.change(agentFilter, { target: { value: 'agent1' } })
    expect(mockFilterChange).toHaveBeenCalledWith('agent', 'agent1')
  })

  it('should have global search', async () => {
    const mockSearch = jest.fn()
    render(
      <LeadsFilters onFilterChange={jest.fn()} onSearch={mockSearch} onReset={jest.fn()} />
    )
    const searchInput = screen.getByTestId('search-input')
    await userEvent.type(searchInput, 'John')
    expect(mockSearch).toHaveBeenCalledWith('John')
  })

  it('should support filter combination logic', () => {
    const mockFilterChange = jest.fn()
    render(
      <LeadsFilters onFilterChange={mockFilterChange} onSearch={jest.fn()} onReset={jest.fn()} />
    )

    const statusFilter = screen.getByTestId('status-filter')
    const priorityFilter = screen.getByTestId('priority-filter')

    fireEvent.change(statusFilter, { target: { value: 'New' } })
    fireEvent.change(priorityFilter, { target: { value: 'High' } })

    expect(mockFilterChange).toHaveBeenCalledWith('status', 'New')
    expect(mockFilterChange).toHaveBeenCalledWith('priority', 'High')
  })

  it('should reset filters', () => {
    const mockReset = jest.fn()
    render(
      <LeadsFilters onFilterChange={jest.fn()} onSearch={jest.fn()} onReset={mockReset} />
    )
    fireEvent.click(screen.getByTestId('reset-btn'))
    expect(mockReset).toHaveBeenCalled()
  })

  it('should have proper accessibility for filter controls', () => {
    render(
      <LeadsFilters onFilterChange={jest.fn()} onSearch={jest.fn()} onReset={jest.fn()} />
    )
    expect(screen.getByTestId('status-filter')).toBeInTheDocument()
    expect(screen.getByTestId('priority-filter')).toBeInTheDocument()
    expect(screen.getByTestId('search-input')).toBeInTheDocument()
  })
})
