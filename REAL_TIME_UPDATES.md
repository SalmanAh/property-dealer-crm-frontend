# Real-Time Updates Implementation Guide

## Overview

This document describes the real-time updates system implemented in Phase 13 of the Property Dealer CRM. The system provides live notifications for lead changes using Socket.io with an automatic polling fallback when WebSocket is unavailable.

## Architecture

### Components

1. **Socket.io Client** (`src/lib/socket.ts`)
   - Manages WebSocket connection to the backend
   - Handles connection/disconnection events
   - Listens for real-time lead update events
   - Provides connection status tracking

2. **Polling Utility** (`src/lib/polling.ts`)
   - Implements polling mechanism as fallback
   - Configurable polling intervals (default: 5 seconds)
   - Detects changes by comparing API responses
   - Emits events for new, updated, and deleted leads

3. **Notification Context** (`src/contexts/NotificationContext.tsx`)
   - Global notification state management
   - Supports multiple notification types (success, error, warning, info)
   - Auto-dismissal with configurable duration
   - Optional notification sound

4. **Notification Components**
   - **NotificationBadge** (`src/components/common/NotificationBadge.tsx`): Displays unread count and notification panel
   - **NotificationToast** (`src/components/common/NotificationToast.tsx`): Shows temporary toast notifications

5. **Real-Time Updates Hook** (`src/hooks/useRealTimeUpdates.ts`)
   - Orchestrates Socket.io and polling
   - Automatically switches between Socket.io and polling
   - Provides callbacks for different event types
   - Handles cleanup on unmount

## Usage

### Basic Setup

1. **Wrap your app with providers** (already done in `src/app/layout.tsx`):

```tsx
import { NotificationProvider } from '@/contexts/NotificationContext';
import { NotificationToast } from '@/components/common/NotificationToast';

export default function RootLayout({ children }) {
  return (
    <NotificationProvider>
      {children}
      <NotificationToast />
    </NotificationProvider>
  );
}
```

2. **Use the real-time updates hook** in your components:

```tsx
import { useRealTimeUpdates } from '@/hooks/useRealTimeUpdates';

export function MyComponent() {
  const { isConnected } = useRealTimeUpdates({
    enabled: true,
    pollLeads: true,
    onLeadNew: (lead) => {
      console.log('New lead:', lead);
      // Update your UI
    },
    onLeadAssigned: (lead) => {
      console.log('Lead assigned:', lead);
    },
    onLeadStatusChanged: (lead) => {
      console.log('Status changed:', lead);
    },
    onLeadUpdated: (lead) => {
      console.log('Lead updated:', lead);
    },
    onLeadDeleted: (data) => {
      console.log('Lead deleted:', data.leadId);
    },
  });

  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Polling'}
    </div>
  );
}
```

### Using Notifications

```tsx
import { useNotification } from '@/contexts/NotificationContext';

export function MyComponent() {
  const { addNotification } = useNotification();

  const handleAction = () => {
    addNotification({
      type: 'success',
      title: 'Success',
      message: 'Operation completed successfully',
      duration: 5000, // Auto-dismiss after 5 seconds
      sound: true, // Play notification sound
    });
  };

  return <button onClick={handleAction}>Perform Action</button>;
}
```

## Real-Time Events

### Socket.io Events

The backend emits the following events:

- **lead:new** - New lead created
- **lead:assigned** - Lead assigned to an agent
- **lead:updated** - Lead information updated
- **lead:status_changed** - Lead status changed
- **lead:deleted** - Lead deleted

### Polling Events

When Socket.io is unavailable, the polling utility emits the same events by comparing API responses:

- **lead:new** - New lead detected
- **lead:updated** - Lead changes detected
- **lead:status_changed** - Status change detected
- **lead:deleted** - Lead deletion detected

## Configuration

### Polling Interval

```tsx
import { setPollingInterval } from '@/lib/polling';

// Set polling interval to 3 seconds
setPollingInterval(3000);
```

### Notification Duration

