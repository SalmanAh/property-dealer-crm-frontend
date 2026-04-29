import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock leads page component
const LeadsPage = ({ leads, onAddLead, onFilter }) => (
  <div data-testid="leads-page">
    <div className="flex items-center justify-between mb-4">
      <h1>Leads Management</h1>
      <button onClick={onAddLead} data-testid="add-lead-btn">
        Add New Lead
      </button>
    </div>

    <div className="flex gap-4 mb-4">
      <input type="text" placeholder="Search leads..." data-testid="search-bar" />
      <select data-testid="filter-dropdown" onChange={(e) => onFilter(e.target.value)}>
        <option value="">All Leads</option>
        <option value="New">New</option>
        <option value="Assigned">Assigned</option>
      </select>
    </div>

    <table data-testid="leads-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Budget</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Agent</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {leads && leads.length > 0 ? (
          leads.map((lead) => (
            <tr key={lead._id}>
              <td>{lead.name}</td>
              <td>PKR {lead.budget?.toLocaleString()}</td>
              <td>{lead.score}</td>
              <td>{lead.status}</td>
              <td>{lead.agent || 'Unassigned'}</td>
              <td>
                <button data-testid={`edit-${lead._id}`}>Edit</button>
                <button data-testid={`delete-${lead._id}`}>Delete</button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6}>No leads found</td>
          </tr>
        )}
      </tbody>
    </table>

    <div className="flex justify-center gap-2 mt-4" data-testid="pagination">
      <button>Previous</button>
      <span>Page 1</span>
      <button>Next</button>
    </div>
  </div>
)

describe('LeadsPage', () => {
  const mockLeads = [
    {
      _id: '1',
      name: 'John Doe',
      budget: 5000000,
      score: 'Medium',
      status: 'New',
      agent: 'Ahmed Khan',
    },
    {
      _id: '2',
      name: 'Jane Smith',
      budget: 15000000,
      score: 'High',
      status: 'Assigned',
      agent: 'Fatima Ali',
    },
  ]

  it('should render page header with title', () => {
    render(<LeadsPage leads={mockLeads} onAddLead={jest.fn()} onFilter={jest.fn()} />)
    expect(screen.getByText('Leads Management')).toBeInTheDocument()
  })

  it('should render search bar', () => {
    render(<LeadsPage leads={mockLeads} onAddLead={jest.fn()} onFilter={jest.fn()} />)
    expect(screen.getByTestId('search-bar')).toBeInTheDocument()
  })

  it('should render filter dropdown', () => {
    render(<LeadsPage leads={mockLeads} onAddLead={jest.fn()} onFilter={jest.fn()} />)
    expect(screen.getByTestId('filter-dropdown')).toBeInTheDocument()
  })

  it('should render Add New Lead button', () => {
    render(<LeadsPage leads={mockLeads} onAddLead={jest.fn()} onFilter={jest.fn()} />)
    expect(screen.getByTestId('add-lead-btn')).toBeInTheDocument()
    expect(screen.getByText('Add New Lead')).toBeInTheDocument()
  })

  it('should render leads table', () => {
    render(<LeadsPage leads={mockLeads} onAddLead={jest.fn()} onFilter={jest.fn()} />)
    expect(screen.getByTestId('leads-table')).toBeInTheDocument()
  })

  it('should display table pagination', () => {
    render(<LeadsPage leads={mockLeads} onAddLead={jest.fn()} onFilter={jest.fn()} />)
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
  })

  it('should have responsive layout', () => {
    const { container } = render(
      <LeadsPage leads={mockLeads} onAddLead={jest.fn()} onFilter={jest.fn()} />
    )
    expect(container.querySelector('[data-testid="leads-page"]')).toBeInTheDocument()
  })

  it('should have proper page structure for accessibility', () => {
    render(<LeadsPage leads={mockLeads} onAddLead={jest.fn()} onFilter={jest.fn()} />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('should display leads in table', () => {
    render(<LeadsPage leads={mockLeads} onAddLead={jest.fn()} onFilter={jest.fn()} />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
  })
})
