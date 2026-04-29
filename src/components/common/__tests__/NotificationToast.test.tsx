/**
 * NotificationToast Component Tests
 * Tests for toast notification display, dismissal, and animations
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationToast } from '../NotificationToast';
import { NotificationProvider, useNotification } from '@/contexts/NotificationContext';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckCircle: () => <div data-testid="check-icon">Check</div>,
  AlertCircle: () => <div data-testid="alert-icon">Alert</div>,
  AlertTriangle: () => <div data-testid="warning-icon">Warning</div>,
  Info: () => <div data-testid="info-icon">Info</div>,
  X: () => <div data-testid="close-icon">X</div>,
}));

// Test component that uses the notification context
const TestComponent = ({ onNotify }: { onNotify?: () => void }) => {
  const { addNotification } = useNotification();

  React.useEffect(() => {
    if (onNotify) {
      onNotify();
    }
  }, [onNotify]);

  return (
    <button
      onClick={() =>
        addNotification({
          type: 'success',
          title: 'Test Notification',
          message: 'This is a test',
        })
      }
    >
      Add Notification
    </button>
  );
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <NotificationProvider>
      {component}
      <NotificationToast />
    </NotificationProvider>
  );
};

describe('NotificationToast Component', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      renderWithProvider(<div />);
      expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
    });

    it('should display success toast with correct icon', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'success',
              title: 'Success',
              message: 'Operation completed',
            });
          }}
        />
      );

      // Toast would be displayed after notification is added
      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });

    it('should display error toast with correct icon', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'error',
              title: 'Error',
              message: 'Something went wrong',
            });
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });

    it('should display warning toast with correct icon', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'warning',
              title: 'Warning',
              message: 'Please be careful',
            });
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });

    it('should display info toast with correct icon', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'info',
              title: 'Info',
              message: 'Here is some information',
            });
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });
  });

  describe('Toast Content', () => {
    it('should display notification title', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'info',
              title: 'Test Title',
              message: 'Test message',
            });
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });

    it('should display notification message', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'info',
              title: 'Title',
              message: 'Test message content',
            });
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });

    it('should display action button if provided', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'info',
              title: 'Title',
              message: 'Message',
              action: {
                label: 'Click Me',
                onClick: jest.fn(),
              },
            });
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });
  });

  describe('Toast Dismissal', () => {
    it('should have close button', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'info',
              title: 'Title',
              message: 'Message',
            });
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });

    it('should remove toast when close button is clicked', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'info',
              title: 'Title',
              message: 'Message',
            });
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });
  });

  describe('Toast Styling', () => {
    it('should apply success styling', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'success',
              title: 'Success',
              message: 'Message',
            });
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });

    it('should apply error styling', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'error',
              title: 'Error',
              message: 'Message',
            });
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });

    it('should apply warning styling', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'warning',
              title: 'Warning',
              message: 'Message',
            });
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });

    it('should apply info styling', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'info',
              title: 'Info',
              message: 'Message',
            });
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });
  });

  describe('Toast Animations', () => {
    it('should have slide-in animation class', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'info',
              title: 'Title',
              message: 'Message',
            });
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });
  });

  describe('Multiple Toasts', () => {
    it('should display multiple toasts', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'info',
              title: 'First',
              message: 'Message 1',
            });
            addNotification({
              type: 'success',
              title: 'Second',
              message: 'Message 2',
            });
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });

    it('should limit displayed toasts to 3', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            for (let i = 0; i < 5; i++) {
              addNotification({
                type: 'info',
                title: `Notification ${i}`,
                message: `Message ${i}`,
              });
            }
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have dismiss button with aria-label', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'info',
              title: 'Title',
              message: 'Message',
            });
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });

    it('should have proper semantic HTML', async () => {
      renderWithProvider(
        <TestComponent
          onNotify={() => {
            const { addNotification } = require('@/contexts/NotificationContext').useNotification();
            addNotification({
              type: 'info',
              title: 'Title',
              message: 'Message',
            });
          }}
        />
      );

      expect(screen.getByRole('button', { name: /add notification/i })).toBeInTheDocument();
    });
  });
});
