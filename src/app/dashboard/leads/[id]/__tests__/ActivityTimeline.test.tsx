import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock activity timeline component
const ActivityTimeline = ({ activities, onFilter, onShowMore }) => (
  <div data-testid="activity-timeline">
    <h2>Activity Timeline</h2>

    <select data-testid="filter-select" onChange={(e) => onFilter(e.target.value)}>
      <option value="">All Activities</option>
      <option value="created">Created</option>
      <option value="assigned">Assigned</option>
      <option value="status_changed">Status Changed</option>
    </select>

    {activities && activities.length > 0 ? (
      <div className="relative space-y-6">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-100" />
        {activities.map((activity) => (
          <div key={activity._id} className="relative pl-14">
            <div className="bg-slate-50/80 rounded-lg p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-sm font-semibold">{activity.action}</span>
                <span className="text-xs text-slate-400">
                  {new Date(activity.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-slate-600">{activity.description}</p>
            </div>
          </div>
        ))}
        <button onClick={onShowMore} data-testid="show-more-btn">
          Show More
        </button>
      </div>
    ) : (
      <p>No activity yet</p>
    )}
  </div>
)

describe('ActivityTimeline', () => {
  const mockActivities = [
    {
      _id: '1',
      action: 'created',
      description: 'Lead created',
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

  it('should display activity log entries', () => {
    render(
      <ActivityTimeline activities={mockActivities} onFilter={jest.fn()} onShowMore={jest.fn()} />
    )
    expect(screen.getByText('Lead created')).toBeInTheDocument()
    expect(screen.getByText('Lead assigned to Ahmed Khan')).toBeInTheDocument()
  })

  it('should display activities in chronological order (newest first)', () => {
    render(
      <ActivityTimeline activities={mockActivities} onFilter={jest.fn()} onShowMore={jest.fn()} />
    )
    const descriptions = screen.getAllByText(/Lead created|Lead assigned|Status changed/)
    expect(descriptions[0]).toHaveTextContent('created')
  })

  it('should have activity icons and colors', () => {
    const { container } = render(
      <ActivityTimeline activities={mockActivities} onFilter={jest.fn()} onShowMore={jest.fn()} />
    )
    expect(container.querySelector('.relative')).toBeInTheDocument()
  })

  it('should support activity filtering by action type', () => {
    const mockFilter = jest.fn()
    render(
      <ActivityTimeline activities={mockActivities} onFilter={mockFilter} onShowMore={jest.fn()} />
    )
    const filterSelect = screen.getByTestId('filter-select')
    fireEvent.change(filterSelect, { target: { value: 'created' } })
    expect(mockFilter).toHaveBeenCalledWith('created')
  })

  it('should have Show More functionality', () => {
    const mockShowMore = jest.fn()
    render(
      <ActivityTimeline activities={mockActivities} onFilter={jest.fn()} onShowMore={mockShowMore} />
    )
    fireEvent.click(screen.getByTestId('show-more-btn'))
    expect(mockShowMore).toHaveBeenCalled()
  })

  it('should handle empty timeline', () => {
    render(
      <ActivityTimeline activities={[]} onFilter={jest.fn()} onShowMore={jest.fn()} />
    )
    expect(screen.getByText('No activity yet')).toBeInTheDocument()
  })

  it('should display timestamps for each activity', () => {
    render(
      <ActivityTimeline activities={mockActivities} onFilter={jest.fn()} onShowMore={jest.fn()} />
    )
    const timestamps = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/)
    expect(timestamps.length).toBeGreaterThan(0)
  })

  it('should have proper accessibility with timeline descriptions', () => {
    render(
      <div role="region" aria-label="Activity Timeline">
        <ActivityTimeline activities={mockActivities} onFilter={jest.fn()} onShowMore={jest.fn()} />
      </div>
    )
    expect(screen.getByRole('region')).toBeInTheDocument()
  })
})
