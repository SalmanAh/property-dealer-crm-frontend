'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { leadsAPI, followUpsAPI } from '@/lib/api';
import { Lead, FollowUpReminder } from '@/lib/types';
import { ScoreBadge, StatusBadge } from '@/components/common/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function AgentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpReminder[]>([]);
  const [staleLeads, setStaleLeads] = useState<Lead[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'Agent') {
      router.push('/dashboard/admin');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [leadsRes, followUpsRes, suggestionsRes] = await Promise.all([
        leadsAPI.getAll({ limit: 50 }),
        followUpsAPI.getMyFollowUps(),
        followUpsAPI.getSuggestions(),
      ]);
      setLeads(leadsRes.data.leads);
      setFollowUps(followUpsRes.data.followUps);
      setStaleLeads(followUpsRes.data.staleLeads);
      setSuggestions(suggestionsRes.data.suggestions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const pendingFollowUps = followUps.filter((f) => f.status === 'pending');
  const overdueFollowUps = followUps.filter((f) => f.status === 'overdue');

  const todayFollowUps = pendingFollowUps.filter((f) => {
    const d = new Date(f.scheduledDate);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  const getWhatsAppLink = (phone: string) => {
    let p = phone.replace(/\D/g, '');
    if (p.startsWith('0')) p = '92' + p.slice(1);
    return `https://wa.me/${p}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 skeleton rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-40 skeleton rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here&apos;s your lead summary for today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[24px]">person_search</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{leads.length}</div>
            <div className="text-sm text-slate-500">Assigned Leads</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-amber-600 text-[24px]">alarm</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{todayFollowUps.length}</div>
            <div className="text-sm text-slate-500">Follow-ups Today</div>
          </div>
        </div>
        <div className={`rounded-xl p-5 border shadow-sm flex items-center gap-4 ${overdueFollowUps.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${overdueFollowUps.length > 0 ? 'bg-red-100' : 'bg-slate-100'}`}>
            <span className={`material-symbols-outlined text-[24px] ${overdueFollowUps.length > 0 ? 'text-red-600' : 'text-slate-500'}`}>warning</span>
          </div>
          <div>
            <div className={`text-2xl font-bold ${overdueFollowUps.length > 0 ? 'text-red-700' : 'text-slate-800'}`}>{overdueFollowUps.length}</div>
            <div className="text-sm text-slate-500">Overdue Follow-ups</div>
          </div>
        </div>
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-primary/5 to-indigo-50 rounded-xl border border-primary/20 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">lightbulb</span>
            <h3 className="font-semibold text-slate-800">Smart Suggestions</h3>
          </div>
          <div className="space-y-2">
            {suggestions.slice(0, 3).map((s, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/60 rounded-lg p-3">
                <span className={`material-symbols-outlined text-[18px] mt-0.5 ${s.type === 'urgent' ? 'text-red-500' : 'text-amber-500'}`}>
                  {s.type === 'urgent' ? 'priority_high' : 'schedule'}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-slate-700">{s.message}</p>
                  <Link href={`/dashboard/leads/${s.lead._id}`} className="text-xs text-primary hover:underline mt-1 block">
                    View {s.lead.name} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overdue Follow-ups */}
      {overdueFollowUps.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            Overdue Follow-ups
          </h2>
          <div className="space-y-3">
            {overdueFollowUps.map((fu) => {
              const lead = fu.leadId as Lead;
              return (
                <div key={fu._id} className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-red-800">{typeof lead === 'object' ? lead.name : 'Lead'}</p>
                    <p className="text-xs text-red-600">Due: {new Date(fu.scheduledDate).toLocaleString()}</p>
                    {fu.notes && <p className="text-xs text-red-500 mt-1">{fu.notes}</p>}
                  </div>
                  <Link
                    href={`/dashboard/leads/${typeof lead === 'object' ? lead._id : lead}`}
                    className="text-xs font-semibold text-red-700 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors flex-shrink-0"
                  >
                    View Lead
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stale leads */}
      {staleLeads.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-amber-700 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">hourglass_empty</span>
            Stale Leads (No activity 7+ days)
          </h2>
          <div className="flex gap-3 flex-wrap">
            {staleLeads.map((lead) => (
              <Link key={lead._id} href={`/dashboard/leads/${lead._id}`}
                className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors">
                {lead.name} · <ScoreBadge score={lead.score} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* My Leads Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">My Leads</h2>
          <Link href="/dashboard/leads" className="text-primary text-sm font-semibold hover:underline">View All</Link>
        </div>
        {leads.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
            <span className="material-symbols-outlined text-slate-300 text-5xl block mb-3">person_search</span>
            <p className="text-slate-400">No leads assigned yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leads.map((lead) => (
              <div key={lead._id} className={`bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition-shadow ${lead.score === 'High' ? 'border-red-200 border-l-4 border-l-red-400' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-800">{lead.name}</div>
                      <div className="text-xs text-slate-400">{lead.phone}</div>
                    </div>
                  </div>
                  <ScoreBadge score={lead.score} />
                </div>
                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-slate-400">home</span>
                    <span className="truncate">{lead.propertyInterest}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-slate-400">payments</span>
                    PKR {lead.budget?.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={lead.status} />
                  <div className="flex items-center gap-2">
                    <a href={getWhatsAppLink(lead.phone)} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                    </a>
                    <Link href={`/dashboard/leads/${lead._id}`}
                      className="px-3 py-1.5 text-xs font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors">
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
