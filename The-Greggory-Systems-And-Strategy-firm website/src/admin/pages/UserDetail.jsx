import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Calendar, Shield, MapPin,
  Briefcase, Clock, ArrowLeft, RefreshCw, Edit2,
  Trash2, CheckCircle, XCircle, ExternalLink, Camera, Activity, FolderKanban, ArrowRight,
  Download
} from "lucide-react";
import { apiCall } from "../../services/api";
import { formatKSH } from "../../utils/currencyUtils";
import SearchBlock from "../../components/SearchBlock";


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
    <div className="flex flex-col items-center justify-center p-20">
       <RefreshCw className="animate-spin text-teal-500 w-10 h-10 mb-4" />
       <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em]">Initializing Identity Depth-Scan...</p>
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center p-20">
       <XCircle className="text-rose-500 w-12 h-12 mb-4" />
       <p className="text-[10px] font-black text-slate-900 uppercase">Node Identity Missing from Matrix</p>
       <button onClick={() => navigate('/admin/users')} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase tracking-widest">Return to Hub</button>
    </div>
  );

  const handlePrint = () => {
    window.print();
  };

  // Profile photo reconstruction
  const role = roleType === 'client' ? 'user' : (roleType || 'user');
  const profilePhotoUrl = `/api/admin/profile-photo/${role}/${user.id}?v=${Date.now()}`;

  return (
    <div className="flex flex-col font-sans text-slate-900 animate-in fade-in duration-300 print:bg-white print:text-black print:relative print:inset-auto print:h-auto print:overflow-visible">
      {/* Print Specific Styles */}
      <style>{`
        @media print {
          @page { margin: 15mm; size: A4; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; color: #1e293b !important; }

          .print-container {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
          }

          .print-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            border-bottom: 2px solid #0d9488 !important;
            padding-bottom: 20px !important;
            margin-bottom: 30px !important;
          }

          .company-brand {
            text-align: left !important;
          }

          .company-logo {
            width: 80px !important;
            height: 80px !important;
            margin-bottom: 10px !important;
            object-fit: contain !important;
          }

          .company-name {
            color: #0d9488 !important; /* Company Teal */
            font-size: 24px !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            letter-spacing: -0.05em !important;
            margin: 0 !important;
          }

          .company-slogan {
            color: #64748b !important;
            font-size: 8px !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.3em !important;
            margin-top: 4px !important;
          }

          .profile-photo-area {
            text-align: right !important;
          }

          .print-profile-photo {
            width: 120px !important;
            height: 120px !important;
            border-radius: 12px !important;
            border: 3px solid #f1f5f9 !important;
            object-fit: cover !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
          }

          .print-content {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-end !important;
            width: 100% !important;
          }

          .detail-row {
            display: flex !important;
            justify-content: flex-end !important;
            width: 100% !important;
            margin-bottom: 8px !important;
            border-bottom: 1px solid #f1f5f9 !important;
            padding-bottom: 4px !important;
          }

          .detail-label {
            font-size: 8px !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            color: #94a3b8 !important;
            margin-right: 15px !important;
            letter-spacing: 0.1em !important;
          }

          .detail-value {
            font-size: 11px !important;
            font-weight: 700 !important;
            color: #0f172a !important;
            text-align: right !important;
          }

          .section-title {
            color: #0d9488 !important;
            font-size: 10px !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.2em !important;
            margin-top: 25px !important;
            margin-bottom: 10px !important;
            border-left: 4px solid #0d9488 !important;
            padding-left: 10px !important;
            width: fit-content !important;
            margin-left: auto !important;
          }

          .briefing-box {
            background: #f8fafc !important;
            padding: 15px !important;
            border-radius: 10px !important;
            font-size: 10px !important;
            line-height: 1.6 !important;
            color: #334155 !important;
            text-align: right !important;
            width: 80% !important;
            margin-left: auto !important;
            border: 1px solid #e2e8f0 !important;
          }

          .footer {
            margin-top: 50px !important;
            padding-top: 20px !important;
            border-top: 1px solid #e2e8f0 !important;
            text-align: center !important;
            font-size: 7px !important;
            color: #94a3b8 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.2em !important;
          }
        }
      `}</style>

      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white no-print">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/users')} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-600"><ArrowLeft size={18} /></button>
            <div className="h-6 w-px bg-slate-100 mx-2"></div>
            <div className="hidden sm:block">
               <h2 className="text-sm font-black uppercase tracking-widest leading-none text-slate-900">Identity Depth-Scan</h2>
               <p className="text-[7px] text-teal-600 font-black uppercase tracking-[0.3em] mt-1.5">{roleType?.toUpperCase()} NODE: {user.id}</p>
            </div>
         </div>

         <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <SearchBlock variant="admin" placeholder="Search other personnel nodes..." />
         </div>
         <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600/10 hover:bg-teal-600 text-teal-600 hover:text-white border border-teal-600/20 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all shadow-lg group"
            >
               <Download size={12} className="group-hover:scale-110 transition-transform" /> Export Profile
            </button>
            <button onClick={() => navigate(`/admin/users/manage/${user.id}?role_type=${roleType}`)} className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all text-slate-600">
               <Edit2 size={12} className="text-teal-600" /> Modify Node
            </button>
         </div>
      </div>

      <div className="flex-1 p-6 md:p-12 print:p-0">
        <div className="max-w-6xl mx-auto space-y-8 print:hidden">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                 <div className="bg-white border border-slate-200 rounded-[40px] p-8 text-center shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 to-blue-600"></div>
                    <div className="relative mb-6 inline-block">
                       <div className="w-32 h-32 rounded-[48px] bg-slate-50 border-2 border-teal-500/20 flex items-center justify-center overflow-hidden shadow-xl mx-auto">
                          {!imageError ? (
                            <img src={profilePhotoUrl} alt={user.display_name} onError={() => setImageError(true)} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-4xl font-black text-slate-300">{(user.display_name || "U")[0]}</div>
                          )}
                       </div>
                       <div className="absolute -bottom-2 -right-2 bg-teal-500 p-2.5 rounded-2xl border-4 border-white shadow-xl text-white"><Shield size={14} /></div>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">{user.display_name}</h3>
                    <p className="text-[8px] font-black text-teal-600 uppercase tracking-[0.4em] mt-2 mb-8">{user.role || user.primary_role || 'Personnel'}</p>
                    <div className="grid grid-cols-2 gap-2">
                       <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                          <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                          <p className={`text-[9px] font-black uppercase mt-1 ${user.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>{user.is_active ? 'Online' : 'Offline'}</p>
                       </div>
                       <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
                          <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Security</p>
                          <p className={`text-[9px] font-black text-teal-600 uppercase mt-1`}>Cleared</p>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white border border-slate-200 rounded-[32px] p-6 space-y-5 shadow-lg">
                    <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 pb-3">Relay connectivity</h4>
                    <div className="space-y-4 text-slate-600">
                       {[
                         { icon: Mail, label: "Primary Relay", val: user.email },
                         { icon: Phone, label: "Secure Line", val: user.phone_number || '---' },
                         { icon: Phone, label: "Backup Phone", val: user.alt_phone || '---' },
                         { icon: MapPin, label: "Full Address", val: user.physical_address || '---' },
                         { icon: Calendar, label: "Creation Seq.", val: new Date(user.created_at).toLocaleDateString() }
                       ].map(item => (
                         <div key={item.label} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400"><item.icon size={14} /></div>
                            <div className="min-w-0 flex-1">
                               <p className="text-[6px] font-black text-slate-400 uppercase">{item.label}</p>
                               <p className="text-[10px] font-bold truncate text-slate-900">{item.val}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="lg:col-span-8 space-y-8">
                 <div className="bg-white border border-slate-200 rounded-[40px] p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[80px] -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                       <div className="flex items-center gap-3 mb-8 text-teal-600"><Activity size={18} /><h4 className="text-[11px] font-black uppercase tracking-widest">Node Analysis</h4></div>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {[
                            { label: "Access Node", val: user.access_level || 'standard' },
                            { label: "Department", val: user.department || 'Operations' },
                            { label: "Identification", val: user.id_number || '---' },
                            { label: "Professional Focus", val: user.expertise || '---' },
                            { label: "Uptime IP", val: user.last_login_ip || '---' },
                            { label: "Sync Time", val: user.last_login_at ? new Date(user.last_login_at).toLocaleTimeString() : 'N/A' },
                            { label: "Emergency Contact", val: user.emergency_contact_name || '---' },
                            { label: "Emergency Phone", val: user.emergency_contact_phone || '---' }
                          ].map(stat => (
                            <div key={stat.label}>
                               <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
                               <p className="text-[10px] font-black text-slate-900 uppercase truncate">{stat.val}</p>
                            </div>
                          ))}
                       </div>
                       <div className="mt-8 grid md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                          <div>
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-3">Operational Directive / Technical Brief</p>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 italic text-slate-600 text-[10px] leading-relaxed h-32 overflow-y-auto">
                              {user.mission_briefing || "No mission briefing recorded."}
                            </div>
                          </div>
                          <div>
                            <p className="text-[7px] font-black text-rose-600 uppercase tracking-widest mb-3">Internal Company Notes (Restricted)</p>
                            <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 text-rose-700 text-[10px] leading-relaxed h-32 overflow-y-auto">
                              {user.private_notes || "No private notes recorded for this node."}
                            </div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="bg-slate-50 border border-slate-100 rounded-[40px] p-8">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-3 text-blue-600"><Briefcase size={18} /><h4 className="text-[11px] font-black uppercase tracking-widest">Deployments & Projects</h4></div>
                    </div>

                    {/* Manual Project Node */}
                    {user.manual_projects && (
                      <div className="mb-6 p-6 bg-amber-50 border border-amber-100 rounded-3xl">
                        <p className="text-[7px] font-black text-amber-600 uppercase tracking-widest mb-2">Legacy / Manual Project References</p>
                        <p className="text-[10px] text-slate-600 italic leading-relaxed">{user.manual_projects}</p>
                      </div>
                    )}

                    <div className="space-y-4">
                       {projects.length > 0 ? projects.map(proj => (
                         <div key={proj.id} onClick={() => navigate('/admin/projects')} className="bg-white border border-slate-200 p-5 rounded-[30px] flex items-center justify-between group hover:bg-slate-100 cursor-pointer transition-all shadow-sm">
                            <div className="flex items-center gap-5">
                               <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-all shadow-lg"><FolderKanban size={20} /></div>
                               <div>
                                  <p className="text-[11px] font-black uppercase tracking-tight text-slate-900">{proj.project_name}</p>
                                  <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest mt-1">Status: {proj.status} • {formatKSH(proj.estimated_budget)}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-6">
                               <div className="text-right hidden md:block">
                                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Progression</p>
                                  <p className="text-[10px] font-black text-teal-600 mt-0.5">{proj.progress_percentage}%</p>
                               </div>
                               <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
                            </div>
                         </div>
                       )) : (
                         <div className="py-20 text-center bg-white rounded-[40px] border border-dashed border-slate-200 font-black uppercase text-[10px] text-slate-300">Zero Project Clusters Found</div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      {/* Formal Document Print View */}
      <div className="hidden print:flex print-container p-12 bg-white min-h-screen text-slate-900 flex-col">
         {/* Top Header Section */}
         <div className="flex justify-between items-start w-full border-b-2 border-slate-100 pb-8 mb-10">
            {/* Top Left: Logo & Company Name */}
            <div className="flex items-start gap-4">
               <img src="/favicon.svg" alt="GSF" className="w-16 h-16 object-contain" />
               <div className="company-brand text-left">
                  <div className="text-[#0d9488] text-3xl font-black uppercase tracking-tighter leading-none">Greggory Systems</div>
                  <div className="text-[#0d9488] text-3xl font-black uppercase tracking-tighter leading-none" style={{ marginTop: '-4px' }}>& Strategy Firm</div>
                  <div className="text-slate-500 text-[8px] font-black uppercase tracking-[0.4em] mt-2">Strategic Systems & Business Solutions</div>
               </div>
            </div>

            {/* Top Right: Label & Profile Photo (Under Label) */}
            <div className="flex flex-col items-end gap-3">
               <div className="bg-[#0d9488]/10 px-4 py-2 rounded-lg border border-[#0d9488]/20 text-right">
                  <p className="text-[10px] font-black text-[#0d9488] uppercase tracking-[0.4em]">Personnel Identity Report</p>
               </div>

               <div className="profile-photo-area">
                  {!imageError ? (
                     <img src={profilePhotoUrl} alt={user.display_name} className="w-32 h-32 rounded-2xl border-4 border-slate-100 shadow-xl object-cover" />
                  ) : (
                     <div className="w-32 h-32 rounded-2xl bg-slate-100 border-4 border-slate-50 flex items-center justify-center text-4xl font-black text-slate-300">
                        {(user.display_name || "U")[0]}
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Main Content - All Details Aligned to the Right */}
         <div className="print-content w-full flex flex-col items-end space-y-4">

            <div className="section-title text-[#0d9488] text-[11px] font-black uppercase tracking-widest border-b-2 border-[#0d9488]/20 pb-1 mb-2 w-fit">Primary Identification Matrix</div>

            {[
               { label: "Full Legal Identity", value: user.display_name },
               { label: "Identity Reference", value: user.id_number || 'NOT RECORDED' },
               { label: "Assigned Primary Role", value: user.role || user.primary_role || 'Personnel' },
               { label: "Secure Relay Email", value: user.email },
               { label: "Primary Secure Line", value: user.phone_number || 'NOT RECORDED' },
               { label: "Alternate Secure Line", value: user.alt_phone || 'NOT RECORDED' },
               { label: "Physical Command Base", value: user.physical_address || 'NOT RECORDED' },
               { label: "System Node Status", value: user.is_active ? 'ACTIVE / ONLINE' : 'INACTIVE / OFFLINE' },
               { label: "Node Creation Sequence", value: new Date(user.created_at).toLocaleDateString() },
            ].map(item => (
               <div key={item.label} className="flex justify-end gap-12 border-b border-slate-50 py-1.5 w-3/4">
                  <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  <span className="text-[10px] font-bold text-slate-900 text-right">{item.value}</span>
               </div>
            ))}

            <div className="section-title text-[#0d9488] text-[11px] font-black uppercase tracking-widest border-b-2 border-[#0d9488]/20 pb-1 mt-6 mb-2 w-fit">Emergency Connectivity</div>
            {[
               { label: "Emergency Contact Node", value: user.emergency_contact_name || 'NOT RECORDED' },
               { label: "Emergency Contact Phone", value: user.emergency_contact_phone || 'NOT RECORDED' },
            ].map(item => (
               <div key={item.label} className="flex justify-end gap-12 border-b border-slate-50 py-1.5 w-3/4">
                  <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                  <span className="text-[10px] font-bold text-slate-900 text-right">{item.value}</span>
               </div>
            ))}

            <div className="section-title text-[#0d9488] text-[11px] font-black uppercase tracking-widest border-b-2 border-[#0d9488]/20 pb-1 mt-6 mb-2 w-fit">Operational Mission Briefing</div>
            <div className="w-3/4 bg-slate-50/50 p-6 rounded-2xl text-[10px] text-slate-700 italic leading-relaxed text-right border border-slate-100">
               {user.mission_briefing || "Zero directives assigned to this identity node in current cycle."}
            </div>

            {projects.length > 0 && (
               <>
                  <div className="section-title text-[#0d9488] text-[11px] font-black uppercase tracking-widest border-b-2 border-[#0d9488]/20 pb-1 mt-6 mb-2 w-fit">Active System Deployments</div>
                  {projects.map(p => (
                     <div key={p.id} className="flex justify-end gap-12 border-b border-slate-50 py-1.5 w-3/4">
                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">{p.status}</span>
                        <span className="text-[10px] font-bold text-slate-900 text-right">{p.project_name} ({p.progress_percentage}% SYNC)</span>
                     </div>
                  ))}
               </>
            )}

            <div className="section-title text-rose-500 text-[11px] font-black uppercase tracking-widest border-b-2 border-rose-500/20 pb-1 mt-6 mb-2 w-fit">Restricted Company Intelligence</div>
            <div className="w-3/4 text-[9px] text-rose-700 bg-rose-50/50 p-4 rounded-xl text-right border border-rose-100 font-medium">
               {user.private_notes || "No restricted company notes recorded for this personnel node."}
            </div>

            {/* Signature Block */}
            <div className="mt-24 flex flex-col items-end w-3/4">
               <div className="w-56 border-t border-slate-900 pt-3 text-center">
                  <p className="text-[8px] font-black uppercase tracking-[0.3em]">Board Authorization</p>
                  <p className="text-[6px] text-slate-400 font-bold uppercase tracking-widest mt-1">Greggory Systems & Strategy Firm</p>
               </div>
            </div>
         </div>

         {/* Document Footer */}
         <div className="mt-auto pt-10 border-t border-slate-100 flex justify-between items-center w-full text-slate-400">
            <div className="text-[6.5px] font-black uppercase tracking-widest">
               © {new Date().getFullYear()} Greggory Systems & Strategy Firm
            </div>
            <div className="text-[6.5px] font-black uppercase tracking-widest">
               REF: GSF-IDENT-NODE-{user.id} | GEN: {new Date().toLocaleString()}
            </div>
            <div className="text-[6.5px] font-black uppercase tracking-widest text-[#0d9488]">
               AUTHENTICATED SYSTEM DOCUMENT
            </div>
         </div>
      </div>
    </div>
  );
}
