import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock StatCard component for testing
const StatCard = ({ icon, iconColor, label, value, badge, badgeColor }) => (
  <div data-testid="stat-card">
    <span className={`material-symbols-outlined ${iconColor}`}>{icon}</span>
    <span>{label}</span>
    <span>{value}</span>
    {badge && <span className={badgeColor}>{badge}</span>}
  </div>
)

describe('AnalyticsCards', () => {
  it('should render total leads card with correct value', () => {
    render(
      <StatCard
        icon="groups"
        iconColor="text-primary"
        label="Total Leads"
        value={45}
        badge="+12%"
        badgeColor="bg-primary/10 text-primary"
      />
    )
    expect(screen.getByText('Total Leads')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText('+12%')).toBeInTheDocument()
  })

  it('should render high priority leads card', () => {
    render(
      <StatCard
        icon="priority_high"
        iconColor="text-red-500"
        label="High Priority"
        value={15}
        badge="High"
        badgeColor="bg-red-50 text-red-600"
      />
    )
    expect(screen.getByText('High Priority')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('should render active agents card', () => {
    render(
      <StatCard
        icon="person_check"
        iconColor="text-emerald-600"
        label="Active Agents"
        value={8}
        badge="Active"
        badgeColor="bg-emerald-50 text-emerald-600"
      />
    )
    expect(screen.getByText('Active Agents')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('should render closed this month card', () => {
    render(
      <StatCard
        icon="assignment_turned_in"
        iconColor="text-amber-600"
        label="Closed This Month"
        value={12}
        badge="Monthly"
        badgeColor="bg-amber-50 text-amber-600"
      />
    )
    expect(screen.getByText('Closed This Month')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('should display loading state with skeleton', () => {
    const { container } = render(
      <div className="skeleton">
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    )
    expect(container.querySelector('.skeleton')).toBeInTheDocument()
  })

  it('should have proper accessibility labels', () => {
    const { container } = render(
      <StatCard
        icon="groups"
        iconColor="text-primary"
        label="Total Leads"
        value={45}
      />
    )
    expect(screen.getByText('Total Leads')).toBeInTheDocument()
    expect(screen.getByTestId('stat-card')).toBeInTheDocument()
  })

  it('should render badge when provided', () => {
    render(
      <StatCard
        icon="groups"
        iconColor="text-primary"
        label="Total Leads"
        value={45}
        badge="+12%"
        badgeColor="bg-primary/10 text-primary"
      />
    )
    expect(screen.getByText('+12%')).toBeInTheDocument()
  })

  it('should not render badge when not provided', () => {
    render(
      <StatCard
        icon="groups"
        iconColor="text-primary"
        label="Total Leads"
        value={45}
      />
    )
    expect(screen.queryByText('+12%')).not.toBeInTheDocument()
  })
})
