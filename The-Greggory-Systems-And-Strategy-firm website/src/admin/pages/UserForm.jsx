import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { User, X, Save, RefreshCw, Shield } from "lucide-react";
import { apiCall } from "../../services/api";
import SearchBlock from "../../components/SearchBlock";

export function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract roleType from URL if possible, or default to user
  // Expected path: /admin/users/detail/:id/:roleType -> edit link can pass state
  const queryParams = new URLSearchParams(location.search);
  const [roleType, setRoleType] = useState(queryParams.get('role_type') || 'client');

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "",
    role: "user", admin_level: "admin", department: "", mission_briefing: "", is_active: true,
    phone_number: "", physical_address: "", id_number: "", alt_phone: "",
    expertise: "", private_notes: "", manual_projects: "", emergency_contact_name: "", emergency_contact_phone: ""
  });

  const [linkedProjects, setLinkedProjects] = useState([]);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        setLoading(true);
        try {
          const data = await apiCall(`/admin/users/${id}?role_type=${roleType}`);
          if (data.success) {
            setForm({
              ...form,
              ...data.user,
              role: data.user.primary_role || data.user.role || 'user'
            });

            // Fetch real linked projects
            const pData = await apiCall(`/user-projects`);
            if (Array.isArray(pData)) {
              const filtered = pData.filter(p => String(p.user_id) === String(id) || String(p.client_id) === String(id));
              setLinkedProjects(filtered);
            }
          }
        } catch (e) { console.error(e); }
        setLoading(false);
      };
      fetchUser();
    }
  }, [id, roleType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
        const endpoint = id ? `/admin/users/${id}?role_type=${roleType}` : "/users/admin-create";
        const method = id ? 'PUT' : 'POST';

        const res = await apiCall(endpoint, {
          method,
          body: JSON.stringify(form)
        });
        if (res.success || res.userId) navigate('/admin/users');
    } catch (e) {
        console.error(e);
    } finally {
        setIsSubmitting(false);
    }
  };

  if (loading) return <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center"><RefreshCw className="animate-spin text-teal-500" /></div>;

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-[500] flex flex-col overflow-hidden">
      <div className="bg-[#0f172a] px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-500 border border-teal-500/20"><User size={20} /></div>
          <div className="hidden sm:block">
            <h2 className="text-lg font-black text-white tracking-tighter uppercase leading-none">{id ? 'Recalibrate Identity' : 'Personnel Entry'}</h2>
            <p className="text-[7px] text-teal-500 font-black uppercase tracking-[0.4em] mt-1">Identity Node Management</p>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8">
          <SearchBlock variant="admin" placeholder="Query identity nodes..." />
        </div>
        <button onClick={() => navigate('/admin/users')} className="p-2.5 bg-white/5 text-slate-400 rounded-xl hover:text-white transition-all"><X size={16} /></button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/2 p-6 rounded-3xl border border-white/5 shadow-2xl">
            <div className="space-y-4">
                <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Basic Information</h4>
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="First Name" value={form.first_name} onChange={(e) => setForm({...form, first_name: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-teal-500" required />
                    <input type="text" placeholder="Last Name" value={form.last_name} onChange={(e) => setForm({...form, last_name: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-teal-500" required />
                  </div>
                  <input type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-teal-500" required />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="tel" placeholder="Phone Number" value={form.phone_number} onChange={(e) => setForm({...form, phone_number: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-teal-500" />
                    <input type="tel" placeholder="Backup Phone" value={form.alt_phone} onChange={(e) => setForm({...form, alt_phone: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-teal-500" />
                  </div>
                  {!id && <input type="password" placeholder="Set Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-teal-500" required />}
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Access & Role</h4>
                <div className="grid gap-3">
                  <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-teal-500">
                      <option value="user" className="bg-[#0f172a]">Client Profile</option>
                      <option value="admin" className="bg-[#0f172a]">Administrator Node</option>
                      <option value="developer" className="bg-[#0f172a]">Developer Node</option>
                  </select>
                  <input type="text" placeholder="Department or Group Name" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-teal-500" />
                  <input type="text" placeholder="ID or Passport Number" value={form.id_number} onChange={(e) => setForm({...form, id_number: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-teal-500" />
                  <div className="flex items-center gap-3 px-2">
                    <input type="checkbox" id="isActive" checked={form.is_active} onChange={(e) => setForm({...form, is_active: e.target.checked})} className="w-3.5 h-3.5 accent-teal-500" />
                    <label htmlFor="isActive" className="text-[9px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer">Account Active</label>
                  </div>
                </div>
            </div>
          </div>

          {/* Section 2: Personal & Professional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/2 p-6 rounded-3xl border border-white/5 shadow-2xl">
            <div className="space-y-4">
              <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Address & Skills</h4>
              <div className="grid gap-3">
                <textarea placeholder="Physical Home/Office Address" value={form.physical_address} onChange={(e) => setForm({...form, physical_address: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[10px] font-medium text-white outline-none focus:border-teal-500 h-20 resize-none" />
                <textarea placeholder="Skills, Expertise or Professional Focus" value={form.expertise} onChange={(e) => setForm({...form, expertise: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[10px] font-medium text-white outline-none focus:border-teal-500 h-20 resize-none" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Emergency Contact</h4>
              <div className="grid gap-3">
                <input type="text" placeholder="Contact Person Name" value={form.emergency_contact_name} onChange={(e) => setForm({...form, emergency_contact_name: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-teal-500" />
                <input type="tel" placeholder="Contact Person Phone" value={form.emergency_contact_phone} onChange={(e) => setForm({...form, emergency_contact_phone: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-teal-500" />

                <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2 mt-2">Internal Admin Notes</h4>
                <textarea placeholder="Private notes only visible to admins" value={form.private_notes} onChange={(e) => setForm({...form, private_notes: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[10px] font-medium text-white outline-none focus:border-teal-500 h-20 resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-white/2 p-6 rounded-3xl border border-white/5 shadow-2xl">
            <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2 mb-4">Linked Projects</h4>
            <div className="grid gap-4">
              {linkedProjects.length > 0 ? (
                <div className="grid gap-2">
                  <p className="text-[7px] font-black text-teal-400 uppercase tracking-widest">Active System Projects Detected:</p>
                  <div className="flex flex-wrap gap-2">
                    {linkedProjects.map(p => (
                      <span key={p.id} className="bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2 py-1 rounded-md text-[8px] font-bold uppercase">{p.project_name}</span>
                    ))}
                  </div>
                  <p className="text-[6px] text-slate-500 font-bold uppercase mt-1">Note: System-linked projects are managed in the Projects Workstation.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">No active system projects. Enter legacy or manual project references below:</p>
                  <textarea
                    placeholder="Manually input projects (e.g. 2023 Infrastructure Audit, Maintenance Node B...)"
                    value={form.manual_projects}
                    onChange={(e) => setForm({...form, manual_projects: e.target.value})}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-medium text-white outline-none focus:border-teal-500 h-20 w-full resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/2 p-6 rounded-3xl border border-white/5 shadow-2xl">
            <h4 className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2 mb-4">Mission Briefing</h4>
            <textarea placeholder="Enter custom directive or mission briefing for this person..." value={form.mission_briefing} onChange={(e) => setForm({...form, mission_briefing: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-[10px] font-medium text-white outline-none focus:border-teal-500 h-32 w-full resize-none" />
          </div>

          <div className="pt-6 flex gap-4 pb-12">
              <button type="button" onClick={() => navigate('/admin/users')} className="flex-1 bg-white/5 text-slate-400 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all">Cancel Protocol</button>
              <button type="submit" disabled={isSubmitting} className="flex-[2] bg-teal-600 hover:bg-teal-500 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95">
                {isSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <Shield size={14} />} Commit Identity Change
              </button>
          </div>
        </div>
      </form>
    </div>
  );
}
