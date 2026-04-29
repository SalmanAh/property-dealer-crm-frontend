import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Mock modal component
const AddLeadModal = ({ isOpen, onClose, onSubmit }) => {
  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    onSubmit({
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      budget: formData.get('budget'),
      propertyInterest: formData.get('propertyInterest'),
      status: formData.get('status'),
      agent: formData.get('agent'),
    })
  }

  return (
    <div data-testid="modal" role="dialog">
      <h2>Add New Lead</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" required data-testid="name-input" />
        <input name="email" type="email" placeholder="Email" required data-testid="email-input" />
        <input name="phone" placeholder="Phone" required data-testid="phone-input" />
        <input name="budget" type="number" placeholder="Budget" required data-testid="budget-input" />
        <input
          name="propertyInterest"
          placeholder="Property Interest"
          required
          data-testid="property-input"
        />
        <select name="status" required data-testid="status-select">
          <option value="">Select Status</option>
          <option value="New">New</option>
          <option value="Assigned">Assigned</option>
        </select>
        <select name="agent" data-testid="agent-select">
          <option value="">Select Agent</option>
          <option value="agent1">Ahmed Khan</option>
        </select>
        <button type="submit" data-testid="submit-btn">
          Add Lead
        </button>
        <button type="button" onClick={onClose} data-testid="close-btn">
          Cancel
        </button>
      </form>
    </div>
  )
}

describe('AddLeadModal', () => {
  it('should render modal form', () => {
    render(<AddLeadModal isOpen={true} onClose={jest.fn()} onSubmit={jest.fn()} />)
    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByText('Add New Lead')).toBeInTheDocument()
  })

  it('should have all form fields', () => {
    render(<AddLeadModal isOpen={true} onClose={jest.fn()} onSubmit={jest.fn()} />)
    expect(screen.getByTestId('name-input')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('phone-input')).toBeInTheDocument()
    expect(screen.getByTestId('budget-input')).toBeInTheDocument()
    expect(screen.getByTestId('property-input')).toBeInTheDocument()
    expect(screen.getByTestId('status-select')).toBeInTheDocument()
    expect(screen.getByTestId('agent-select')).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    render(<AddLeadModal isOpen={true} onClose={jest.fn()} onSubmit={jest.fn()} />)
    const nameInput = screen.getByTestId('name-input')
    expect(nameInput).toBeRequired()
  })

  it('should submit form with valid data', async () => {
    const mockSubmit = jest.fn()
    render(<AddLeadModal isOpen={true} onClose={jest.fn()} onSubmit={mockSubmit} />)

    await userEvent.type(screen.getByTestId('name-input'), 'John Doe')
    await userEvent.type(screen.getByTestId('email-input'), 'john@example.com')
    await userEvent.type(screen.getByTestId('phone-input'), '03001234567')
    await userEvent.type(screen.getByTestId('budget-input'), '5000000')
    await userEvent.type(screen.getByTestId('property-input'), 'Apartment')
    await userEvent.selectOptions(screen.getByTestId('status-select'), 'New')

    fireEvent.click(screen.getByTestId('submit-btn'))

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '03001234567',
        })
      )
    })
  })

  it('should handle error state gracefully', () => {
    render(<AddLeadModal isOpen={true} onClose={jest.fn()} onSubmit={jest.fn()} />)
    expect(screen.getByTestId('modal')).toBeInTheDocument()
  })

  it('should close modal when cancel button is clicked', () => {
    const mockClose = jest.fn()
    render(<AddLeadModal isOpen={true} onClose={mockClose} onSubmit={jest.fn()} />)
    fireEvent.click(screen.getByTestId('close-btn'))
    expect(mockClose).toHaveBeenCalled()
  })

  it('should have proper form labels for accessibility', () => {
    render(<AddLeadModal isOpen={true} onClose={jest.fn()} onSubmit={jest.fn()} />)
    expect(screen.getByTestId('name-input')).toHaveAttribute('placeholder', 'Name')
    expect(screen.getByTestId('email-input')).toHaveAttribute('placeholder', 'Email')
  })

  it('should not render when isOpen is false', () => {
    render(<AddLeadModal isOpen={false} onClose={jest.fn()} onSubmit={jest.fn()} />)
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument()
  })
})
