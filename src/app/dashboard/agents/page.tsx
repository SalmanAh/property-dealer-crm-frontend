'use client';
import { useState, useEffect } from 'react';
import { usersAPI } from '@/lib/api';
import { User } from '@/lib/types';
import Modal from '@/components/common/Modal';

export default function AgentsPage() {
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'Agent' });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchAgents = async () => {
    try { const res = await usersAPI.getAll(); setAgents(res.data.users); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAgents(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setActionLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('propcrm_token')}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowCreateModal(false);
      setForm({ name: '', email: '', password: '', phone: '', role: 'Agent' });
      showToast('User created!'); fetchAgents();
    } catch (err: any) { showToast(err.message || 'Failed'); } finally { setActionLoading(false); }
  };

  const handleToggleStatus = async (u: User) => {
    try { await usersAPI.update(u._id, { status: u.status === 'Active' ? 'Inactive' : 'Active' }); showToast('Updated'); fetchAgents(); }
    catch { showToast('Failed'); }
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`Delete "${u.name}"?`)) return;
    try { await usersAPI.delete(u._id); showToast('Deleted'); fetchAgents(); } catch { showToast('Failed'); }
  };

  return (
    <div className="space-y-6">
      {toast && <div className="fixed top-4 right-4 z-[9999] px-5 py-3 bg-slate-800 text-white rounded-xl shadow-lg text-sm animate-fade-in">{toast}</div>}
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold text-slate-800">Agents & Users</h1><p className="text-slate-500 text-sm mt-1">{agents.length} total users</p></div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#494bd6] active:scale-95 transition-all shadow-sm">
          <span className="material-symbols-outlined text-[18px]">person_add</span> Add User
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-slate-50/80 border-b border-slate-100">
            {['User','Role','Phone','Status','Joined','Actions'].map(h => <th key={h} className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? Array.from({length:4}).map((_,i) => <tr key={i}>{Array.from({length:6}).map((_,j) => <td key={j} className="px-6 py-4"><div className="h-4 skeleton rounded"/></td>)}</tr>) :
            agents.length === 0 ? <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No users</td></tr> :
            agents.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4"><div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">{u.name.charAt(0)}</div>
                  <div><div className="text-sm font-semibold text-slate-800">{u.name}</div><div className="text-xs text-slate-400">{u.email}</div></div>
                </div></td>
                <td className="px-6 py-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${u.role==='Admin'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                <td className="px-6 py-4 text-sm text-slate-600">{u.phone||'—'}</td>
                <td className="px-6 py-4"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${u.status==='Active'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{u.status}</span></td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4"><div className="flex gap-2">
                  <button onClick={() => handleToggleStatus(u)} className={`p-1.5 rounded-lg ${u.status==='Active'?'text-amber-500 hover:bg-amber-50':'text-green-500 hover:bg-green-50'}`}>
                    <span className="material-symbols-outlined text-[18px]">{u.status==='Active'?'block':'check_circle'}</span>
                  </button>
                  <button onClick={() => handleDelete(u)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add New User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Name *</label>
              <input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="input-base" placeholder="Full name"/></div>
            <div><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Role</label>
              <select value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})} className="input-base"><option value="Agent">Agent</option><option value="Admin">Admin</option></select></div>
          </div>
          <div><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email *</label>
            <input required type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} className="input-base" placeholder="user@propcrm.com"/></div>
          <div><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Password *</label>
            <input required type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} className="input-base" placeholder="Min 8 chars, uppercase, number, symbol"/></div>
          <div><label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Phone</label>
            <input value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} className="input-base" placeholder="03XXXXXXXXX"/></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={()=>setShowCreateModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold disabled:opacity-60">{actionLoading?'Creating...':'Create User'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
