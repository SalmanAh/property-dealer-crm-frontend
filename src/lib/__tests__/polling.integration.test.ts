/**
 * Polling Integration Tests
 * Tests for polling mechanism, fallback behavior, and event detection
 */

import {
  setPollingInterval,
  getPollingInterval,
  setPollingEnabled,
  startLeadsPolling,
  stopLeadsPolling,
  startLeadPolling,
  stopLeadPolling,
  stopAllPolling,
  onPollingEvent,
} from '../polling';

// Mock the API
jest.mock('../api', () => ({
  leadsAPI: {
    getAll: jest.fn(),
    getById: jest.fn(),
  },
}));

import { leadsAPI } from '../api';

describe('Polling Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    stopAllPolling();
  });

  afterEach(() => {
    stopAllPolling();
  });

  describe('Polling Configuration', () => {
    it('should set and get polling interval', () => {
      setPollingInterval(3000);
      expect(getPollingInterval()).toBe(3000);

      setPollingInterval(5000);
      expect(getPollingInterval()).toBe(5000);
    });

    it('should enable/disable polling', () => {
      setPollingEnabled(true);
      // Polling state is internal, but we can verify it doesn't throw
      expect(() => setPollingEnabled(false)).not.toThrow();
    });

    it('should have default polling interval of 5000ms', () => {
      expect(getPollingInterval()).toBe(5000);
    });
  });

  describe('Leads Polling', () => {
    it('should start polling for leads', (done) => {
      const mockLeads = [
        {
          _id: 'lead-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '03001234567',
          propertyInterest: 'Apartment',
          budget: 15000000,
          score: 'High',
          status: 'New',
        },
      ];

      (leadsAPI.getAll as jest.Mock).mockResolvedValue({ data: mockLeads });

      startLeadsPolling();

      setTimeout(() => {
        expect(leadsAPI.getAll).toHaveBeenCalled();
        stopLeadsPolling();
        done();
      }, 100);
    });

    it('should detect new leads during polling', (done) => {
      const initialLeads = [
        {
          _id: 'lead-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '03001234567',
          propertyInterest: 'Apartment',
          budget: 15000000,
          score: 'High',
          status: 'New',
        },
      ];

      const newLeads = [
        ...initialLeads,
        {
          _id: 'lead-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '03009876543',
          propertyInterest: 'House',
          budget: 25000000,
          score: 'High',
          status: 'New',
        },
      ];

      let callCount = 0;
      (leadsAPI.getAll as jest.Mock).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          data: callCount === 1 ? initialLeads : newLeads,
        });
      });

      const unsubscribe = onPollingEvent('lead:new', (lead) => {
        expect(lead._id).toBe('lead-2');
        unsubscribe();
        stopLeadsPolling();
        done();
      });

      startLeadsPolling();
      setPollingInterval(50); // Speed up for testing
    });

    it('should detect lead updates during polling', (done) => {
      const initialLead = {
        _id: 'lead-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '03001234567',
        propertyInterest: 'Apartment',
        budget: 15000000,
        score: 'High',
        status: 'New',
      };

      const updatedLead = {
        ...initialLead,
        name: 'John Updated',
        budget: 20000000,
      };

      let callCount = 0;
      (leadsAPI.getAll as jest.Mock).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          data: callCount === 1 ? [initialLead] : [updatedLead],
        });
      });

      const unsubscribe = onPollingEvent('lead:updated', (lead) => {
        expect(lead.name).toBe('John Updated');
        unsubscribe();
        stopLeadsPolling();
        done();
      });

      startLeadsPolling();
      setPollingInterval(50);
    });

    it('should detect status changes during polling', (done) => {
      const initialLead = {
        _id: 'lead-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '03001234567',
        propertyInterest: 'Apartment',
        budget: 15000000,
        score: 'High',
        status: 'New',
      };

      const statusChangedLead = {
        ...initialLead,
        status: 'Closed',
      };

      let callCount = 0;
      (leadsAPI.getAll as jest.Mock).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          data: callCount === 1 ? [initialLead] : [statusChangedLead],
        });
      });

      const unsubscribe = onPollingEvent('lead:status_changed', (lead) => {
        expect(lead.status).toBe('Closed');
        unsubscribe();
        stopLeadsPolling();
        done();
      });

      startLeadsPolling();
      setPollingInterval(50);
    });

    it('should detect deleted leads during polling', (done) => {
      const initialLeads = [
        {
          _id: 'lead-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '03001234567',
          propertyInterest: 'Apartment',
          budget: 15000000,
          score: 'High',
          status: 'New',
        },
        {
          _id: 'lead-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '03009876543',
          propertyInterest: 'House',
          budget: 25000000,
          score: 'High',
          status: 'New',
        },
      ];

      const afterDeleteLeads = [initialLeads[0]]; // lead-2 deleted

      let callCount = 0;
      (leadsAPI.getAll as jest.Mock).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          data: callCount === 1 ? initialLeads : afterDeleteLeads,
        });
      });

      const unsubscribe = onPollingEvent('lead:deleted', (data) => {
        expect(data.leadId).toBe('lead-2');
        unsubscribe();
        stopLeadsPolling();
        done();
      });

      startLeadsPolling();
      setPollingInterval(50);
    });

    it('should stop polling for leads', (done) => {
      (leadsAPI.getAll as jest.Mock).mockResolvedValue({
        data: [
          {
            _id: 'lead-1',
            name: 'John Doe',
            email: 'john@example.com',
            phone: '03001234567',
            propertyInterest: 'Apartment',
            budget: 15000000,
            score: 'High',
            status: 'New',
          },
        ],
      });

      startLeadsPolling();
      const callCountBefore = (leadsAPI.getAll as jest.Mock).mock.calls.length;

      setTimeout(() => {
        stopLeadsPolling();
        const callCountAfter = (leadsAPI.getAll as jest.Mock).mock.calls.length;

        setTimeout(() => {
          const callCountFinal = (leadsAPI.getAll as jest.Mock).mock.calls.length;
          expect(callCountFinal).toBe(callCountAfter); // No more calls after stop
          done();
        }, 100);
      }, 100);
    });
  });

  describe('Specific Lead Polling', () => {
    it('should start polling for a specific lead', (done) => {
      const mockLead = {
        _id: 'lead-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '03001234567',
        propertyInterest: 'Apartment',
        budget: 15000000,
        score: 'High',
        status: 'New',
      };

      (leadsAPI.getById as jest.Mock).mockResolvedValue({ data: mockLead });

      startLeadPolling('lead-1');

      setTimeout(() => {
        expect(leadsAPI.getById).toHaveBeenCalledWith('lead-1');
        stopLeadPolling('lead-1');
        done();
      }, 100);
    });

    it('should detect updates for specific lead', (done) => {
      const initialLead = {
        _id: 'lead-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '03001234567',
        propertyInterest: 'Apartment',
        budget: 15000000,
        score: 'High',
        status: 'New',
      };

      const updatedLead = {
        ...initialLead,
        status: 'In Progress',
      };

      let callCount = 0;
      (leadsAPI.getById as jest.Mock).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          data: callCount === 1 ? initialLead : updatedLead,
        });
      });

      const unsubscribe = onPollingEvent('lead:1:status_changed', (lead) => {
        expect(lead.status).toBe('In Progress');
        unsubscribe();
        stopLeadPolling('lead-1');
        done();
      });

      startLeadPolling('lead-1');
      setPollingInterval(50);
    });

    it('should stop polling for specific lead', (done) => {
      (leadsAPI.getById as jest.Mock).mockResolvedValue({
        data: {
          _id: 'lead-1',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '03001234567',
          propertyInterest: 'Apartment',
          budget: 15000000,
          score: 'High',
          status: 'New',
        },
      });

      startLeadPolling('lead-1');
      const callCountBefore = (leadsAPI.getById as jest.Mock).mock.calls.length;

      setTimeout(() => {
        stopLeadPolling('lead-1');
        const callCountAfter = (leadsAPI.getById as jest.Mock).mock.calls.length;

        setTimeout(() => {
          const callCountFinal = (leadsAPI.getById as jest.Mock).mock.calls.length;
          expect(callCountFinal).toBe(callCountAfter); // No more calls after stop
          done();
        }, 100);
      }, 100);
    });
  });

  describe('Polling Event Listeners', () => {
    it('should support multiple polling event listeners', (done) => {
      const listener1Events: any[] = [];
      const listener2Events: any[] = [];

      const unsub1 = onPollingEvent('lead:new', (lead) => {
        listener1Events.push(lead);
      });

      const unsub2 = onPollingEvent('lead:new', (lead) => {
        listener2Events.push(lead);
      });

      const testLead = {
        _id: 'lead-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '03001234567',
        propertyInterest: 'Apartment',
        budget: 15000000,
        score: 'High',
        status: 'New',
      };

      (leadsAPI.getAll as jest.Mock).mockResolvedValue({ data: [testLead] });

      startLeadsPolling();

      setTimeout(() => {
        expect(listener1Events.length).toBeGreaterThan(0);
        expect(listener2Events.length).toBeGreaterThan(0);
        unsub1();
        unsub2();
        stopLeadsPolling();
        done();
      }, 100);
    });
  });

  describe('Stop All Polling', () => {
    it('should stop all active polling', (done) => {
      (leadsAPI.getAll as jest.Mock).mockResolvedValue({ data: [] });
      (leadsAPI.getById as jest.Mock).mockResolvedValue({ data: {} });

      startLeadsPolling();
      startLeadPolling('lead-1');

      setTimeout(() => {
        stopAllPolling();

        const callCountBefore = (leadsAPI.getAll as jest.Mock).mock.calls.length;

        setTimeout(() => {
          const callCountAfter = (leadsAPI.getAll as jest.Mock).mock.calls.length;
          expect(callCountAfter).toBe(callCountBefore); // No more calls
          done();
        }, 100);
      }, 100);
    });
  });
});
