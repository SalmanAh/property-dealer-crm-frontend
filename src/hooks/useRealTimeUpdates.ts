'use client';
import { useEffect, useCallback, useRef } from 'react';
import {
  getSocket,
  onConnectionChange,
  onSocketEvent,
  isSocketConnected,
} from '@/lib/socket';
import {
  startLeadsPolling,
  stopLeadsPolling,
  startLeadPolling,
  stopLeadPolling,
  onPollingEvent,
  setPollingEnabled,
} from '@/lib/polling';
import { useNotification } from '@/contexts/NotificationContext';

interface RealTimeUpdateConfig {
  enabled?: boolean;
  pollLeads?: boolean;
  pollSpecificLead?: string;
  onLeadNew?: (lead: any) => void;
  onLeadAssigned?: (lead: any) => void;
  onLeadUpdated?: (lead: any) => void;
  onLeadStatusChanged?: (lead: any) => void;
  onLeadDeleted?: (data: any) => void;
}

/**
 * Hook for managing real-time updates via Socket.io with polling fallback
 */
export function useRealTimeUpdates(config: RealTimeUpdateConfig = {}) {
  const {
    enabled = true,
    pollLeads = false,
    pollSpecificLead,
    onLeadNew,
    onLeadAssigned,
    onLeadUpdated,
    onLeadStatusChanged,
    onLeadDeleted,
  } = config;

  const { addNotification } = useNotification();
  const unsubscribeRef = useRef<(() => void)[]>([]);
  const isConnectedRef = useRef(false);

  // Initialize Socket.io and set up listeners
  useEffect(() => {
    if (!enabled) return;

    const socket = getSocket();

    // Listen for connection changes
    const unsubscribeConnection = onConnectionChange((connected) => {
      isConnectedRef.current = connected;
      console.log('[useRealTimeUpdates] Connection status:', connected);

      if (connected) {
        // Socket connected, stop polling
        stopLeadsPolling();
        if (pollSpecificLead) {
          stopLeadPolling(pollSpecificLead);
        }
        setPollingEnabled(false);
      } else {
        // Socket disconnected, start polling as fallback
        console.log('[useRealTimeUpdates] Socket disconnected, starting polling fallback');
        setPollingEnabled(true);
        if (pollLeads) {
          startLeadsPolling();
        }
        if (pollSpecificLead) {
          startLeadPolling(pollSpecificLead);
        }
      }
    });

    unsubscribeRef.current.push(unsubscribeConnection);

    // Listen for Socket.io events
    const unsubscribeLeadNew = onSocketEvent('lead:new', (lead) => {
      console.log('[useRealTimeUpdates] New lead received:', lead);
      addNotification({
        type: 'info',
        title: 'New Lead',
        message: `${lead.name} - ${lead.propertyInterest}`,
        sound: true,
      });
      onLeadNew?.(lead);
    });

    const unsubscribeLeadAssigned = onSocketEvent('lead:assigned', (lead) => {
      console.log('[useRealTimeUpdates] Lead assigned:', lead);
      addNotification({
        type: 'info',
        title: 'Lead Assigned',
        message: `${lead.name} has been assigned to you`,
        sound: true,
        action: {
          label: 'View',
          onClick: () => {
            window.location.href = `/dashboard/leads/${lead._id}`;
          },
        },
      });
      onLeadAssigned?.(lead);
    });

    const unsubscribeLeadUpdated = onSocketEvent('lead:updated', (lead) => {
      console.log('[useRealTimeUpdates] Lead updated:', lead);
      onLeadUpdated?.(lead);
    });

    const unsubscribeLeadStatusChanged = onSocketEvent('lead:status_changed', (lead) => {
      console.log('[useRealTimeUpdates] Lead status changed:', lead);
      addNotification({
        type: 'success',
        title: 'Status Updated',
        message: `${lead.name} status changed to ${lead.status}`,
      });
      onLeadStatusChanged?.(lead);
    });

    const unsubscribeLeadDeleted = onSocketEvent('lead:deleted', (data) => {
      console.log('[useRealTimeUpdates] Lead deleted:', data);
      onLeadDeleted?.(data);
    });

    unsubscribeRef.current.push(
      unsubscribeLeadNew,
      unsubscribeLeadAssigned,
      unsubscribeLeadUpdated,
      unsubscribeLeadStatusChanged,
      unsubscribeLeadDeleted
    );

    // Listen for polling events (fallback)
    const unsubscribePollingLeadNew = onPollingEvent('lead:new', (lead) => {
      console.log('[useRealTimeUpdates] Polling: New lead:', lead);
      addNotification({
        type: 'info',
        title: 'New Lead',
        message: `${lead.name} - ${lead.propertyInterest}`,
      });
      onLeadNew?.(lead);
    });

    const unsubscribePollingLeadUpdated = onPollingEvent('lead:updated', (lead) => {
      console.log('[useRealTimeUpdates] Polling: Lead updated:', lead);
      onLeadUpdated?.(lead);
    });

    const unsubscribePollingLeadStatusChanged = onPollingEvent(
      'lead:status_changed',
      (lead) => {
        console.log('[useRealTimeUpdates] Polling: Lead status changed:', lead);
        addNotification({
          type: 'success',
          title: 'Status Updated',
          message: `${lead.name} status changed to ${lead.status}`,
        });
        onLeadStatusChanged?.(lead);
      }
    );

    const unsubscribePollingLeadDeleted = onPollingEvent('lead:deleted', (data) => {
      console.log('[useRealTimeUpdates] Polling: Lead deleted:', data);
      onLeadDeleted?.(data);
    });

    unsubscribeRef.current.push(
      unsubscribePollingLeadNew,
      unsubscribePollingLeadUpdated,
      unsubscribePollingLeadStatusChanged,
      unsubscribePollingLeadDeleted
    );

    // Start polling if Socket.io is not connected
    if (!isSocketConnected()) {
      setPollingEnabled(true);
      if (pollLeads) {
        startLeadsPolling();
      }
      if (pollSpecificLead) {
        startLeadPolling(pollSpecificLead);
      }
    }

    return () => {
      unsubscribeRef.current.forEach((unsub) => unsub());
      unsubscribeRef.current = [];
      stopLeadsPolling();
      if (pollSpecificLead) {
        stopLeadPolling(pollSpecificLead);
      }
    };
  }, [enabled, pollLeads, pollSpecificLead, onLeadNew, onLeadAssigned, onLeadUpdated, onLeadStatusChanged, onLeadDeleted, addNotification]);

  return {
    isConnected: isConnectedRef.current,
  };
}