```tsx
const { addNotification } = useNotification();

addNotification({
  type: 'info',
  title: 'Notification',
  message: 'This will auto-dismiss after 3 seconds',
  duration: 3000, // milliseconds, 0 = persistent
});
```

### Notification Sound

```tsx
addNotification({
  type: 'success',
  title: 'Success',
  message: 'Operation completed',
  sound: true, // Enable notification sound
});
```

## Connection Status

### Check Connection Status

```tsx
import { isSocketConnected } from '@/lib/socket';

const connected = isSocketConnected();
console.log('Socket connected:', connected);
```

### Listen to Connection Changes

```tsx
import { onConnectionChange } from '@/lib/socket';

const unsubscribe = onConnectionChange((connected) => {
  console.log('Connection status:', connected);
});

// Clean up
unsubscribe();
```

## Fallback Mechanism

The system automatically switches between Socket.io and polling:

1. **Socket.io Connected**: Uses real-time WebSocket events
2. **Socket.io Disconnected**: Automatically switches to polling
3. **Polling Active**: Detects changes by comparing API responses
4. **Socket.io Reconnected**: Automatically switches back to Socket.io

## Testing

### Integration Tests

Socket.io integration tests: `src/lib/__tests__/socket.integration.test.ts`
- Connection/disconnection handling
- Event listeners
- Connection status tracking
- Error handling and reconnection

Polling integration tests: `src/lib/__tests__/polling.integration.test.ts`
- Polling mechanism
- Change detection
- Event emission
- Configuration

### Component Tests

Notification badge tests: `src/components/common/__tests__/NotificationBadge.test.tsx`
- Badge rendering
- Panel interaction
- Notification display
- Dismissal

Notification toast tests: `src/components/common/__tests__/NotificationToast.test.tsx`
- Toast rendering
- Content display
- Dismissal
- Styling

## Performance Considerations

1. **Polling Interval**: Default is 5 seconds. Adjust based on your needs:
   - Faster updates: 2-3 seconds (higher server load)
   - Balanced: 5 seconds (recommended)
   - Lower load: 10+ seconds

2. **Notification Limit**: Toast notifications are limited to 3 visible at once to avoid UI clutter

3. **Memory Management**: Event listeners are automatically cleaned up on component unmount

4. **API Optimization**: Polling uses the same API endpoints as manual refreshes

## Troubleshooting

### Socket.io Not Connecting

1. Check backend Socket.io server is running
2. Verify `NEXT_PUBLIC_SOCKET_URL` environment variable
3. Check browser console for connection errors
4. Polling fallback will activate automatically

### Notifications Not Appearing

1. Ensure `NotificationProvider` wraps your app
2. Ensure `NotificationToast` component is rendered
3. Check browser console for errors
4. Verify notification duration is not 0 (persistent)

### Polling Not Detecting Changes

1. Verify API endpoints are working
2. Check polling interval is not too long
3. Ensure lead data is being updated on backend
4. Check browser console for API errors

## Environment Variables

```env
# Socket.io server URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# API base URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Backend Integration

The backend should emit Socket.io events when leads are created, updated, or deleted:

```javascript
// Example backend code
const notificationService = require('./services/notificationService');

// When a new lead is created
notificationService.newLead(lead);

// When a lead is assigned
notificationService.leadAssigned(agentId, lead);

// When a lead is updated
notificationService.leadUpdated(lead);

// When a lead status changes
notificationService.statusChanged(lead);

// When a lead is deleted
notificationService.leadDeleted(leadId);
```

## Future Enhancements

1. **Notification Preferences**: Allow users to customize notification types and sounds
2. **Notification History**: Store notification history for later review
3. **Desktop Notifications**: Use browser Notification API for system notifications
4. **Notification Grouping**: Group similar notifications together
5. **Selective Polling**: Only poll specific leads instead of all leads
6. **Exponential Backoff**: Implement exponential backoff for polling on errors

## References

- Socket.io Documentation: https://socket.io/docs/
- React Context API: https://react.dev/reference/react/useContext
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
