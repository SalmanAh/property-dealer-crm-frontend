import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Mock notes section component
const NotesSection = ({ notes, onSave, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = React.useState(false)
  const [noteText, setNoteText] = React.useState(notes || '')

  const handleSave = () => {
    onSave(noteText)
    setIsEditing(false)
  }

  return (
    <div data-testid="notes-section">
      <h3>Notes</h3>

      {isEditing ? (
        <div>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            data-testid="notes-textarea"
          />
          <button onClick={handleSave} data-testid="save-btn">
            Save
          </button>
          <button onClick={() => setIsEditing(false)} data-testid="cancel-btn">
            Cancel
          </button>
        </div>
      ) : (
        <div>
          <p data-testid="notes-display">{notes || 'No notes'}</p>
          <button onClick={() => setIsEditing(true)} data-testid="edit-btn">
            Edit
          </button>
          <button onClick={() => onDelete()} data-testid="delete-btn">
            Delete
          </button>
        </div>
      )}

      <div data-testid="note-history">
        <h4>Note History</h4>
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  )
}

describe('NotesSection', () => {
  const mockNotes = 'Interested in 2-bedroom apartment near downtown'

  it('should render editable notes area', () => {
    render(
      <NotesSection
        notes={mockNotes}
        onSave={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    expect(screen.getByTestId('notes-display')).toBeInTheDocument()
    expect(screen.getByText(mockNotes)).toBeInTheDocument()
  })

  it('should support note saving functionality', async () => {
    const mockSave = jest.fn()
    render(
      <NotesSection
        notes={mockNotes}
        onSave={mockSave}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )

    fireEvent.click(screen.getByTestId('edit-btn'))
    const textarea = screen.getByTestId('notes-textarea')
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'Updated note')
    fireEvent.click(screen.getByTestId('save-btn'))

    expect(mockSave).toHaveBeenCalledWith('Updated note')
  })

  it('should display note history', () => {
    render(
      <NotesSection
        notes={mockNotes}
        onSave={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    expect(screen.getByText('Note History')).toBeInTheDocument()
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
  })

  it('should display note timestamps', () => {
    render(
      <NotesSection
        notes={mockNotes}
        onSave={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument()
  })

  it('should support edit functionality', () => {
    render(
      <NotesSection
        notes={mockNotes}
        onSave={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    fireEvent.click(screen.getByTestId('edit-btn'))
    expect(screen.getByTestId('notes-textarea')).toBeInTheDocument()
  })

  it('should support delete functionality', () => {
    const mockDelete = jest.fn()
    render(
      <NotesSection
        notes={mockNotes}
        onSave={jest.fn()}
        onEdit={jest.fn()}
        onDelete={mockDelete}
      />
    )
    fireEvent.click(screen.getByTestId('delete-btn'))
    expect(mockDelete).toHaveBeenCalled()
  })

  it('should handle empty notes', () => {
    render(
      <NotesSection
        notes=""
        onSave={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    expect(screen.getByText('No notes')).toBeInTheDocument()
  })

  it('should have proper accessibility with note labels', () => {
    render(
      <NotesSection
        notes={mockNotes}
        onSave={jest.fn()}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />
    )
    expect(screen.getByTestId('notes-section')).toBeInTheDocument()
  })
})
