import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock leads table component
const LeadsTable = ({ leads, onEdit, onDelete, onWhatsApp }) => (
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
      {leads.map((lead) => (
        <tr key={lead._id} className={lead.score === 'High' ? 'bg-red-50' : ''}>
          <td>{lead.name}</td>
          <td>PKR {lead.budget?.toLocaleString()}</td>
          <td>{lead.score}</td>
          <td>{lead.status}</td>
          <td>{lead.agent || 'Unassigned'}</td>
          <td>
            <button onClick={() => onEdit(lead._id)} data-testid={`edit-${lead._id}`}>
              Edit
            </button>
            <button onClick={() => onDelete(lead._id)} data-testid={`delete-${lead._id}`}>
              Delete
            </button>
            <button onClick={() => onWhatsApp(lead.phone)} data-testid={`whatsapp-${lead._id}`}>
              WhatsApp
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)

describe('LeadsTable', () => {
  const mockLeads = [
    {
      _id: '1',
      name: 'John Doe',
      budget: 5000000,
      score: 'Medium',
      status: 'New',
      agent: 'Ahmed Khan',
      phone: '03001234567',
    },
    {
      _id: '2',
      name: 'Jane Smith',
      budget: 15000000,
      score: 'High',
      status: 'Assigned',
      agent: 'Fatima Ali',
      phone: '03009876543',
    },
  ]

  it('should render table columns correctly', () => {
    render(
      <LeadsTable leads={mockLeads} onEdit={jest.fn()} onDelete={jest.fn()} onWhatsApp={jest.fn()} />
    )
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Budget')).toBeInTheDocument()
    expect(screen.getByText('Priority')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Agent')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('should highlight high priority rows', () => {
    const { container } = render(
      <LeadsTable leads={mockLeads} onEdit={jest.fn()} onDelete={jest.fn()} onWhatsApp={jest.fn()} />
    )
    const rows = container.querySelectorAll('tbody tr')
    expect(rows[1].classList.contains('bg-red-50')).toBe(true)
  })

  it('should display action buttons', () => {
    render(
      <LeadsTable leads={mockLeads} onEdit={jest.fn()} onDelete={jest.fn()} onWhatsApp={jest.fn()} />
    )
    expect(screen.getByTestId('edit-1')).toBeInTheDocument()
    expect(screen.getByTestId('delete-1')).toBeInTheDocument()
    expect(screen.getByTestId('whatsapp-1')).toBeInTheDocument()
  })

  it('should call onEdit when edit button is clicked', () => {
    const mockEdit = jest.fn()
    render(
      <LeadsTable leads={mockLeads} onEdit={mockEdit} onDelete={jest.fn()} onWhatsApp={jest.fn()} />
    )
    fireEvent.click(screen.getByTestId('edit-1'))
    expect(mockEdit).toHaveBeenCalledWith('1')
  })

  it('should call onDelete when delete button is clicked', () => {
    const mockDelete = jest.fn()
    render(
      <LeadsTable leads={mockLeads} onEdit={jest.fn()} onDelete={mockDelete} onWhatsApp={jest.fn()} />
    )
    fireEvent.click(screen.getByTestId('delete-1'))
    expect(mockDelete).toHaveBeenCalledWith('1')
  })

  it('should call onWhatsApp when WhatsApp button is clicked', () => {
    const mockWhatsApp = jest.fn()
    render(
      <LeadsTable leads={mockLeads} onEdit={jest.fn()} onDelete={jest.fn()} onWhatsApp={mockWhatsApp} />
    )
    fireEvent.click(screen.getByTestId('whatsapp-1'))
    expect(mockWhatsApp).toHaveBeenCalledWith('03001234567')
  })

  it('should display lead data correctly', () => {
    render(
      <LeadsTable leads={mockLeads} onEdit={jest.fn()} onDelete={jest.fn()} onWhatsApp={jest.fn()} />
    )
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText(/PKR 5,000,000/)).toBeInTheDocument()
  })

  it('should have proper table structure for accessibility', () => {
    const { container } = render(
      <LeadsTable leads={mockLeads} onEdit={jest.fn()} onDelete={jest.fn()} onWhatsApp={jest.fn()} />
    )
    expect(container.querySelector('table')).toBeInTheDocument()
    expect(container.querySelector('thead')).toBeInTheDocument()
    expect(container.querySelector('tbody')).toBeInTheDocument()
  })
})
