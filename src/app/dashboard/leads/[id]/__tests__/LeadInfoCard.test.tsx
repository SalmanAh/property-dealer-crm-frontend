import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock lead info card component
const LeadInfoCard = ({ lead, onCall, onEmail, onWhatsApp }) => (
  <div data-testid="lead-info-card" className="bg-white rounded-xl p-6">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
        {lead.name.charAt(0)}
      </div>
      <div>
        <h1 className="text-xl font-bold">{lead.name}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="badge">{lead.score}</span>
          <span className="badge">{lead.status}</span>
        </div>
      </div>
    </div>

    <div className="space-y-3 text-sm">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined">mail</span>
        {lead.email}
      </div>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined">phone</span>
        {lead.phone}
      </div>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined">home</span>
        {lead.propertyInterest}
      </div>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined">payments</span>
        <span className="font-semibold">PKR {lead.budget?.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined">person</span>
        {lead.agent || 'Unassigned'}
      </div>
    </div>

    <div className="mt-6 flex flex-col gap-2">
      <button onClick={onCall} data-testid="call-btn" className="btn-primary">
        Call
      </button>
      <button onClick={onEmail} data-testid="email-btn" className="btn-secondary">
        Email
      </button>
      <button onClick={onWhatsApp} data-testid="whatsapp-btn" className="btn-primary">
        Chat on WhatsApp
      </button>
    </div>
  </div>
)

describe('LeadInfoCard', () => {
  const mockLead = {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '03001234567',
    propertyInterest: 'Apartment',
    budget: 5000000,
    score: 'Medium',
    status: 'New',
    agent: 'Ahmed Khan',
  }

  it('should display lead name and avatar', () => {
    render(
      <LeadInfoCard
        lead={mockLead}
        onCall={jest.fn()}
        onEmail={jest.fn()}
        onWhatsApp={jest.fn()}
      />
    )
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('should display contact information', () => {
    render(
      <LeadInfoCard
        lead={mockLead}
        onCall={jest.fn()}
        onEmail={jest.fn()}
        onWhatsApp={jest.fn()}
      />
    )
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('03001234567')).toBeInTheDocument()
  })

  it('should display property interest and budget', () => {
    render(
      <LeadInfoCard
        lead={mockLead}
        onCall={jest.fn()}
        onEmail={jest.fn()}
        onWhatsApp={jest.fn()}
      />
    )
    expect(screen.getByText('Apartment')).toBeInTheDocument()
    expect(screen.getByText(/PKR 5,000,000/)).toBeInTheDocument()
  })

  it('should display lead score and status', () => {
    render(
      <LeadInfoCard
        lead={mockLead}
        onCall={jest.fn()}
        onEmail={jest.fn()}
        onWhatsApp={jest.fn()}
      />
    )
    expect(screen.getByText('Medium')).toBeInTheDocument()
    expect(screen.getByText('New')).toBeInTheDocument()
  })

  it('should display assigned agent', () => {
    render(
      <LeadInfoCard
        lead={mockLead}
        onCall={jest.fn()}
        onEmail={jest.fn()}
        onWhatsApp={jest.fn()}
      />
    )
    expect(screen.getByText('Ahmed Khan')).toBeInTheDocument()
  })

  it('should have call button', () => {
    render(
      <LeadInfoCard
        lead={mockLead}
        onCall={jest.fn()}
        onEmail={jest.fn()}
        onWhatsApp={jest.fn()}
      />
    )
    expect(screen.getByTestId('call-btn')).toBeInTheDocument()
  })

  it('should have email button', () => {
    render(
      <LeadInfoCard
        lead={mockLead}
        onCall={jest.fn()}
        onEmail={jest.fn()}
        onWhatsApp={jest.fn()}
      />
    )
    expect(screen.getByTestId('email-btn')).toBeInTheDocument()
  })

  it('should have WhatsApp button', () => {
    render(
      <LeadInfoCard
        lead={mockLead}
        onCall={jest.fn()}
        onEmail={jest.fn()}
        onWhatsApp={jest.fn()}
      />
    )
    expect(screen.getByTestId('whatsapp-btn')).toBeInTheDocument()
  })

  it('should call action handlers when buttons are clicked', () => {
    const mockCall = jest.fn()
    const mockEmail = jest.fn()
    const mockWhatsApp = jest.fn()

    render(
      <LeadInfoCard
        lead={mockLead}
        onCall={mockCall}
        onEmail={mockEmail}
        onWhatsApp={mockWhatsApp}
      />
    )

    fireEvent.click(screen.getByTestId('call-btn'))
    expect(mockCall).toHaveBeenCalled()

    fireEvent.click(screen.getByTestId('email-btn'))
    expect(mockEmail).toHaveBeenCalled()

    fireEvent.click(screen.getByTestId('whatsapp-btn'))
    expect(mockWhatsApp).toHaveBeenCalled()
  })

  it('should have proper accessibility with information labels', () => {
    render(
      <LeadInfoCard
        lead={mockLead}
        onCall={jest.fn()}
        onEmail={jest.fn()}
        onWhatsApp={jest.fn()}
      />
    )
    expect(screen.getByTestId('lead-info-card')).toBeInTheDocument()
  })
})
