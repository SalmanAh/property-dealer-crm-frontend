'use client';
import { leadsAPI } from './api';

interface PollingConfig {
  interval: number; // milliseconds
  enabled: boolean;
}

let pollingConfig: PollingConfig = {
  interval: 5000, // 5 seconds default
  enabled: false,
};

let pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
let lastPolledData: Map<string, any> = new Map();
let pollingListeners: Map<string, ((data: any) => void)[]> = new Map();

/**
 * Configure polling interval
 */
export const setPollingInterval = (interval: number) => {
  pollingConfig.interval = interval;
};

/**
 * Get current polling interval
 */
export const getPollingInterval = (): number => {
  return pollingConfig.interval;
};

/**
 * Enable/disable polling
 */
export const setPollingEnabled = (enabled: boolean) => {
  pollingConfig.enabled = enabled;
};

/**
 * Start polling for leads
 */
export const startLeadsPolling = () => {
  if (pollingIntervals.has('leads')) {
    return; // Already polling
  }

  const pollLeads = async () => {
    try {
      const response = await leadsAPI.getAll();
      const leads = response.data;

      // Compare with last polled data to detect changes
      const lastLeads = lastPolledData.get('leads') || [];
      const lastLeadsMap = new Map(lastLeads.map((l: any) => [l._id, l]));

      leads.forEach((lead: any) => {
        const lastLead = lastLeadsMap.get(lead._id);

        if (!lastLead) {
          // New lead
          emitPollingEvent('lead:new', lead);
        } else if (JSON.stringify(lastLead) !== JSON.stringify(lead)) {
          // Lead updated
          if ((lastLead as any).status !== (lead as any).status) {
            emitPollingEvent('lead:status_changed', lead);
          } else {
            emitPollingEvent('lead:updated', lead);
          }
        }
      });

      // Check for deleted leads
      lastLeadsMap.forEach((lastLead, leadId) => {
        if (!leads.find((l: any) => l._id === leadId)) {
          emitPollingEvent('lead:deleted', { leadId });
        }
      });

      lastPolledData.set('leads', leads);
    } catch (error) {
      console.error('[Polling] Error fetching leads:', error);
    }
  };

  // Initial poll
  pollLeads();

  // Set up interval
  const interval = setInterval(pollLeads, pollingConfig.interval);
  pollingIntervals.set('leads', interval);

  console.log(`[Polling] Started leads polling every ${pollingConfig.interval}ms`);
};

/**
 * Stop polling for leads
 */
export const stopLeadsPolling = () => {
  const interval = pollingIntervals.get('leads');
  if (interval) {
    clearInterval(interval);
    pollingIntervals.delete('leads');
    console.log('[Polling] Stopped leads polling');
  }
};

/**
 * Start polling for a specific lead
 */
export const startLeadPolling = (leadId: string) => {
  if (pollingIntervals.has(`lead:${leadId}`)) {
    return; // Already polling
  }

  const pollLead = async () => {
    try {
      const response = await leadsAPI.getById(leadId);
      const lead = response.data;

      const lastLead = lastPolledData.get(`lead:${leadId}`);

      if (!lastLead) {
        // First poll
        lastPolledData.set(`lead:${leadId}`, lead);
      } else if (JSON.stringify(lastLead) !== JSON.stringify(lead)) {
        // Lead updated
        if ((lastLead as any).status !== (lead as any).status) {
          emitPollingEvent(`lead:${leadId}:status_changed`, lead);
        } else {
          emitPollingEvent(`lead:${leadId}:updated`, lead);
        }
        lastPolledData.set(`lead:${leadId}`, lead);
      }
    } catch (error) {
      console.error(`[Polling] Error fetching lead ${leadId}:`, error);
    }
  };

  // Initial poll
  pollLead();

  // Set up interval
  const interval = setInterval(pollLead, pollingConfig.interval);
  pollingIntervals.set(`lead:${leadId}`, interval);

  console.log(`[Polling] Started polling for lead ${leadId} every ${pollingConfig.interval}ms`);
};

/**
 * Stop polling for a specific lead
 */
export const stopLeadPolling = (leadId: string) => {
  const interval = pollingIntervals.get(`lead:${leadId}`);
  if (interval) {
    clearInterval(interval);
    pollingIntervals.delete(`lead:${leadId}`);
    lastPolledData.delete(`lead:${leadId}`);
    console.log(`[Polling] Stopped polling for lead ${leadId}`);
  }
};

/**
 * Stop all polling
 */
export const stopAllPolling = () => {
  pollingIntervals.forEach((interval) => clearInterval(interval));
  pollingIntervals.clear();
  lastPolledData.clear();
  console.log('[Polling] Stopped all polling');
};

/**
 * Listen to polling events
 */
export const onPollingEvent = (event: string, callback: (data: any) => void) => {
  if (!pollingListeners.has(event)) {
    pollingListeners.set(event, []);
  }
  pollingListeners.get(event)!.push(callback);

  return () => {
    const listeners = pollingListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  };
};

const emitPollingEvent = (event: string, data: any) => {
  const listeners = pollingListeners.get(event);
  if (listeners) {
    listeners.forEach((cb) => cb(data));
  }
};
