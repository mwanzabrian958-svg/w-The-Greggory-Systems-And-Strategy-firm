import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User, X, Save, RefreshCw, Shield } from "lucide-react";
import { getApiUrl, API_BASE_URL } from "../../services/api";

export function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", password: "",
    role: "user", admin_level: "admin", department: "", is_active: true
  });

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        setLoading(true);
        const res = await fetch(getApiUrl(`/api/admin/users/${id}?role_type=user`));
        if (res.ok) {
          const data = await res.json();
          setForm({ ...form, ...data.user });
        }
        setLoading(false);
      };
      fetchUser();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const endpoint = id ? `/api/admin/users/${id}` : "/api/admin/create-admin";
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) navigate('/admin/users');
    setIsSubmitting(false);
  };

  if (loading) return <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center"><RefreshCw className="animate-spin text-teal-500" /></div>;

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-[500] flex flex-col overflow-hidden">
      <div className="bg-[#0f172a] px-8 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center text-teal-500 border border-teal-500/20"><User size={24} /></div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase">{id ? 'Recalibrate Identity' : 'Authorized Personnel Entry'}</h2>
            <p className="text-[9px] text-teal-500 font-black uppercase tracking-[0.5em] mt-1">Identity Node Management</p>
          </div>
        </div>
        <button onClick={() => navigate('/admin/users')} className="p-4 bg-white/5 text-slate-400 rounded-2xl hover:text-white transition-all"><X size={20} /></button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-slate-950 p-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 bg-white/2 p-12 rounded-[50px] border border-white/5 shadow-2xl">
           <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Primary Telemetry</h4>
              <div className="grid gap-4">
                 <input type="text" placeholder="First Name" value={form.first_name} onChange={(e) => setForm({...form, first_name: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none" required />
                 <input type="text" placeholder="Last Name" value={form.last_name} onChange={(e) => setForm({...form, last_name: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none" required />
                 <input type="email" placeholder="Email Address" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none" required />
                 {!id && <input type="password" placeholder="Strategic Password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none" required />}
              </div>
           </div>
           <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2">Access Mandate</h4>
              <div className="grid gap-4">
                 <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none">
                    <option value="user" className="bg-[#0f172a]">Client Profile</option>
                    <option value="admin" className="bg-[#0f172a]">Administrator Node</option>
                    <option value="developer" className="bg-[#0f172a]">Developer Node</option>
                 </select>
                 <input type="text" placeholder="Department / Group" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none" />
              </div>
           </div>

           <div className="md:col-span-2 pt-10 flex gap-6">
              <button type="button" onClick={() => navigate('/admin/users')} className="flex-1 bg-white/5 text-slate-400 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest border border-white/5">Cancel Protocol</button>
              <button type="submit" disabled={isSubmitting} className="flex-[2] bg-teal-600 hover:bg-teal-500 text-white py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-4">
                {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : <Shield size={16} />} Commit Identity Change
              </button>
           </div>
        </div>
      </form>
    </div>
  );
}
