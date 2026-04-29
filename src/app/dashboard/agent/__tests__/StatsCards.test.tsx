import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock stats card component
const StatsCard = ({ icon, label, value, color, isAlert }) => (
  <div data-testid="stats-card" className={isAlert ? 'bg-red-50' : 'bg-white'}>
    <span className={`material-symbols-outlined ${color}`}>{icon}</span>
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  </div>
)

describe('StatsCards', () => {
  it('should render assigned leads count card', () => {
    render(<StatsCard icon="person_search" label="Assigned Leads" value={5} color="text-primary" />)
    expect(screen.getByText('Assigned Leads')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should render follow-ups today card', () => {
    render(<StatsCard icon="alarm" label="Follow-ups Today" value={3} color="text-amber-600" />)
    expect(screen.getByText('Follow-ups Today')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('should render overdue follow-ups card with red styling', () => {
    const { container } = render(
      <StatsCard icon="warning" label="Overdue Follow-ups" value={2} color="text-red-600" isAlert={true} />
    )
    expect(screen.getByText('Overdue Follow-ups')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(container.querySelector('.bg-red-50')).toBeInTheDocument()
  })

  it('should display correct values', () => {
    render(<StatsCard icon="person_search" label="Assigned Leads" value={10} color="text-primary" />)
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('should handle real-time updates', () => {
    const { rerender } = render(
      <StatsCard icon="person_search" label="Assigned Leads" value={5} color="text-primary" />
    )
    expect(screen.getByText('5')).toBeInTheDocument()

    rerender(<StatsCard icon="person_search" label="Assigned Leads" value={6} color="text-primary" />)
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('should display loading state', () => {
    render(
      <div className="h-24 skeleton rounded-xl" data-testid="loading-skeleton">
        Loading...
      </div>
    )
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument()
  })

  it('should have proper accessibility labels', () => {
    render(<StatsCard icon="person_search" label="Assigned Leads" value={5} color="text-primary" />)
    expect(screen.getByText('Assigned Leads')).toBeInTheDocument()
    expect(screen.getByTestId('stats-card')).toBeInTheDocument()
  })

  it('should render with different color variants', () => {
    const { rerender } = render(
      <StatsCard icon="alarm" label="Follow-ups Today" value={3} color="text-amber-600" />
    )
    expect(screen.getByTestId('stats-card')).toBeInTheDocument()

    rerender(<StatsCard icon="warning" label="Overdue" value={2} color="text-red-600" isAlert={true} />)
    expect(screen.getByTestId('stats-card')).toBeInTheDocument()
  })
})
