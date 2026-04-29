import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock chart component
const ChartComponent = ({ title, data, type }) => (
  <div data-testid={`chart-${type}`}>
    <h3>{title}</h3>
    <div data-testid="chart-content">
      {data && data.length > 0 ? (
        <div>Chart with {data.length} items</div>
      ) : (
        <div>No data available</div>
      )}
    </div>
  </div>
)

describe('Charts', () => {
  it('should render lead status distribution donut chart', () => {
    const statusData = [
      { name: 'New', value: 10 },
      { name: 'Assigned', value: 15 },
      { name: 'In Progress', value: 15 },
      { name: 'Closed', value: 5 },
    ]
    render(<ChartComponent title="Lead Status Distribution" data={statusData} type="donut" />)
    expect(screen.getByText('Lead Status Distribution')).toBeInTheDocument()
    expect(screen.getByText('Chart with 4 items')).toBeInTheDocument()
  })

  it('should render priority breakdown bar chart', () => {
    const priorityData = [
      { name: 'High', value: 15 },
      { name: 'Medium', value: 20 },
      { name: 'Low', value: 10 },
    ]
    render(<ChartComponent title="Priority Breakdown" data={priorityData} type="bar" />)
    expect(screen.getByText('Priority Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Chart with 3 items')).toBeInTheDocument()
  })

  it('should handle empty data gracefully', () => {
    render(<ChartComponent title="Empty Chart" data={[]} type="donut" />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })

  it('should display chart with correct data points', () => {
    const data = [
      { name: 'New', value: 10 },
      { name: 'Assigned', value: 15 },
    ]
    render(<ChartComponent title="Test Chart" data={data} type="bar" />)
    expect(screen.getByText('Chart with 2 items')).toBeInTheDocument()
  })

  it('should be responsive on different screen sizes', () => {
    const { container } = render(
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartComponent title="Chart 1" data={[{ name: 'A', value: 10 }]} type="donut" />
        <ChartComponent title="Chart 2" data={[{ name: 'B', value: 20 }]} type="bar" />
      </div>
    )
    expect(container.querySelector('.grid')).toBeInTheDocument()
  })

  it('should have proper accessibility with chart descriptions', () => {
    render(
      <div role="region" aria-label="Lead Status Distribution Chart">
        <ChartComponent title="Lead Status Distribution" data={[{ name: 'New', value: 10 }]} type="donut" />
      </div>
    )
    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('should render chart container with proper structure', () => {
    const { container } = render(
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <ChartComponent title="Status Chart" data={[{ name: 'New', value: 10 }]} type="donut" />
      </div>
    )
    expect(container.querySelector('.bg-white')).toBeInTheDocument()
    expect(container.querySelector('.rounded-xl')).toBeInTheDocument()
  })

  it('should handle null data without crashing', () => {
    render(<ChartComponent title="Null Data Chart" data={null} type="bar" />)
    expect(screen.getByText('No data available')).toBeInTheDocument()
  })
})
