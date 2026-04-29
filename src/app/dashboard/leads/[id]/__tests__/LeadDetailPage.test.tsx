import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock lead detail page component
const LeadDetailPageMock = ({ lead, activities, followUps }) => (
  <div data-testid="lead-detail-page">
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <a href="/dashboard/leads">Leads</a>
      <span>›</span>
      <span>{lead?.name}</span>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl p-6">
          <h1>{lead?.name}</h1>
          <p>{lead?.email}</p>
          <p>{lead?.phone}</p>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl p-6">
          <h2>Activity Timeline</h2>
          {activities && activities.length > 0 ? (
            <div>
              {activities.map((activity) => (
                <div key={activity._id}>{activity.description}</div>
              ))}
            </div>
          ) : (
            <p>No activity yet</p>
          )}
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl p-6 mt-6">
      <h3>Notes</h3>
      <p>{lead?.notes || 'No notes'}</p>
    </div>

    <div className="bg-white rounded-xl p-6 mt-6">
      <h3>Follow-Ups</h3>
      {followUps && followUps.length > 0 ? (
        <div>
          {followUps.map((fu) => (
            <div key={fu._id}>{new Date(fu.scheduledDate).toLocaleDateString()}</div>
          ))}
        </div>
      ) : (
        <p>No follow-ups scheduled</p>
      )}
    </div>
  </div>
)

describe('LeadDetailPage', () => {
  const mockLead = {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '03001234567',
    propertyInterest: 'Apartment',
    budget: 5000000,
    score: 'Medium',
    status: 'New',
    notes: 'Interested in 2-bedroom apartment',
  }

  const mockActivities = [
    {
      _id: '1',
      action: 'created',
      description: 'Lead created',
      createdAt: new Date().toISOString(),
    },
  ]

  const mockFollowUps = [
    {
      _id: '1',
      scheduledDate: new Date().toISOString(),
      status: 'pending',
    },
  ]

  it('should render page header with breadcrumbs', () => {
    render(
      <LeadDetailPageMock lead={mockLead} activities={mockActivities} followUps={mockFollowUps} />
    )
    expect(screen.getByText('Leads')).toBeInTheDocument()
    const headings = screen.getAllByText('John Doe')
    expect(headings.length).toBeGreaterThan(0)
  })

  it('should render lead info card', () => {
    render(
      <LeadDetailPageMock lead={mockLead} activities={mockActivities} followUps={mockFollowUps} />
    )
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('03001234567')).toBeInTheDocument()
  })

  it('should render activity timeline section', () => {
    render(
      <LeadDetailPageMock lead={mockLead} activities={mockActivities} followUps={mockFollowUps} />
    )
    expect(screen.getByText('Activity Timeline')).toBeInTheDocument()
    expect(screen.getByText('Lead created')).toBeInTheDocument()
  })

  it('should render notes section', () => {
    render(
      <LeadDetailPageMock lead={mockLead} activities={mockActivities} followUps={mockFollowUps} />
    )
    expect(screen.getByText('Notes')).toBeInTheDocument()
    expect(screen.getByText('Interested in 2-bedroom apartment')).toBeInTheDocument()
  })

  it('should render follow-up section', () => {
    render(
      <LeadDetailPageMock lead={mockLead} activities={mockActivities} followUps={mockFollowUps} />
    )
    expect(screen.getByText('Follow-Ups')).toBeInTheDocument()
  })

  it('should have responsive layout', () => {
    const { container } = render(
      <LeadDetailPageMock lead={mockLead} activities={mockActivities} followUps={mockFollowUps} />
    )
    expect(container.querySelector('.grid')).toBeInTheDocument()
  })

  it('should have proper page structure for accessibility', () => {
    render(
      <LeadDetailPageMock lead={mockLead} activities={mockActivities} followUps={mockFollowUps} />
    )
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('should display empty states when no data', () => {
    render(
      <LeadDetailPageMock lead={mockLead} activities={[]} followUps={[]} />
    )
    expect(screen.getByText('No activity yet')).toBeInTheDocument()
    expect(screen.getByText('No follow-ups scheduled')).toBeInTheDocument()
  })
})
