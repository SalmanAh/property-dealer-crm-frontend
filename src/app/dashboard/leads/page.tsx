'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { leadsAPI, usersAPI } from '@/lib/api';
import { Lead, User } from '@/lib/types';
import { ScoreBadge, StatusBadge } from '@/components/common/Badge';
import Modal from '@/components/common/Modal';
import { useAuth } from '@/contexts/AuthContext';

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [scoreFilter, setScoreFilter] = useState('');
  const [agentFilter, setAgentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');

  // New lead form
  const [form, setForm] = useState({
    name: '', email: '', phone: '', propertyInterest: '', budget: '', notes: '', source: 'Other', assignedTo: '',
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (scoreFilter) params.score = scoreFilter;
      if (agentFilter) params.agentId = agentFilter;
      const res = await leadsAPI.getAll(params);
      setLeads(res.data.leads);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, statusFilter, scoreFilter, agentFilter, page]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  useEffect(() => {
    if (user?.role === 'Admin') {
      usersAPI.getAgents().then((res) => setAgents(res.data.agents)).catch(() => {});
    }
  }, [user]);

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await leadsAPI.create({ ...form, budget: Number(form.budget), assignedTo: form.assignedTo || undefined });
      setShowAddModal(false);
      setForm({ name: '', email: '', phone: '', propertyInterest: '', budget: '', notes: '', source: 'Other', assignedTo: '' });
      showToast('Lead created successfully!');
      fetchLeads();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to create lead');
    } finally { setActionLoading(false); }
  };

  const handleAssign = async () => {
    if (!showAssignModal || !selectedAgent) return;
    setActionLoading(true);
    try {
      await leadsAPI.assign(showAssignModal, selectedAgent);
      setShowAssignModal(null);
      showToast('Lead assigned successfully!');
      fetchLeads();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to assign lead');
    } finally { setActionLoading(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete lead "${name}"? This cannot be undone.`)) return;
    try {
      await leadsAPI.delete(id);
      showToast('Lead deleted');
      fetchLeads();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to delete');
    }
  };

  const formatBudget = (n: number) => `PKR ${n?.toLocaleString() || 0}`;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[9999] px-5 py-3 bg-slate-800 text-white rounded-xl shadow-lg text-sm animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {user?.role === 'Admin' ? 'Leads Management' : 'My Leads'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{total} total leads</p>
        </div>
        {user?.role === 'Admin' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#494bd6] active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add New Lead
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
        >
          <option value="">All Status</option>
          <option value="New">New</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>
        <select
          value={scoreFilter}
          onChange={(e) => { setScoreFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
        >
          <option value="">All Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        {user?.role === 'Admin' && (
          <select
            value={agentFilter}
            onChange={(e) => { setAgentFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
          >
            <option value="">All Agents</option>
            {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
        )}
        {(search || statusFilter || scoreFilter || agentFilter) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter(''); setScoreFilter(''); setAgentFilter(''); setPage(1); }}
            className="px-3 py-2 text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">close</span> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Lead</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Contact</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Property</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Budget</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Agent</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 skeleton rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl block mb-2">person_search</span>
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className={`hover:bg-slate-50/50 transition-colors ${lead.score === 'High' ? 'border-l-2 border-l-red-300' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{lead.name}</div>
                          <div className="text-xs text-slate-400">{new Date(lead.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">{lead.email}</div>
                      <div className="text-xs text-slate-400">{lead.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-[140px] truncate">{lead.propertyInterest}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{formatBudget(lead.budget)}</td>
                    <td className="px-6 py-4"><ScoreBadge score={lead.score} /></td>
                    <td className="px-6 py-4"><StatusBadge status={lead.status} /></td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {lead.assignedTo ? (lead.assignedTo as User).name : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/dashboard/leads/${lead._id}`}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </Link>
                        {user?.role === 'Admin' && (
                          <>
                            <button
                              onClick={() => { setShowAssignModal(lead._id); setSelectedAgent(''); }}
                              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Assign"
                            >
                              <span className="material-symbols-outlined text-[18px]">person_add</span>
                            </button>
                            <button
                              onClick={() => handleDelete(lead._id, lead.name)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </>
                        )}
                        <a
                          href={`https://wa.me/92${lead.phone.replace(/\D/g, '').replace(/^0/, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          title="WhatsApp"
                        >
                          <span className="material-symbols-outlined text-[18px]">chat</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Lead">
        <form onSubmit={handleAddLead} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input-base" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-base" placeholder="email@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Phone *</label>
              <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input-base" placeholder="03XXXXXXXXX" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Budget (PKR) *</label>
              <input required type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="input-base" placeholder="5000000" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Property Interest *</label>
            <input required value={form.propertyInterest} onChange={(e) => setForm({ ...form, propertyInterest: e.target.value })}
              className="input-base" placeholder="e.g., 3-bed apartment in DHA" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Source</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="input-base">
                <option>Facebook Ads</option><option>Walk-in</option><option>Website</option><option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Assign To</label>
              <select value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="input-base">
                <option value="">Unassigned</option>
                {agents.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="input-base resize-none" rows={3} placeholder="Optional notes..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading}
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-[#494bd6] transition-colors disabled:opacity-60">
              {actionLoading ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={!!showAssignModal} onClose={() => setShowAssignModal(null)} title="Assign Lead to Agent">
        <div className="space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Select Agent</label>
          <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)} className="input-base">
            <option value="">Choose an agent...</option>
            {agents.map((a) => <option key={a._id} value={a._id}>{a.name} ({a.email})</option>)}
          </select>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAssignModal(null)}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button onClick={handleAssign} disabled={!selectedAgent || actionLoading}
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-[#494bd6] disabled:opacity-60">
              {actionLoading ? 'Assigning...' : 'Assign Lead'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
