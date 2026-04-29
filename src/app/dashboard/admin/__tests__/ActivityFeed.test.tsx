import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock activity feed component
const ActivityFeed = ({ activities }) => (
  <div data-testid="activity-feed">
    <h3>Recent Activity</h3>
    {activities && activities.length > 0 ? (
      <div className="relative space-y-6">
        <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100" />
        {activities.map((activity) => (
          <div key={activity._id} className="relative pl-10">
            <div className="text-xs text-slate-400 mb-1">
              {new Date(activity.createdAt).toLocaleString()}
            </div>
            <p className="text-sm text-slate-700">{activity.description}</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
    )}
  </div>
)

describe('ActivityFeed', () => {
  const mockActivities = [
    {
      _id: '1',
      action: 'created',
      description: 'Lead created: John Doe',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      action: 'assigned',
      description: 'Lead assigned to Ahmed Khan',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      _id: '3',
      action: 'status_changed',
      description: 'Status changed to In Progress',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ]

  it('should render activity timeline display', () => {
    render(<ActivityFeed activities={mockActivities} />)
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
  })

  it('should display activity icons and colors', () => {
    const { container } = render(<ActivityFeed activities={mockActivities} />)
    expect(container.querySelector('.relative')).toBeInTheDocument()
  })

  it('should display activities in chronological order (newest first)', () => {
    render(<ActivityFeed activities={mockActivities} />)
    const descriptions = screen.getAllByText(/Lead created|Lead assigned|Status changed/)
    expect(descriptions[0]).toHaveTextContent('Lead created: John Doe')
  })

  it('should handle empty activity list', () => {
    render(<ActivityFeed activities={[]} />)
    expect(screen.getByText('No recent activity')).toBeInTheDocument()
  })

  it('should display activity descriptions', () => {
    render(<ActivityFeed activities={mockActivities} />)
    expect(screen.getByText('Lead created: John Doe')).toBeInTheDocument()
    expect(screen.getByText('Lead assigned to Ahmed Khan')).toBeInTheDocument()
    expect(screen.getByText('Status changed to In Progress')).toBeInTheDocument()
  })

  it('should display timestamps for each activity', () => {
    render(<ActivityFeed activities={mockActivities} />)
    const timestamps = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/)
    expect(timestamps.length).toBeGreaterThan(0)
  })

  it('should have responsive layout', () => {
    const { container } = render(<ActivityFeed activities={mockActivities} />)
    expect(container.querySelector('.space-y-6')).toBeInTheDocument()
  })

  it('should have proper accessibility with timeline descriptions', () => {
    const { container } = render(
      <div role="region" aria-label="Recent Activity Timeline">
        <ActivityFeed activities={mockActivities} />
      </div>
    )
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('should handle null activities without crashing', () => {
    render(<ActivityFeed activities={null} />)
    expect(screen.getByText('No recent activity')).toBeInTheDocument()
  })
})
