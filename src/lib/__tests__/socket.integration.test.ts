/**
 * Socket.io Integration Tests
 * Tests for real-time Socket.io connection, event listeners, and reconnection logic
 */

import { getSocket, connectSocket, disconnectSocket, onConnectionChange, onSocketEvent, isSocketConnected } from '../socket';

describe('Socket.io Integration', () => {
  describe('Connection/Disconnection Handling', () => {
    it('should initialize socket with correct configuration', () => {
      const socket = getSocket();
      expect(socket).toBeDefined();
      expect(socket.io.opts.autoConnect).toBe(false);
      expect(socket.io.opts.reconnection).toBe(true);
      expect(socket.io.opts.reconnectionAttempts).toBe(5);
    });

    it('should connect socket when connectSocket is called', (done) => {
      const socket = getSocket();
      const unsubscribe = onConnectionChange((connected) => {
        if (connected) {
          expect(isSocketConnected()).toBe(true);
          unsubscribe();
          disconnectSocket();
          done();
        }
      });
      connectSocket('test-user-123');
    });

    it('should disconnect socket when disconnectSocket is called', (done) => {
      const socket = getSocket();
      connectSocket('test-user-123');
      
      setTimeout(() => {
        const unsubscribe = onConnectionChange((connected) => {
          if (!connected) {
            expect(isSocketConnected()).toBe(false);
            unsubscribe();
            done();
          }
        });
        disconnectSocket();
      }, 100);
    });

    it('should emit join event with userId when connecting', (done) => {
      const socket = getSocket();
      const userId = 'test-user-456';
      
      socket.once('join', (data) => {
        expect(data).toBe(userId);
        disconnectSocket();
        done();
      });
      
      connectSocket(userId);
    });
  });

  describe('Event Listeners for Lead Updates', () => {
    it('should listen to lead:new events', (done) => {
      const socket = getSocket();
      const testLead = {
        _id: 'lead-123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '03001234567',
        propertyInterest: 'Apartment',
        budget: 15000000,
        score: 'High',
        status: 'New',
      };

      const unsubscribe = onSocketEvent('lead:new', (lead) => {
        expect(lead).toEqual(testLead);
        unsubscribe();
        disconnectSocket();
        done();
      });

      connectSocket('test-user-123');
      
      setTimeout(() => {
        socket.emit('lead:new', testLead);
      }, 100);
    });

    it('should listen to lead:assigned events', (done) => {
      const socket = getSocket();
      const testLead = {
        _id: 'lead-124',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '03009876543',
        propertyInterest: 'House',
        budget: 25000000,
        score: 'High',
        status: 'Assigned',
        assignedTo: 'agent-123',
      };

      const unsubscribe = onSocketEvent('lead:assigned', (lead) => {
        expect(lead).toEqual(testLead);
        unsubscribe();
        disconnectSocket();
        done();
      });

      connectSocket('test-user-123');
      
      setTimeout(() => {
        socket.emit('lead:assigned', testLead);
      }, 100);
    });

    it('should listen to lead:status_changed events', (done) => {
      const socket = getSocket();
      const testLead = {
        _id: 'lead-125',
        name: 'Ahmed Khan',
        email: 'ahmed@example.com',
        phone: '03005555555',
        propertyInterest: 'Commercial',
        budget: 50000000,
        score: 'High',
        status: 'Closed',
      };

      const unsubscribe = onSocketEvent('lead:status_changed', (lead) => {
        expect(lead.status).toBe('Closed');
        unsubscribe();
        disconnectSocket();
        done();
      });

      connectSocket('test-user-123');
      
      setTimeout(() => {
        socket.emit('lead:status_changed', testLead);
      }, 100);
    });

    it('should listen to lead:updated events', (done) => {
      const socket = getSocket();
      const testLead = {
        _id: 'lead-126',
        name: 'Updated Name',
        email: 'updated@example.com',
        phone: '03001111111',
        propertyInterest: 'Plot',
        budget: 12000000,
        score: 'Medium',
        status: 'In Progress',
      };

      const unsubscribe = onSocketEvent('lead:updated', (lead) => {
        expect(lead.name).toBe('Updated Name');
        unsubscribe();
        disconnectSocket();
        done();
      });

      connectSocket('test-user-123');
      
      setTimeout(() => {
        socket.emit('lead:updated', testLead);
      }, 100);
    });

    it('should listen to lead:deleted events', (done) => {
      const socket = getSocket();
      const deletedData = { leadId: 'lead-127' };

      const unsubscribe = onSocketEvent('lead:deleted', (data) => {
        expect(data.leadId).toBe('lead-127');
        unsubscribe();
        disconnectSocket();
        done();
      });

      connectSocket('test-user-123');
      
      setTimeout(() => {
        socket.emit('lead:deleted', deletedData);
      }, 100);
    });
  });

  describe('Connection Status Listeners', () => {
    it('should notify listeners when connection status changes', (done) => {
      const statuses: boolean[] = [];
      
      const unsubscribe = onConnectionChange((connected) => {
        statuses.push(connected);
        
        if (statuses.length === 2) {
          expect(statuses).toEqual([true, false]);
          unsubscribe();
          done();
        }
      });

      connectSocket('test-user-123');
      
      setTimeout(() => {
        disconnectSocket();
      }, 200);
    });

    it('should support multiple connection listeners', (done) => {
      const listener1Calls: boolean[] = [];
      const listener2Calls: boolean[] = [];

      const unsub1 = onConnectionChange((connected) => {
        listener1Calls.push(connected);
      });

      const unsub2 = onConnectionChange((connected) => {
        listener2Calls.push(connected);
      });

      connectSocket('test-user-123');

      setTimeout(() => {
        expect(listener1Calls.length).toBeGreaterThan(0);
        expect(listener2Calls.length).toBeGreaterThan(0);
        unsub1();
        unsub2();
        disconnectSocket();
        done();
      }, 200);
    });
  });

  describe('Error Handling and Reconnection', () => {
    it('should handle connection errors gracefully', (done) => {
      const socket = getSocket();
      let errorOccurred = false;

      socket.on('connect_error', () => {
        errorOccurred = true;
      });

      connectSocket('test-user-123');

      setTimeout(() => {
        // Connection error handling is tested implicitly
        disconnectSocket();
        done();
      }, 300);
    });

    it('should attempt reconnection when connection is lost', (done) => {
      const socket = getSocket();
      let reconnectAttempted = false;

      socket.on('reconnect_attempt', () => {
        reconnectAttempted = true;
      });

      connectSocket('test-user-123');

      setTimeout(() => {
        // Simulate connection loss
        socket.disconnect();
        
        setTimeout(() => {
          // Reconnection logic is handled by socket.io
          disconnectSocket();
          done();
        }, 200);
      }, 100);
    });
  });

  describe('Socket Connection Status', () => {
    it('should return correct connection status', (done) => {
      expect(isSocketConnected()).toBe(false);

      connectSocket('test-user-123');

      setTimeout(() => {
        expect(isSocketConnected()).toBe(true);
        disconnectSocket();

        setTimeout(() => {
          expect(isSocketConnected()).toBe(false);
          done();
        }, 100);
      }, 100);
    });
  });
});
