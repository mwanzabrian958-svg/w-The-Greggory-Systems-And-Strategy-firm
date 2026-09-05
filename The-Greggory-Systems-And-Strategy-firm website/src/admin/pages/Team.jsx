import React, { useState, useEffect, useCallback } from "react";
import { apiCall } from "../../services/api";
import { Users, Plus, Edit2, Trash2, RefreshCw, Search, Briefcase, ChevronDown, ChevronUp, Upload, X } from "lucide-react";

function TemplateMembers({ templateId }) {
  const [members, setMembers] = useState([]);
  useEffect(() => {
    apiCall(`/api/admin/team-templates/${templateId}`).then(d => {
      if (d.success) setMembers(d.template?.members || []);
    }).catch(() => {});
  }, [templateId]);
  if (!members.length) return null;
  return (
    <div className="space-y-1.5">
      {members.map(m => (
        <div key={m.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-100">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-[7px] font-black shrink-0">
            {(m.name || '?').split(' ').map(n => n?.[0] || '').join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[8px] font-bold text-slate-800 truncate">{m.name}</p>
            <p className="text-[6px] text-slate-500 truncate">{m.member_role || m.role}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Team() {
  const [team, setTeam] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({ name: '', role: '', department: '', description: '' });
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({ name: '', description: '', project_id: '', team_leader_id: '', team_leader_image: null, team_leader_image_mime: '', member_ids: [] });
  const [templateImagePreview, setTemplateImagePreview] = useState(null);
  const [expandedTemplate, setExpandedTemplate] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [teamRes, tmplRes, projRes] = await Promise.all([
        apiCall("/api/admin/team"),
        apiCall("/api/admin/team-templates"),
        apiCall("/api/user-projects").catch(() => []),
      ]);
      if (teamRes.success) setTeam(teamRes.team || []);
      if (tmplRes.success) setTemplates(tmplRes.templates || []);
      setProjects(Array.isArray(projRes) ? projRes : (projRes.projects || []));
    } catch (error) {
      console.error("Team fetch failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await apiCall(`/api/admin/team/${editingMember.id}`, { method: 'PUT', body: JSON.stringify(memberForm) });
      } else {
        await apiCall("/api/admin/team", { method: 'POST', body: JSON.stringify(memberForm) });
      }
      setShowMemberForm(false);
      setEditingMember(null);
      setMemberForm({ name: '', role: '', department: '', description: '' });
      fetchAll();
    } catch (error) { console.error("Member save failed:", error); }
  };

  const handleMemberEdit = (m) => {
    setEditingMember(m);
    setMemberForm({ name: m.name, role: m.role, department: m.department || '', description: m.description || '' });
    setShowMemberForm(true);
  };

  const handleMemberDelete = async (id) => {
    if (!window.confirm("Remove this team member?")) return;
    try { await apiCall(`/api/admin/team/${id}`, { method: 'DELETE' }); fetchAll(); }
    catch (error) { console.error("Member delete failed:", error); }
  };

  const handleTemplateImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 3 * 1024 * 1024) { alert("Image must be under 3MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setTemplateImagePreview(reader.result);
      setTemplateForm(f => ({ ...f, team_leader_image: reader.result, team_leader_image_mime: file.type }));
    };
    reader.readAsDataURL(file);
  };

  const handleTemplateSubmit = async (e) => {
    e.preventDefault();
    if (!templateForm.name) { alert("Template name is required"); return; }
    try {
      const payload = { ...templateForm };
      if (payload.project_id) payload.project_id = parseInt(payload.project_id);
      if (payload.team_leader_id) payload.team_leader_id = parseInt(payload.team_leader_id);
      if (editingTemplate) {
        await apiCall(`/api/admin/team-templates/${editingTemplate.id}`, { method: 'PUT', body: JSON.stringify(payload) });
      } else {
        await apiCall("/api/admin/team-templates", { method: 'POST', body: JSON.stringify(payload) });
      }
      setShowTemplateForm(false);
      setEditingTemplate(null);
      setTemplateForm({ name: '', description: '', project_id: '', team_leader_id: '', team_leader_image: null, team_leader_image_mime: '', member_ids: [] });
      setTemplateImagePreview(null);
      fetchAll();
    } catch (error) { console.error("Template save failed:", error); alert("Save failed: " + error.message); }
  };

  const handleTemplateEdit = async (t) => {
    try {
      const data = await apiCall(`/api/admin/team-templates/${t.id}`);
      if (data.success) {
        const tpl = data.template;
        setEditingTemplate(tpl);
        setTemplateForm({
          name: tpl.name || '',
          description: tpl.description || '',
          project_id: tpl.project_id ? String(tpl.project_id) : '',
          team_leader_id: tpl.team_leader_id ? String(tpl.team_leader_id) : '',
          team_leader_image: tpl.team_leader_image || null,
          team_leader_image_mime: tpl.team_leader_image_mime || '',
          member_ids: (tpl.members || []).map(m => m.team_member_id),
        });
        setTemplateImagePreview(tpl.team_leader_image ? `data:${tpl.team_leader_image_mime || "image/jpeg"};base64,${tpl.team_leader_image}` : null);
        setShowTemplateForm(true);
      }
    } catch (error) { console.error("Template load failed:", error); }
  };

  const handleTemplateDelete = async (id) => {
    if (!window.confirm("Delete this team template?")) return;
    try { await apiCall(`/api/admin/team-templates/${id}`, { method: 'DELETE' }); fetchAll(); }
    catch (error) { console.error("Template delete failed:", error); }
  };

  const toggleMemberInTemplate = (memberId) => {
    setTemplateForm(f => ({
      ...f,
      member_ids: f.member_ids.includes(memberId) ? f.member_ids.filter(id => id !== memberId) : [...f.member_ids, memberId],
    }));
  };

  const filteredMembers = team.filter(m =>
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Team Management</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Personnel and Crew Templates</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden">
            <button onClick={() => setActiveTab("templates")} className={`px-3 py-1.5 text-[7px] font-black uppercase tracking-widest transition-all ${activeTab === "templates" ? "bg-teal-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>Crews</button>
            <button onClick={() => setActiveTab("members")} className={`px-3 py-1.5 text-[7px] font-black uppercase tracking-widest transition-all ${activeTab === "members" ? "bg-teal-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}>Members</button>
          </div>
          {activeTab === "templates" ? (
            <button onClick={() => { setShowTemplateForm(true); setEditingTemplate(null); setTemplateForm({ name: '', description: '', project_id: '', team_leader_id: '', team_leader_image: null, team_leader_image_mime: '', member_ids: [] }); setTemplateImagePreview(null); }} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 text-white font-black text-[7px] uppercase tracking-widest shadow-md hover:bg-teal-700"><Plus size={12} /> New Crew</button>
          ) : (
            <button onClick={() => { setShowMemberForm(true); setEditingMember(null); setMemberForm({ name: '', role: '', department: '', description: '' }); }} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 text-white font-black text-[7px] uppercase tracking-widest shadow-md hover:bg-teal-700"><Plus size={12} /> Add Member</button>
          )}
        </div>
      </div>

      {activeTab === "templates" && (
        <div className="space-y-4">
          {showTemplateForm && (
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-lg">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">{editingTemplate ? 'Edit' : 'Create'} Crew Template</h3>
              <form onSubmit={handleTemplateSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Crew / Group Name *</label><input type="text" value={templateForm.name} onChange={e => setTemplateForm({...templateForm, name: e.target.value})} placeholder="e.g. Alpha Design Squad" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[9px] font-bold outline-none focus:border-teal-500" required /></div>
                <div><label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Assigned Project</label><select value={templateForm.project_id} onChange={e => setTemplateForm({...templateForm, project_id: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[9px] font-bold outline-none focus:border-teal-500"><option value="">— No project —</option>{projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}</select></div>
                <div><label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Team Leader</label><select value={templateForm.team_leader_id} onChange={e => setTemplateForm({...templateForm, team_leader_id: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[9px] font-bold outline-none focus:border-teal-500"><option value="">— Select leader —</option>{team.filter(m => m.is_active).map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}</select></div>
                <div><label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Leader Photo</label><div className="flex items-center gap-3">{templateImagePreview ? (<div className="relative"><img src={templateImagePreview} alt="Leader" className="w-12 h-12 rounded-xl object-cover border-2 border-slate-200" /><button type="button" onClick={() => { setTemplateImagePreview(null); setTemplateForm(f => ({ ...f, team_leader_image: null, team_leader_image_mime: '' })); }} className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center"><X size={10} /></button></div>) : (<label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-lg text-[7px] font-black text-slate-600 uppercase tracking-widest cursor-pointer hover:border-teal-500 hover:text-teal-700 transition-all"><Upload size={10} /> Upload<input type="file" accept="image/*" onChange={handleTemplateImage} className="hidden" /></label>)}</div></div>
                <div className="md:col-span-2"><label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Description</label><textarea value={templateForm.description} onChange={e => setTemplateForm({...templateForm, description: e.target.value})} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[9px] font-bold outline-none focus:border-teal-500" /></div>
                <div className="md:col-span-2"><label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Crew Members ({templateForm.member_ids.length} selected)</label>{team.filter(m => m.is_active).length > 0 ? (<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-100">{team.filter(m => m.is_active).map(m => { const selected = templateForm.member_ids.includes(m.id); return (<button key={m.id} type="button" onClick={() => toggleMemberInTemplate(m.id)} className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${selected ? "bg-teal-50 border-teal-300 text-teal-800" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"}`}><div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-[7px] font-black shrink-0">{(m.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</div><div className="min-w-0"><p className="text-[7px] font-black truncate">{m.name}</p><p className="text-[6px] truncate opacity-70">{m.role}</p></div></button>); })}</div>) : (<p className="text-[8px] text-slate-400 py-3 text-center">No active team members. Add members first.</p>)}</div>
                <div className="md:col-span-2 flex gap-3 pt-2"><button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg text-[7px] font-black uppercase tracking-widest hover:bg-teal-700">Save Crew</button><button type="button" onClick={() => { setShowTemplateForm(false); setEditingTemplate(null); setTemplateImagePreview(null); }} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-[7px] font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button></div>
              </form>
            </div>
          )}

          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map(t => (
                <div key={t.id} className="bg-white rounded-2xl border border-slate-100 shadow-md overflow-hidden hover:shadow-lg transition-all">
                  <button onClick={() => setExpandedTemplate(expandedTemplate === t.id ? null : t.id)} className="w-full text-left p-4 focus:outline-none">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0">{t.team_leader_image ? (<img src={`data:${t.team_leader_image_mime || "image/jpeg"};base64,${t.team_leader_image}`} alt={t.leader_name || "Leader"} className="w-14 h-14 rounded-xl object-cover border-2 border-slate-200 shadow" />) : (<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-black border-2 border-slate-200 shadow">{(t.leader_name || t.name || '?').split(' ').map(n => n?.[0] || '').join('').slice(0, 2).toUpperCase()}</div>)}</div>
                      <div className="flex-1 min-w-0"><p className="text-[10px] font-black text-slate-900 uppercase tracking-wider truncate">{t.name}</p>{t.leader_name && <p className="text-[8px] text-teal-600 font-bold mt-0.5">{t.leader_name}</p>}{t.project_name && (<div className="flex items-center gap-1 mt-1"><Briefcase size={9} className="text-slate-400" /><p className="text-[7px] text-slate-500 truncate">{t.project_name}</p></div>)}<p className="text-[7px] text-slate-400 mt-1">{t.member_count} member{t.member_count !== 1 ? 's' : ''}</p></div>
                      <div className="shrink-0 text-slate-400">{expandedTemplate === t.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</div>
                    </div>
                  </button>
                  {expandedTemplate === t.id && (<div className="border-t border-slate-100 bg-slate-50 p-3 space-y-2 animate-in fade-in duration-200">{t.member_count > 0 ? <TemplateMembers templateId={t.id} /> : <p className="text-[8px] text-slate-400 text-center py-2">No members assigned</p>}<div className="flex gap-2 pt-2 border-t border-slate-200"><button onClick={() => handleTemplateEdit(t)} className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[7px] font-black text-slate-600 uppercase tracking-widest hover:border-teal-500 hover:text-teal-700 transition-all">Edit</button><button onClick={() => handleTemplateDelete(t.id)} className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[7px] font-black text-rose-600 uppercase tracking-widest hover:border-rose-500 hover:bg-rose-50 transition-all">Delete</button></div></div>)}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center opacity-30"><Users size={28} className="mx-auto mb-3" /><p className="text-[10px] uppercase font-bold">No crew templates yet</p><p className="text-[8px] mt-1">Click "New Crew" to create one</p></div>
          )}
        </div>
      )}

      {activeTab === "members" && (
        <div className="space-y-4">
          {showMemberForm && (
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-lg">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">{editingMember ? 'Edit' : 'Add'} Team Member</h3>
              <form onSubmit={handleMemberSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Full Name</label><input type="text" value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[9px] font-bold outline-none focus:border-teal-500" /></div>
                <div><label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Role / Title</label><input type="text" value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[9px] font-bold outline-none focus:border-teal-500" /></div>
                <div><label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Department</label><input type="text" value={memberForm.department} onChange={e => setMemberForm({...memberForm, department: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[9px] font-bold outline-none focus:border-teal-500" /></div>
                <div><label className="block text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">Description</label><textarea value={memberForm.description} onChange={e => setMemberForm({...memberForm, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[9px] font-bold outline-none focus:border-teal-500" /></div>
                <div className="md:col-span-2 flex gap-3 pt-2"><button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg text-[7px] font-black uppercase tracking-widest hover:bg-teal-700">Save</button><button type="button" onClick={() => { setShowMemberForm(false); setEditingMember(null); }} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-[7px] font-black uppercase tracking-widest hover:bg-slate-50">Cancel</button></div>
              </form>
            </div>
          )}
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-md">
            <div className="flex items-center gap-3 mb-4"><Search size={14} className="text-slate-400" /><input type="text" placeholder="Search team members..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[9px] font-bold outline-none focus:border-teal-500" /></div>
            {filteredMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member) => (
                  <div key={member.id} className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-teal-500/30 transition-all">
                    <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-black">{(member.name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</div><div><p className="text-[9px] font-black text-slate-900">{member.name}</p><p className="text-[7px] text-slate-500 uppercase font-bold">{member.role}</p></div></div><div className="flex gap-1"><button onClick={() => handleMemberEdit(member)} className="p-1.5 hover:bg-teal-50 rounded-lg transition-colors"><Edit2 size={12} className="text-teal-600" /></button><button onClick={() => handleMemberDelete(member.id)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={12} className="text-rose-600" /></button></div></div>
                    {member.department && <p className="text-[7px] text-slate-500 uppercase font-bold mb-1">Dept: {member.department}</p>}{member.description && <p className="text-[8px] text-slate-600 leading-relaxed">{member.description}</p>}
                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-[7px] text-slate-500"><span className="uppercase font-bold">Status: {member.is_active ? 'Active' : 'Inactive'}</span></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-14 text-center opacity-30"><Users size={24} className="mx-auto mb-2" /><p className="text-[9px] uppercase font-bold">No team members found</p></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
