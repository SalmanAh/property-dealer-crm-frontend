'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { leadsAPI, usersAPI, followUpsAPI } from '@/lib/api';
import { Lead, ActivityLog, FollowUpReminder, User } from '@/lib/types';
import { ScoreBadge, StatusBadge } from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/contexts/AuthContext';

const actionLabels: Record<string, string> = {
  created: 'Lead Created', updated: 'Lead Updated', assigned: 'Lead Assigned',
  status_changed: 'Status Changed', note_added: 'Note Added', deleted: 'Lead Deleted',
  follow_up_completed: 'Follow-up Completed', email_sent: 'Email Sent', score_changed: 'Score Changed',
};

const actionIcons: Record<string, { icon: string; bg: string; text: string }> = {
  created: { icon: 'add_circle', bg: 'bg-primary/10', text: 'text-primary' },
  assigned: { icon: 'person_add', bg: 'bg-blue-100', text: 'text-blue-600' },
  status_changed: { icon: 'swap_horiz', bg: 'bg-amber-100', text: 'text-amber-600' },
  note_added: { icon: 'note_add', bg: 'bg-purple-100', text: 'text-purple-600' },
  deleted: { icon: 'delete', bg: 'bg-red-100', text: 'text-red-600' },
  updated: { icon: 'edit', bg: 'bg-slate-100', text: 'text-slate-600' },
  follow_up_completed: { icon: 'check_circle', bg: 'bg-green-100', text: 'text-green-600' },
  score_changed: { icon: 'trending_up', bg: 'bg-orange-100', text: 'text-orange-600' },
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpReminder[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchLead = async () => {
    try {
      const res = await leadsAPI.getById(id);
      setLead(res.data.lead);
      setActivities(res.data.activities);
      setFollowUps(res.data.followUps);
    } catch (err) {
      router.push('/dashboard/leads');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchLead();
    if (user?.role === 'Admin') {
      usersAPI.getAgents().then((r) => setAgents(r.data.agents)).catch(() => {});
    }
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await leadsAPI.addNote(id, note);
      setShowNoteModal(false);
      setNote('');
      showToast('Note added');
      fetchLead();
    } catch (err: any) { showToast(err.response?.data?.error || 'Failed'); }
    finally { setActionLoading(false); }
  };

  const handleSetFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await followUpsAPI.create({ leadId: id, scheduledDate: followUpDate, notes: followUpNote });
      setShowFollowUpModal(false);
      setFollowUpDate(''); setFollowUpNote('');
      showToast('Follow-up scheduled');
      fetchLead();
    } catch (err: any) { showToast(err.response?.data?.error || 'Failed'); }
    finally { setActionLoading(false); }
  };

  const handleAssign = async () => {
    setActionLoading(true);
    try {
      await leadsAPI.assign(id, selectedAgent);
      setShowAssignModal(false);
      showToast('Lead assigned');
      fetchLead();
    } catch (err: any) { showToast(err.response?.data?.error || 'Failed'); }
    finally { setActionLoading(false); }
  };

  const handleStatusChange = async () => {
    setActionLoading(true);
    try {
      await leadsAPI.update(id, { status: selectedStatus });
      setShowStatusModal(false);
      showToast('Status updated');
      fetchLead();
    } catch (err: any) { showToast(err.response?.data?.error || 'Failed'); }
    finally { setActionLoading(false); }
  };

  const getWhatsAppLink = (phone: string) => {
    let p = phone.replace(/\D/g, '');
    if (p.startsWith('0')) p = '92' + p.slice(1);
    else if (!p.startsWith('92')) p = '92' + p;
    return `https://wa.me/${p}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 skeleton rounded w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-xl h-80 skeleton" />
          <div className="lg:col-span-2 bg-white rounded-xl h-80 skeleton" />
        </div>
      </div>
    );
  }

  if (!lead) return null;

  const assignedAgent = lead.assignedTo as User | null;

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] px-5 py-3 bg-slate-800 text-white rounded-xl shadow-lg text-sm animate-fade-in">{toast}</div>
      )}

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard/leads" className="hover:text-primary transition-colors">Leads</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-slate-800 font-medium">{lead.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Info Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            {/* Avatar & name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
                {lead.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">{lead.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <ScoreBadge score={lead.score} />
                  <StatusBadge status={lead.status} />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <span className="material-symbols-outlined text-[18px] text-slate-400">mail</span>
                {lead.email}
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <span className="material-symbols-outlined text-[18px] text-slate-400">phone</span>
                {lead.phone}
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <span className="material-symbols-outlined text-[18px] text-slate-400">home</span>
                {lead.propertyInterest}
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <span className="material-symbols-outlined text-[18px] text-slate-400">payments</span>
                <span className="font-semibold">PKR {lead.budget?.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <span className="material-symbols-outlined text-[18px] text-slate-400">person</span>
                {assignedAgent ? assignedAgent.name : <span className="text-slate-400 italic">Unassigned</span>}
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-xs">
                <span className="material-symbols-outlined text-[16px]">schedule</span>
                Created {new Date(lead.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Notes */}
            {lead.notes && (
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Notes</p>
                <p className="text-sm text-slate-600">{lead.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-2">
              <a
                href={getWhatsAppLink(lead.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Chat on WhatsApp
              </a>
              <button
                onClick={() => setShowNoteModal(true)}
                className="flex items-center justify-center gap-2 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">note_add</span>
                Add Note
              </button>
              {user?.role === 'Agent' && (
                <button
                  onClick={() => setShowFollowUpModal(true)}
                  className="flex items-center justify-center gap-2 border border-primary/30 text-primary py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">alarm_add</span>
                  Set Follow-Up
                </button>
              )}
              {user?.role === 'Admin' && (
                <>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="flex items-center justify-center gap-2 border border-blue-200 text-blue-600 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">person_add</span>
                    Assign Lead
                  </button>
                  <button
                    onClick={() => { setSelectedStatus(lead.status); setShowStatusModal(true); }}
                    className="flex items-center justify-center gap-2 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                    Change Status
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Follow-Ups Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Follow-Ups</h3>
            {followUps.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-2">No follow-ups scheduled</p>
            ) : (
              <div className="space-y-3">
                {followUps.map((fu) => (
                  <div key={fu._id} className={`p-3 rounded-lg border text-sm ${
                    fu.status === 'overdue' ? 'bg-red-50 border-red-200' :
                    fu.status === 'completed' ? 'bg-green-50 border-green-200' :
                    'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{new Date(fu.scheduledDate).toLocaleDateString()}</span>
                      <span className={`text-xs font-semibold uppercase ${
                        fu.status === 'overdue' ? 'text-red-600' :
                        fu.status === 'completed' ? 'text-green-600' : 'text-amber-600'
                      }`}>{fu.status}</span>
                    </div>
                    {fu.notes && <p className="text-xs text-slate-500 mt-1">{fu.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Activity Timeline</h2>
          {activities.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No activity yet</p>
          ) : (
            <div className="relative space-y-6">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-100" />
              {activities.map((activity) => {
                const { icon, bg, text } = actionIcons[activity.action] || actionIcons.updated;
                return (
                  <div key={activity._id} className="relative pl-14">
                    <div className={`absolute left-2 top-0 w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
                      <span className={`material-symbols-outlined text-[16px] ${text}`}>{icon}</span>
                    </div>
                    <div className="bg-slate-50/80 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-700">
                          {actionLabels[activity.action] || activity.action}
                        </span>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {new Date(activity.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{activity.description}</p>
                      {activity.performedBy && (
                        <p className="text-xs text-slate-400 mt-1">
                          by {(activity.performedBy as User).name}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} title="Add Note">
        <form onSubmit={handleAddNote} className="space-y-4">
          <textarea
            required value={note} onChange={(e) => setNote(e.target.value)}
            className="input-base resize-none" rows={5} placeholder="Add a note about this lead..."
          />
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowNoteModal(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={actionLoading}
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold disabled:opacity-60">
              {actionLoading ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showFollowUpModal} onClose={() => setShowFollowUpModal(false)} title="Set Follow-Up Reminder">
        <form onSubmit={handleSetFollowUp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Date & Time *</label>
            <input required type="datetime-local" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="input-base" />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Notes</label>
            <textarea value={followUpNote} onChange={(e) => setFollowUpNote(e.target.value)} className="input-base resize-none" rows={3} placeholder="Optional reminder note..." />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowFollowUpModal(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={actionLoading}
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold disabled:opacity-60">
              {actionLoading ? 'Saving...' : 'Set Reminder'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Lead">
        <div className="space-y-4">
          <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="input-base">
            <option value="">Choose an agent...</option>
            {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={handleAssign} disabled={!selectedAgent || actionLoading}
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold disabled:opacity-60">
              {actionLoading ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Change Status">
        <div className="space-y-4">
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="input-base">
            <option value="New">New</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowStatusModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={handleStatusChange} disabled={actionLoading}
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold disabled:opacity-60">
              {actionLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
