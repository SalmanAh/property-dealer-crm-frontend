'use client';
import { useState, useEffect } from 'react';
import { analyticsAPI } from '@/lib/api';
import { AnalyticsOverview, AgentPerformance, ActivityLog } from '@/lib/types';

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [agents, setAgents] = useState<AgentPerformance[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      const [o, a, ac] = await Promise.all([
        analyticsAPI.getOverview(params),
        analyticsAPI.getAgentPerformance(),
        analyticsAPI.getRecentActivity(),
      ]);
      setOverview(o.data);
      setAgents(a.data.performance);
      setActivity(ac.data.activities);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [dateFrom, dateTo]);

  const total = overview?.totalLeads || 1;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time insights into your CRM performance</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />
          <span className="text-slate-400 text-sm">to</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none" />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-sm text-slate-500 hover:text-slate-800">Clear</button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 skeleton rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Leads', value: overview?.totalLeads ?? 0, icon: 'groups', color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'This Month', value: overview?.leadsThisMonth ?? 0, icon: 'calendar_month', color: 'text-blue-600', bg: 'bg-blue-100' },
            { label: 'Active Agents', value: overview?.activeAgents ?? 0, icon: 'people', color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { label: 'High Priority', value: overview?.scoreCounts?.High ?? 0, icon: 'priority_high', color: 'text-red-600', bg: 'bg-red-100' },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                <span className={`material-symbols-outlined ${color} text-[20px]`}>{icon}</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{value}</div>
              <div className="text-sm text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Status & Score Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-5">Lead Status Breakdown</h3>
          <div className="space-y-4">
            {[
              { label: 'New', color: 'bg-purple-500' },
              { label: 'Assigned', color: 'bg-blue-500' },
              { label: 'In Progress', color: 'bg-amber-500' },
              { label: 'Closed', color: 'bg-emerald-500' },
            ].map(({ label, color }) => {
              const count = overview?.statusCounts?.[label] ?? 0;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{label}</span>
                    <span className="font-semibold text-slate-700">{count} ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-base font-semibold text-slate-800 mb-5">Priority Distribution</h3>
          <div className="space-y-4">
            {[
              { label: 'High', color: 'bg-red-400', textColor: 'text-red-600' },
              { label: 'Medium', color: 'bg-blue-400', textColor: 'text-blue-600' },
              { label: 'Low', color: 'bg-slate-300', textColor: 'text-slate-500' },
            ].map(({ label, color, textColor }) => {
              const count = overview?.scoreCounts?.[label] ?? 0;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${textColor}`}>{label}</span>
                    <span className="font-semibold text-slate-700">{count} ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">Agent Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Agent</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">In Progress</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Closed</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {agents.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">No agent data</td></tr>
              ) : (
                agents.map((ap) => (
                  <tr key={ap.agent._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {ap.agent.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{ap.agent.name}</div>
                          <div className="text-xs text-slate-400">{ap.agent.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{ap.assigned}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{ap.inProgress}</td>
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
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-5">Recent System Activity</h3>
        <div className="space-y-3">
          {activity.slice(0, 10).map((a) => (
            <div key={a._id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
              <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-slate-700">{a.description}</p>
                <p className="text-xs text-slate-400 mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
