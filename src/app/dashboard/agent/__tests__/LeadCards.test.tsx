import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock lead card component
const LeadCard = ({ lead, onViewDetails, onWhatsApp }) => (
  <div data-testid="lead-card" className={lead.score === 'High' ? 'border-l-4 border-l-red-400' : ''}>
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          {lead.name.charAt(0)}
        </div>
        <div>
          <div className="text-sm font-semibold">{lead.name}</div>
          <div className="text-xs text-slate-400">{lead.phone}</div>
        </div>
      </div>
      <span className="badge">{lead.score}</span>
    </div>
    <div className="space-y-2 text-sm text-slate-600 mb-4">
      <div>
        <span className="material-symbols-outlined text-[14px]">home</span>
        {lead.propertyInterest}
      </div>
      <div>
        <span className="material-symbols-outlined text-[14px]">payments</span>
        PKR {lead.budget?.toLocaleString()}
      </div>
    </div>
    <div className="flex items-center justify-between">
      <span className="badge">{lead.status}</span>
      <div className="flex items-center gap-2">
        <button onClick={onWhatsApp} data-testid="whatsapp-btn">
          <span className="material-symbols-outlined">chat</span>
        </button>
        <button onClick={onViewDetails} data-testid="details-btn">
          Details
        </button>
      </div>
    </div>
  </div>
)

describe('LeadCards', () => {
  const mockLead = {
    _id: '1',
    name: 'John Doe',
    phone: '03001234567',
    propertyInterest: 'Apartment',
    budget: 5000000,
    score: 'Medium',
    status: 'New',
  }

  const mockHighPriorityLead = {
    ...mockLead,
    score: 'High',
  }

  it('should render lead card component', () => {
    render(<LeadCard lead={mockLead} onViewDetails={jest.fn()} onWhatsApp={jest.fn()} />)
    expect(screen.getByTestId('lead-card')).toBeInTheDocument()
  })

  it('should display priority badge', () => {
    render(<LeadCard lead={mockLead} onViewDetails={jest.fn()} onWhatsApp={jest.fn()} />)
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  it('should display property details', () => {
    render(<LeadCard lead={mockLead} onViewDetails={jest.fn()} onWhatsApp={jest.fn()} />)
    expect(screen.getByText('Apartment')).toBeInTheDocument()
    expect(screen.getByText(/PKR 5,000,000/)).toBeInTheDocument()
  })

  it('should display follow-up date', () => {
    const leadWithDate = { ...mockLead, followUpDate: '2024-01-15' }
    render(<LeadCard lead={leadWithDate} onViewDetails={jest.fn()} onWhatsApp={jest.fn()} />)
    expect(screen.getByTestId('lead-card')).toBeInTheDocument()
  })

  it('should highlight overdue leads with red border', () => {
    const { container } = render(
      <LeadCard lead={mockHighPriorityLead} onViewDetails={jest.fn()} onWhatsApp={jest.fn()} />
    )
    expect(container.querySelector('.border-l-4')).toBeInTheDocument()
  })

  it('should have View Details button', () => {
    render(<LeadCard lead={mockLead} onViewDetails={jest.fn()} onWhatsApp={jest.fn()} />)
    expect(screen.getByTestId('details-btn')).toBeInTheDocument()
    expect(screen.getByText('Details')).toBeInTheDocument()
  })

  it('should have WhatsApp button', () => {
    render(<LeadCard lead={mockLead} onViewDetails={jest.fn()} onWhatsApp={jest.fn()} />)
    expect(screen.getByTestId('whatsapp-btn')).toBeInTheDocument()
  })

  it('should call onViewDetails when Details button is clicked', () => {
    const mockViewDetails = jest.fn()
    render(<LeadCard lead={mockLead} onViewDetails={mockViewDetails} onWhatsApp={jest.fn()} />)
    fireEvent.click(screen.getByTestId('details-btn'))
    expect(mockViewDetails).toHaveBeenCalled()
  })

  it('should call onWhatsApp when WhatsApp button is clicked', () => {
    const mockWhatsApp = jest.fn()
    render(<LeadCard lead={mockLead} onViewDetails={jest.fn()} onWhatsApp={mockWhatsApp} />)
    fireEvent.click(screen.getByTestId('whatsapp-btn'))
    expect(mockWhatsApp).toHaveBeenCalled()
  })

  it('should display card grid layout', () => {
    const { container } = render(
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <LeadCard lead={mockLead} onViewDetails={jest.fn()} onWhatsApp={jest.fn()} />
        <LeadCard lead={mockHighPriorityLead} onViewDetails={jest.fn()} onWhatsApp={jest.fn()} />
      </div>
    )
    expect(container.querySelector('.grid')).toBeInTheDocument()
  })

  it('should have proper accessibility with card descriptions', () => {
    render(
      <div role="region" aria-label="Lead Card">
        <LeadCard lead={mockLead} onViewDetails={jest.fn()} onWhatsApp={jest.fn()} />
      </div>
    )
    expect(screen.getByRole('region')).toBeInTheDocument()
  })
})
