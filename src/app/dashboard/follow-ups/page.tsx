'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { followUpsAPI } from '@/lib/api';
import { FollowUpReminder, Lead } from '@/lib/types';

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUpReminder[]>([]);
  const [staleLeads, setStaleLeads] = useState<Lead[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'completed'>('all');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fuRes, sugRes] = await Promise.all([
        followUpsAPI.getMyFollowUps(),
        followUpsAPI.getSuggestions(),
      ]);
      setFollowUps(fuRes.data.followUps);
      setStaleLeads(fuRes.data.staleLeads);
      setSuggestions(sugRes.data.suggestions);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleComplete = async (id: string) => {
    try {
      await followUpsAPI.complete(id);
      showToast('Follow-up marked as completed!');
      fetchData();
    } catch {
      showToast('Failed to complete follow-up');
    }
  };

  const filtered = followUps.filter(fu => filter === 'all' || fu.status === filter);

  const counts = {
    all: followUps.length,
    pending: followUps.filter(f => f.status === 'pending').length,
    overdue: followUps.filter(f => f.status === 'overdue').length,
    completed: followUps.filter(f => f.status === 'completed').length,
  };

  const statusStyle = (status: string) => {
    if (status === 'overdue') return 'bg-red-50 border-red-200 border-l-4 border-l-red-500';
    if (status === 'completed') return 'bg-green-50 border-green-100';
    return 'bg-amber-50 border-amber-200 border-l-4 border-l-amber-400';
  };

  const statusBadge = (status: string) => {
    if (status === 'overdue') return 'bg-red-100 text-red-700';
    if (status === 'completed') return 'bg-green-100 text-green-700';
    return 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] px-5 py-3 bg-slate-800 text-white rounded-xl shadow-lg text-sm animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Follow-Ups</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your scheduled reminders and track overdue follow-ups</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {([
          { key: 'all', label: 'Total', icon: 'list', color: 'text-slate-600', bg: 'bg-slate-100' },
          { key: 'pending', label: 'Pending', icon: 'schedule', color: 'text-amber-600', bg: 'bg-amber-100' },
          { key: 'overdue', label: 'Overdue', icon: 'warning', color: 'text-red-600', bg: 'bg-red-100' },
          { key: 'completed', label: 'Completed', icon: 'check_circle', color: 'text-green-600', bg: 'bg-green-100' },
        ] as const).map(({ key, label, icon, color, bg }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
              filter === key
                ? 'border-primary/30 bg-primary/5 shadow-sm'
                : 'border-slate-100 bg-white hover:shadow-sm'
            }`}
          >
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <span className={`material-symbols-outlined ${color} text-[20px]`}>{icon}</span>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">{counts[key]}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[22px]">auto_awesome</span>
            <h2 className="text-base font-semibold text-slate-800">Smart Follow-Up Suggestions</h2>
            <span className="ml-auto text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-full">AI</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((s, i) => (
              <div key={i} className="bg-white/80 rounded-xl p-4 border border-indigo-100 flex gap-3">
                <span className={`material-symbols-outlined text-[22px] mt-0.5 flex-shrink-0 ${
                  s.type === 'urgent' ? 'text-red-500' : 'text-amber-500'
                }`}>
                  {s.type === 'urgent' ? 'priority_high' : 'schedule'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 font-medium">{s.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Suggested: {new Date(s.suggestedDate).toLocaleDateString()}
                  </p>
                  <Link
                    href={`/dashboard/leads/${s.lead._id}`}
                    className="inline-block text-xs text-primary font-semibold mt-2 hover:underline"
                  >
                    View {s.lead.name} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stale Leads Warning */}
      {staleLeads.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-amber-600 text-[20px]">hourglass_empty</span>
            <h2 className="text-base font-semibold text-amber-800">
              Stale Leads ({staleLeads.length}) — No activity in 7+ days
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {staleLeads.map((lead) => (
              <Link
                key={lead._id}
                href={`/dashboard/leads/${lead._id}`}
                className="flex items-center gap-2 bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm text-amber-800 hover:bg-amber-100 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-500">person</span>
                {lead.name}
                <span className="text-xs text-amber-500">
                  · {Math.floor((Date.now() - new Date(lead.lastActivityDate).getTime()) / 86400000)}d ago
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Follow-ups list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 skeleton rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
          <span className="material-symbols-outlined text-slate-300 text-5xl block mb-3">alarm_off</span>
          <p className="text-slate-500 font-medium">No {filter === 'all' ? '' : filter} follow-ups</p>
          <p className="text-slate-400 text-sm mt-1">
            {filter === 'all'
              ? 'Go to a lead and set a follow-up reminder.'
              : `No ${filter} reminders at this time.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((fu) => {
            const lead = fu.leadId as Lead;
            const isOverdue = fu.status === 'overdue';
            const isCompleted = fu.status === 'completed';

            return (
              <div
                key={fu._id}
                className={`bg-white rounded-xl border p-5 transition-all hover:shadow-sm ${statusStyle(fu.status)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Status icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isOverdue ? 'bg-red-100' : isCompleted ? 'bg-green-100' : 'bg-amber-100'
                    }`}>
                      <span className={`material-symbols-outlined text-[20px] ${
                        isOverdue ? 'text-red-600' : isCompleted ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {isOverdue ? 'warning' : isCompleted ? 'check_circle' : 'alarm'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Lead name */}
                      {typeof lead === 'object' && lead?.name ? (
                        <Link
                          href={`/dashboard/leads/${lead._id}`}
                          className="text-base font-semibold text-slate-800 hover:text-primary transition-colors"
                        >
                          {lead.name}
                        </Link>
                      ) : (
                        <span className="text-base font-semibold text-slate-800">Lead</span>
                      )}

                      {/* Dates */}
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className={`text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                          <span className="material-symbols-outlined text-[14px] align-middle mr-1">schedule</span>
                          {new Date(fu.scheduledDate).toLocaleString()}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase ${statusBadge(fu.status)}`}>
                          {fu.status}
                        </span>
                      </div>

                      {/* Notes */}
                      {fu.notes && (
                        <p className="text-sm text-slate-500 mt-2 flex items-start gap-1.5">
                          <span className="material-symbols-outlined text-[14px] mt-0.5 text-slate-400">note</span>
                          {fu.notes}
                        </p>
                      )}

                      {/* Completed at */}
                      {isCompleted && fu.completedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Completed {new Date(fu.completedAt).toLocaleString()}
                        </p>
                      )}

                      {/* Lead info */}
                      {typeof lead === 'object' && lead?.phone && (
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">phone</span>
                            {lead.phone}
                          </span>
                          {lead.propertyInterest && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">home</span>
                              {lead.propertyInterest}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {typeof lead === 'object' && lead?._id && (
                      <>
                        <Link
                          href={`/dashboard/leads/${lead._id}`}
                          className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          View Lead
                        </Link>
                        {typeof lead === 'object' && lead?.phone && (
                          <a
                            href={`https://wa.me/92${(lead.phone || '').replace(/\D/g, '').replace(/^0/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold text-green-600 border border-green-200 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[14px]">chat</span>
                            WhatsApp
                          </a>
                        )}
                      </>
                    )}
                    {!isCompleted && (
                      <button
                        onClick={() => handleComplete(fu._id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 border border-emerald-200 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
