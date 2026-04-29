export type UserRole = 'Admin' | 'Agent';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export type LeadScore = 'High' | 'Medium' | 'Low';
export type LeadStatus = 'New' | 'Assigned' | 'In Progress' | 'Closed';

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  propertyInterest: string;
  budget: number;
  score: LeadScore;
  status: LeadStatus;
  notes?: string;
  assignedTo?: User | null;
  source?: string;
  isStale?: boolean;
  lastActivityDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  _id: string;
  leadId: string;
  action: string;
  performedBy: User;
  details?: object;
  description: string;
  createdAt: string;
}

export interface FollowUpReminder {
  _id: string;
  leadId: Lead | string;
  agentId: User;
  scheduledDate: string;
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
  completedAt?: string;
  createdAt: string;
}

export interface AnalyticsOverview {
  totalLeads: number;
  statusCounts: Record<string, number>;
  scoreCounts: Record<string, number>;
  leadsThisMonth: number;
  activeAgents: number;
}

export interface AgentPerformance {
  agent: { _id: string; name: string; email: string };
  assigned: number;
  inProgress: number;
  closed: number;
  scores: Record<string, number>;
  conversionRate: number;
}
