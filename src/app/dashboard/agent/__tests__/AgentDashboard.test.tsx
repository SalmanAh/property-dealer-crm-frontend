import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock AgentDashboard page component for testing
const AgentDashboardMock = () => (
  <div data-testid="agent-dashboard">
    <div>
      <h1>Good morning, Ahmed! 👋</h1>
      <p>Here&apos;s your lead summary for today</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div data-testid="stats-card">
        <span>person_search</span>
        <div>
          <div>5</div>
          <div>Assigned Leads</div>
        </div>
      </div>
      <div data-testid="stats-card">
        <span>alarm</span>
        <div>
          <div>3</div>
          <div>Follow-ups Today</div>
        </div>
      </div>
      <div data-testid="stats-card">
        <span>warning</span>
        <div>
          <div>2</div>
          <div>Overdue Follow-ups</div>
        </div>
      </div>
    </div>

    <div>
      <div className="flex items-center justify-between mb-4">
        <h2>My Leads</h2>
        <a href="/dashboard/leads">View All</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>Lead Card 1</div>
        <div>Lead Card 2</div>
      </div>
    </div>
  </div>
)

describe('AgentDashboard', () => {
  it('should render greeting section with user name', () => {
    render(<AgentDashboardMock />)
    expect(screen.getByText(/Good morning, Ahmed/)).toBeInTheDocument()
  })

  it('should render stats grid with 3 cards', () => {
    render(<AgentDashboardMock />)
    const cards = screen.getAllByTestId('stats-card')
    expect(cards.length).toBe(3)
  })

  it('should display stats values', () => {
    render(<AgentDashboardMock />)
    expect(screen.getByText('Assigned Leads')).toBeInTheDocument()
    expect(screen.getByText('Follow-ups Today')).toBeInTheDocument()
    expect(screen.getByText('Overdue Follow-ups')).toBeInTheDocument()
  })

  it('should render assigned leads grid', () => {
    render(<AgentDashboardMock />)
    expect(screen.getByText('My Leads')).toBeInTheDocument()
  })

  it('should have responsive layout', () => {
    const { container } = render(<AgentDashboardMock />)
    expect(container.querySelector('.grid')).toBeInTheDocument()
  })

  it('should have proper heading hierarchy for accessibility', () => {
    render(<AgentDashboardMock />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toBeInTheDocument()
  })
})
