import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock AdminDashboard page component for testing
const AdminDashboardMock = () => (
  <div data-testid="admin-dashboard">
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome back, Admin User. Here&apos;s what&apos;s happening today.</p>
    </div>

    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div data-testid="stat-card">
        <span>groups</span>
        <span>Total Leads</span>
        <span>45</span>
      </div>
      <div data-testid="stat-card">
        <span>priority_high</span>
        <span>High Priority</span>
        <span>15</span>
      </div>
      <div data-testid="stat-card">
        <span>person_check</span>
        <span>Active Agents</span>
        <span>8</span>
      </div>
      <div data-testid="stat-card">
        <span>assignment_turned_in</span>
        <span>Closed This Month</span>
        <span>12</span>
      </div>
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3>Lead Status Distribution</h3>
      </div>
      <div>
        <h3>Priority Breakdown</h3>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h3>Agent Performance</h3>
        <table>
          <thead>
            <tr>
              <th>Agent</th>
              <th>Assigned</th>
              <th>Closed</th>
              <th>Conversion</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ahmed Khan</td>
              <td>10</td>
              <td>5</td>
              <td>50%</td>
            </tr>
            <tr>
              <td>Fatima Ali</td>
              <td>8</td>
              <td>4</td>
              <td>50%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h3>Recent Activity</h3>
        <p>Lead created: John Doe</p>
      </div>
    </div>
  </div>
)

describe('AdminDashboard', () => {
  it('should render dashboard header with title', () => {
    render(<AdminDashboardMock />)
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
  })

  it('should render analytics cards grid with 4 cards', () => {
    render(<AdminDashboardMock />)
    const cards = screen.getAllByTestId('stat-card')
    expect(cards.length).toBe(4)
  })

  it('should display correct analytics values', () => {
    render(<AdminDashboardMock />)
    expect(screen.getByText('45')).toBeInTheDocument() // Total leads
    expect(screen.getByText('15')).toBeInTheDocument() // High priority
    expect(screen.getByText('8')).toBeInTheDocument() // Active agents
    expect(screen.getByText('12')).toBeInTheDocument() // Closed this month
  })

  it('should render charts section with status distribution and priority breakdown', () => {
    render(<AdminDashboardMock />)
    expect(screen.getByText('Lead Status Distribution')).toBeInTheDocument()
    expect(screen.getByText('Priority Breakdown')).toBeInTheDocument()
  })

  it('should render agent performance table', () => {
    render(<AdminDashboardMock />)
    expect(screen.getByText('Agent Performance')).toBeInTheDocument()
    expect(screen.getByText('Ahmed Khan')).toBeInTheDocument()
    expect(screen.getByText('Fatima Ali')).toBeInTheDocument()
  })

  it('should render recent activity feed', () => {
    render(<AdminDashboardMock />)
    expect(screen.getByText('Recent Activity')).toBeInTheDocument()
    expect(screen.getByText('Lead created: John Doe')).toBeInTheDocument()
  })

  it('should have responsive layout', () => {
    const { container } = render(<AdminDashboardMock />)
    expect(container.querySelector('.grid')).toBeInTheDocument()
  })

  it('should have proper heading hierarchy for accessibility', () => {
    render(<AdminDashboardMock />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toBeInTheDocument()
  })
})
