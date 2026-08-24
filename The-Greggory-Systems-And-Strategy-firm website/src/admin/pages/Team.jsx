import React, { useState, useEffect } from "react";
import { apiCall } from "../../services/api";
import { Users, Plus, Edit2, Trash2, RefreshCw, Search, Shield, UserCheck } from "lucide-react";

export function Team() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: '', department: '', description: '' });

  useEffect(() => { fetchTeam(); }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/api/admin/team");
      if (data.success) setTeam(data.team || []);
    } catch (error) {
      console.error("Team fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await apiCall(`/api/admin/team/${editingMember.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await apiCall("/api/admin/team", {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setShowForm(false);
      setEditingMember(null);
      setFormData({ name: '', role: '', department: '', description: '' });
      fetchTeam();
    } catch (error) {
      console.error("Team save failed:", error);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({ name: member.name, role: member.role, department: member.department || '', description: member.description || '' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this team member?")) return;
    try {
      await apiCall(`/api/admin/team/${id}`, { method: 'DELETE' });
      fetchTeam();
    } catch (error) {
      console.error("Team delete failed:", error);
    }
  };

  const filteredTeam = team.filter(m =>
    (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.department || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <RefreshCw className="animate-spin text-teal-600 w-8 h-8" />
      <p className="mt-4 text-[7px] font-black text-slate-400 uppercase tracking-[0.6em]">Loading Team Nodes...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Team Management</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Personnel Node Control</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingMember(null); setFormData({ name: '', role: '', department: '', description: '' }); }} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 text-white font-black text-[7px] uppercase tracking-widest shadow-md hover:bg-teal-700 border border-teal-400/20">
          <Plus size={12} /> Add Member
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-md">
          <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-4">{editingMember ? 'Edit' : 'New'} Team Member</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[9px] font-bold outline-none focus:border-teal-500" required />
            </div>
            <div>
              <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Role</label>
              <input type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[9px] font-bold outline-none focus:border-teal-500" required />
            </div>
            <div>
              <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Department</label>
              <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[9px] font-bold outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Description</label>
              <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[9px] font-bold outline-none focus:border-teal-500" />
            </div>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg text-[7px] font-black uppercase tracking-widest hover:bg-teal-700">Save</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingMember(null); }} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-[7px] font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <Search size={14} className="text-slate-400" />
          <input type="text" placeholder="Search team members..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[9px] font-bold outline-none focus:border-teal-500" />
        </div>

        {filteredTeam.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeam.map((member) => (
              <div key={member.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-teal-500/30 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-black">
                      {(member.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-900">{member.name}</p>
                      <p className="text-[7px] text-slate-500 uppercase font-bold">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(member)} className="p-1.5 hover:bg-teal-50 rounded-lg transition-colors"><Edit2 size={12} className="text-teal-600" /></button>
                    <button onClick={() => handleDelete(member.id)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={12} className="text-rose-600" /></button>
                  </div>
                </div>
                {member.department && <p className="text-[7px] text-slate-500 uppercase font-bold mb-1">Dept: {member.department}</p>}
                {member.description && <p className="text-[8px] text-slate-600 leading-relaxed">{member.description}</p>}
                <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[7px] text-slate-500">
                  <span className="uppercase font-bold">Status: {member.is_active ? 'Active' : 'Inactive'}</span>
                  <span className="uppercase font-bold">Projects: {member.project_count || 0}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-14 text-center opacity-30">
            <Users size={24} className="mx-auto mb-2" />
            <p className="text-[9px] uppercase font-bold">No team members found</p>
          </div>
        )}
      </div>
    </div>
  );
}
