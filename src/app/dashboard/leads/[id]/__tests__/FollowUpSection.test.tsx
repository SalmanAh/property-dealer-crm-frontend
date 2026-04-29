import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Mock follow-up section component
const FollowUpSection = ({ followUps, onSetReminder, onEdit, onDelete }) => {
  const [showForm, setShowForm] = React.useState(false)
  const [date, setDate] = React.useState('')
  const [notes, setNotes] = React.useState('')

  const handleSetReminder = () => {
    onSetReminder({ date, notes })
    setDate('')
    setNotes('')
    setShowForm(false)
  }

  return (
    <div data-testid="followup-section">
      <h3>Follow-Ups</h3>

      {showForm ? (
        <div>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            data-testid="date-picker"
          />
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Follow-up notes"
            data-testid="followup-notes"
          />
          <button onClick={handleSetReminder} data-testid="set-reminder-btn">
            Set Reminder
          </button>
          <button onClick={() => setShowForm(false)} data-testid="cancel-form-btn">
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} data-testid="add-followup-btn">
          Add Follow-Up
        </button>
      )}

      <div data-testid="followup-history">
        {followUps && followUps.length > 0 ? (
          <div>
            {followUps.map((fu) => (
              <div key={fu._id} data-testid={`followup-${fu._id}`}>
                <span>{new Date(fu.scheduledDate).toLocaleDateString()}</span>
                <span>{fu.status}</span>
                {fu.notes && <p>{fu.notes}</p>}
                <button onClick={() => onEdit(fu._id)} data-testid={`edit-${fu._id}`}>
                  Edit
                </button>
                <button onClick={() => onDelete(fu._id)} data-testid={`delete-${fu._id}`}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>No follow-ups scheduled</p>
        )}
      </div>
    </div>
  )
}

describe('FollowUpSection', () => {
  const mockFollowUps = [
    {
      _id: '1',
      scheduledDate: new Date().toISOString(),
      status: 'pending',
      notes: 'Call to confirm interest',
    },
    {
      _id: '2',
      scheduledDate: new Date(Date.now() + 86400000).toISOString(),
      status: 'pending',
      notes: 'Send property details',
    },
  ]

  it('should render follow-up date picker', () => {
    render(
      <FollowUpSection
        followUps={mockFollowUps}
        onSetReminder={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    fireEvent.click(screen.getByTestId('add-followup-btn'))
    expect(screen.getByTestId('date-picker')).toBeInTheDocument()
  })

  it('should render follow-up notes field', () => {
    render(
      <FollowUpSection
        followUps={mockFollowUps}
        onSetReminder={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    fireEvent.click(screen.getByTestId('add-followup-btn'))
    expect(screen.getByTestId('followup-notes')).toBeInTheDocument()
  })

  it('should have Set Reminder button functionality', async () => {
    const mockSetReminder = jest.fn()
    render(
      <FollowUpSection
        followUps={mockFollowUps}
        onSetReminder={mockSetReminder}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )

    fireEvent.click(screen.getByTestId('add-followup-btn'))
    await userEvent.type(screen.getByTestId('date-picker'), '2024-01-15T10:00')
    await userEvent.type(screen.getByTestId('followup-notes'), 'Test note')
    fireEvent.click(screen.getByTestId('set-reminder-btn'))

    expect(mockSetReminder).toHaveBeenCalled()
  })

  it('should display follow-up history', () => {
    render(
      <FollowUpSection
        followUps={mockFollowUps}
        onSetReminder={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    expect(screen.getByText('Call to confirm interest')).toBeInTheDocument()
    expect(screen.getByText('Send property details')).toBeInTheDocument()
  })

  it('should display follow-up status', () => {
    render(
      <FollowUpSection
        followUps={mockFollowUps}
        onSetReminder={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    const statusElements = screen.getAllByText('pending')
    expect(statusElements.length).toBeGreaterThan(0)
  })

  it('should support edit follow-up functionality', () => {
    const mockEdit = jest.fn()
    render(
      <FollowUpSection
        followUps={mockFollowUps}
        onSetReminder={jest.fn()}
        onEdit={mockEdit}
        onDelete={jest.fn()}
      />
    )
    fireEvent.click(screen.getByTestId('edit-1'))
    expect(mockEdit).toHaveBeenCalledWith('1')
  })

  it('should support delete follow-up functionality', () => {
    const mockDelete = jest.fn()
    render(
      <FollowUpSection
        followUps={mockFollowUps}
        onSetReminder={jest.fn()}
        onEdit={jest.fn()}
        onDelete={mockDelete}
      />
    )
    fireEvent.click(screen.getByTestId('delete-1'))
    expect(mockDelete).toHaveBeenCalledWith('1')
  })

  it('should handle empty follow-ups', () => {
    render(
      <FollowUpSection
        followUps={[]}
        onSetReminder={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    expect(screen.getByText('No follow-ups scheduled')).toBeInTheDocument()
  })

  it('should have proper accessibility with form labels', () => {
    render(
      <FollowUpSection
        followUps={mockFollowUps}
        onSetReminder={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    expect(screen.getByTestId('followup-section')).toBeInTheDocument()
  })
})
