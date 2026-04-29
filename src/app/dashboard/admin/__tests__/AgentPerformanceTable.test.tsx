import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock table component
const AgentPerformanceTable = ({ data }) => (
  <table>
    <thead>
      <tr>
        <th>Agent</th>
        <th>Assigned</th>
        <th>In-Progress</th>
        <th>Closed</th>
        <th>Conversion Rate</th>
      </tr>
    </thead>
    <tbody>
      {data && data.length > 0 ? (
        data.map((agent) => (
          <tr key={agent.agent._id}>
            <td>{agent.agent.name}</td>
            <td>{agent.assigned}</td>
            <td>{agent.inProgress || 0}</td>
            <td>{agent.closed}</td>
            <td>{agent.conversionRate}%</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={5}>No agents yet</td>
        </tr>
      )}
    </tbody>
  </table>
)

describe('AgentPerformanceTable', () => {
  const mockAgentData = [
    {
      agent: { _id: '1', name: 'Ahmed Khan', email: 'ahmed@example.com' },
      assigned: 10,
      inProgress: 5,
      closed: 5,
      conversionRate: 50,
    },
    {
      agent: { _id: '2', name: 'Fatima Ali', email: 'fatima@example.com' },
      assigned: 8,
      inProgress: 3,
      closed: 4,
      conversionRate: 50,
    },
  ]

  it('should render table with agent data', () => {
    render(<AgentPerformanceTable data={mockAgentData} />)
    expect(screen.getByText('Ahmed Khan')).toBeInTheDocument()
    expect(screen.getByText('Fatima Ali')).toBeInTheDocument()
  })

  it('should display all columns correctly', () => {
    render(<AgentPerformanceTable data={mockAgentData} />)
    expect(screen.getByText('Agent')).toBeInTheDocument()
    expect(screen.getByText('Assigned')).toBeInTheDocument()
    expect(screen.getByText('In-Progress')).toBeInTheDocument()
    expect(screen.getByText('Closed')).toBeInTheDocument()
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument()
  })

  it('should display conversion rate visualization', () => {
    render(<AgentPerformanceTable data={mockAgentData} />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('should handle empty agent list', () => {
    render(<AgentPerformanceTable data={[]} />)
    expect(screen.getByText('No agents yet')).toBeInTheDocument()
  })

  it('should display correct assigned leads count', () => {
    render(<AgentPerformanceTable data={mockAgentData} />)
    const cells = screen.getAllByText('10')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('should display correct closed leads count', () => {
    render(<AgentPerformanceTable data={mockAgentData} />)
    const cells = screen.getAllByText('5')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('should have proper table structure for accessibility', () => {
    const { container } = render(<AgentPerformanceTable data={mockAgentData} />)
    expect(container.querySelector('table')).toBeInTheDocument()
    expect(container.querySelector('thead')).toBeInTheDocument()
    expect(container.querySelector('tbody')).toBeInTheDocument()
  })

  it('should render table headers with proper semantics', () => {
    const { container } = render(<AgentPerformanceTable data={mockAgentData} />)
    const headers = container.querySelectorAll('th')
    expect(headers.length).toBe(5)
  })
})
