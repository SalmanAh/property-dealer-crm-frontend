'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { analyticsAPI } from '@/lib/api';
import { AnalyticsOverview, AgentPerformance, ActivityLog } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface StatCardProps {
  icon: string;
  iconColor: string;
  label: string;
  value: number | string;
  badge?: string;
  badgeColor?: string;
}

function StatCard({ icon, iconColor, label, value, badge, badgeColor }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className={`material-symbols-outlined text-3xl ${iconColor}`}>{icon}</span>
        {badge && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${badgeColor}`}>{badge}</span>
        )}
      </div>
      <span className="text-sm text-slate-500 font-medium">{label}</span>
      <span className="text-4xl font-bold text-slate-800">{value}</span>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'Admin') {
      router.push('/dashboard/agent');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [overviewRes, agentsRes, activityRes] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getAgentPerformance(),
        analyticsAPI.getRecentActivity(),
      ]);
      setOverview(overviewRes.data);
      setAgentPerformance(agentsRes.data.performance);
      setRecentActivity(activityRes.data.activities);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action: string) => {
    const icons: Record<string, { icon: string; color: string }> = {
      created: { icon: 'add_circle', color: 'text-primary' },
      assigned: { icon: 'person_add', color: 'text-blue-500' },
      status_changed: { icon: 'swap_horiz', color: 'text-amber-500' },
      note_added: { icon: 'note_add', color: 'text-purple-500' },
      deleted: { icon: 'delete', color: 'text-red-500' },
      updated: { icon: 'edit', color: 'text-slate-500' },
    };
    return icons[action] || { icon: 'circle', color: 'text-slate-300' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl h-32 skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back, {user?.name}. Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <Link
          href="/dashboard/leads/new"
          className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#494bd6] transition-all active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Lead
        </Link>
      </div>

      {/* Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="groups"
          iconColor="text-primary"
          label="Total Leads"
          value={overview?.totalLeads ?? 0}
          badge="+12%"
          badgeColor="bg-primary/10 text-primary"
        />
        <StatCard
          icon="priority_high"
          iconColor="text-red-500"
          label="High Priority"
          value={overview?.scoreCounts?.High ?? 0}
          badge="High"
          badgeColor="bg-red-50 text-red-600"
        />
        <StatCard
          icon="person_check"
          iconColor="text-emerald-600"
          label="Active Agents"
          value={overview?.activeAgents ?? 0}
          badge="Active"
          badgeColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon="assignment_turned_in"
          iconColor="text-amber-600"
          label="Closed This Month"
          value={overview?.leadsThisMonth ?? 0}
          badge="Monthly"
          badgeColor="bg-amber-50 text-amber-600"
        />
      </section>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Lead Status Distribution</h3>
            <span className="material-symbols-outlined text-slate-400 cursor-pointer">more_horiz</span>
          </div>
          <div className="space-y-4">
            {[
              { label: 'New', key: 'New', color: 'bg-purple-500' },
              { label: 'Assigned', key: 'Assigned', color: 'bg-blue-500' },
              { label: 'In Progress', key: 'In Progress', color: 'bg-amber-500' },
              { label: 'Closed', key: 'Closed', color: 'bg-emerald-500' },
            ].map(({ label, key, color }) => {
              const count = overview?.statusCounts?.[key] ?? 0;
              const total = overview?.totalLeads || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 w-24 flex-shrink-0">{label}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 w-12 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Priority Breakdown</h3>
          </div>
          <div className="flex items-end justify-around gap-4 h-48 px-4">
            {[
              { label: 'High', key: 'High', color: 'bg-red-400' },
              { label: 'Medium', key: 'Medium', color: 'bg-blue-400' },
              { label: 'Low', key: 'Low', color: 'bg-slate-300' },
            ].map(({ label, key, color }) => {
              const count = overview?.scoreCounts?.[key] ?? 0;
              const max = Math.max(1, ...['High', 'Medium', 'Low'].map((k) => overview?.scoreCounts?.[k] ?? 0));
              const heightPct = Math.max(5, Math.round((count / max) * 100));
              return (
                <div key={key} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-sm font-bold text-slate-700">{count}</span>
                  <div className="w-full flex flex-col justify-end" style={{ height: '140px' }}>
                    <div
                      className={`w-full ${color} rounded-t-lg transition-all duration-700`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agent Performance + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-lg font-semibold text-slate-800">Agent Performance</h3>
            <Link href="/dashboard/agents" className="text-primary text-sm font-semibold hover:underline">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Agent</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Closed</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agentPerformance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">No agents yet</td>
                  </tr>
                ) : (
                  agentPerformance.map((ap) => (
                    <tr key={ap.agent._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                            {ap.agent.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800">{ap.agent.name}</div>
                            <div className="text-xs text-slate-500">{ap.agent.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{ap.assigned}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{ap.closed}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${ap.conversionRate}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-700 w-10">{ap.conversionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Recent Activity</h3>
            <span className="material-symbols-outlined text-slate-400">history</span>
          </div>
          <div className="relative space-y-6">
            <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100" />
            {recentActivity.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No recent activity</p>
            ) : (
              recentActivity.slice(0, 6).map((activity) => {
                const { icon, color } = getActivityIcon(activity.action);
                return (
                  <div key={activity._id} className="relative pl-10">
                    <div className={`absolute left-2.5 top-1 w-3 h-3 rounded-full ring-4 ring-white ${color.replace('text-', 'bg-')}`} />
                    <div className="text-xs text-slate-400 mb-1">{new Date(activity.createdAt).toLocaleString()}</div>
                    <p className="text-sm text-slate-700">{activity.description}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
