import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Calendar, Shield, MapPin,
  Briefcase, Clock, ArrowLeft, RefreshCw, Edit2,
  Trash2, CheckCircle, XCircle, ExternalLink, Camera, Activity, FolderKanban, ArrowRight
} from "lucide-react";
import { apiCall } from "../../services/api";

/**
 * UserDetail - Full Personnel Node Analysis Workstation
 */
export function UserDetail() {
  const { id, roleType } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => { fetchFullNodeData(); }, [id, roleType]);

  const fetchFullNodeData = async () => {
    try {
      setLoading(true);
      // Fetch core record from specific table
      const response = await apiCall(`/admin/users/${id}?role_type=${roleType || 'user'}`);
      if (response.success) {
        setUser(response.user);
        // Fetch deployments using unified project relay
        const pData = await apiCall(`/user-projects`);
        if (Array.isArray(pData)) {
            setProjects(pData.filter(p => String(p.user_id) === String(id) || String(p.client_id) === String(id)));
        }
      }
    } catch (e) { console.error("Node Retrieval Failure", e); } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center z-[600]">
       <RefreshCw className="animate-spin text-teal-500 w-10 h-10 mb-4" />
       <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em]">Initializing Identity Depth-Scan...</p>
    </div>
  );

  if (!user) return (
    <div className="fixed inset-0 bg-[#0f172a] flex flex-col items-center justify-center z-[600]">
       <XCircle className="text-rose-500 w-12 h-12 mb-4" />
       <p className="text-[10px] font-black text-white uppercase">Node Identity Missing from Matrix</p>
       <button onClick={() => navigate('/admin/users')} className="mt-6 px-6 py-2 bg-white/10 text-white rounded-xl text-[8px] font-black uppercase tracking-widest">Return to Hub</button>
    </div>
  );

  // Profile photo reconstruction
  const role = roleType === 'client' ? 'user' : (roleType || 'user');
  const profilePhotoUrl = `/api/admin/profile-photo/${role}/${user.id}?v=${Date.now()}`;

  return (
    <div className="fixed inset-0 bg-[#020617] z-[500] flex flex-col font-sans text-white overflow-hidden animate-in fade-in duration-300">
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f172a]/50 backdrop-blur-xl">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/users')} className="p-2 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white"><ArrowLeft size={18} /></button>
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <div>
               <h2 className="text-sm font-black uppercase tracking-widest leading-none">Identity Depth-Scan</h2>
               <p className="text-[7px] text-teal-500 font-black uppercase tracking-[0.3em] mt-1.5">{roleType?.toUpperCase()} NODE: {user.id}</p>
            </div>
         </div>
         <button onClick={() => navigate(`/admin/users/manage/${user.id}`)} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all">
            <Edit2 size={12} className="text-teal-400" /> Modify Node
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-6xl mx-auto space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                 <div className="bg-slate-900/50 border border-white/10 rounded-[40px] p-8 text-center shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 to-blue-600"></div>
                    <div className="relative mb-6 inline-block">
                       <div className="w-32 h-32 rounded-[48px] bg-slate-800 border-2 border-teal-500/20 flex items-center justify-center overflow-hidden shadow-2xl mx-auto">
                          {!imageError ? (
                            <img src={profilePhotoUrl} alt={user.display_name} onError={() => setImageError(true)} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-4xl font-black text-slate-700">{(user.display_name || "U")[0]}</div>
                          )}
                       </div>
                       <div className="absolute -bottom-2 -right-2 bg-teal-500 p-2.5 rounded-2xl border-4 border-[#0f172a] shadow-xl"><Shield size={14} /></div>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight">{user.display_name}</h3>
                    <p className="text-[8px] font-black text-teal-400 uppercase tracking-[0.4em] mt-2 mb-8">{user.role || user.primary_role || 'Personnel'}</p>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-white/2 rounded-2xl p-3 border border-white/5">
                          <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest">Status</p>
                          <p className={`text-[9px] font-black uppercase mt-1 ${user.is_active ? 'text-emerald-500' : 'text-rose-500'}`}>{user.is_active ? 'Online' : 'Offline'}</p>
                       </div>
                       <div className="bg-white/2 rounded-2xl p-3 border border-white/5">
                          <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest">Security</p>
                          <p className="text-[9px] font-black text-teal-500 uppercase mt-1">Cleared</p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-900/50 border border-white/10 rounded-[32px] p-6 space-y-5">
                    <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-white/5 pb-3">Relay connectivity</h4>
                    <div className="space-y-4">
                       {[
                         { icon: Mail, label: "Primary Relay", val: user.email },
                         { icon: Phone, label: "Secure Line", val: user.phone_number || '---' },
                         { icon: Calendar, label: "Creation Seq.", val: new Date(user.created_at).toLocaleDateString() }
                       ].map(item => (
                         <div key={item.label} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500"><item.icon size={14} /></div>
                            <div className="min-w-0 flex-1">
                               <p className="text-[6px] font-black text-slate-500 uppercase">{item.label}</p>
                               <p className="text-[10px] font-bold truncate">{item.val}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-8 space-y-8">
                 <div className="bg-[#0f172a] border border-white/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[80px] -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                       <div className="flex items-center gap-3 mb-8 text-teal-400"><Activity size={18} /><h4 className="text-[11px] font-black uppercase tracking-widest">Node Analysis</h4></div>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {[
                            { label: "Access Node", val: user.access_level || 'standard' },
                            { label: "Department", val: user.department || 'Operations' },
                            { label: "Uptime IP", val: user.last_login_ip || '---' },
                            { label: "Sync Time", val: user.last_login_at ? new Date(user.last_login_at).toLocaleTimeString() : 'N/A' }
                          ].map(stat => (
                            <div key={stat.label}>
                               <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{stat.label}</p>
                               <p className="text-[11px] font-black text-white uppercase">{stat.val}</p>
                            </div>
                          ))}
                       </div>
                       <div className="mt-10 pt-8 border-t border-white/5">
                          <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-3">Operational Directive / Technical Brief</p>
                          <div className="bg-white/2 p-6 rounded-3xl border border-white/5 italic text-slate-400 text-[11px] leading-relaxed">
                             {user.mission_briefing || "This personnel node is synchronized within the primary strategic matrix. Security clearance confirmed. Directives include maintaining high-uptime operations and asset synchronization within the Greggory Systems Hub."}
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-900/30 border border-white/5 rounded-[40px] p-8">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3 text-blue-400"><Briefcase size={18} /><h4 className="text-[11px] font-black uppercase tracking-widest">Active Deployments</h4></div>
                       <span className="text-[8px] font-black text-slate-500 uppercase">{projects.length} Active Nodes</span>
                    </div>
                    <div className="space-y-4">
                       {projects.length > 0 ? projects.map(proj => (
                         <div key={proj.id} onClick={() => navigate('/admin/projects')} className="bg-white/2 border border-white/5 p-5 rounded-[30px] flex items-center justify-between group hover:bg-white/5 cursor-pointer transition-all">
                            <div className="flex items-center gap-5">
                               <div className="w-12 h-12 rounded-2xl bg-[#020617] flex items-center justify-center text-blue-500 group-hover:scale-110 transition-all shadow-xl"><FolderKanban size={20} /></div>
                               <div>
                                  <p className="text-[11px] font-black uppercase tracking-tight">{proj.project_name}</p>
                                  <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest mt-1">Status: {proj.status} • KSh {parseFloat(proj.estimated_budget || 0).toLocaleString()}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-6">
                               <div className="text-right hidden md:block">
                                  <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Progression</p>
                                  <p className="text-[10px] font-black text-teal-400 mt-0.5">{proj.progress_percentage}%</p>
                               </div>
                               <ArrowRight size={16} className="text-slate-700 group-hover:text-white transition-colors" />
                            </div>
                         </div>
                       )) : (
                         <div className="py-20 text-center bg-white/2 rounded-[40px] border border-dashed border-white/10 opacity-30 font-black uppercase text-[10px]">Zero Project Clusters Found</div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
