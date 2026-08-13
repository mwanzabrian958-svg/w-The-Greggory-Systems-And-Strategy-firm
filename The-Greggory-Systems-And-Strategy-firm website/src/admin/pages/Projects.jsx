import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../services/api";
import { CreateProjectModal, EditProjectModal } from "../components/ProjectModals";
import { FolderKanban, Plus, Search, Edit2, Trash2, Calendar, User, DollarSign, Clock, MoreVertical, Filter, TrendingUp, RefreshCw, LayoutDashboard, BarChart3, ChevronRight, CheckSquare } from "lucide-react";

/**
 * Projects - Mission Node Management
 */
export function Projects({ user }) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("kanban");

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/user-projects");
      if (Array.isArray(data)) {
        setProjects(data);
      } else if (data.success) {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Project Relay Failure:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (formData) => {
    try {
      const res = await apiCall("/user-projects", {
        method: 'POST',
        body: JSON.stringify({ ...formData, created_by: user?.id })
      });
      if (res.id) fetchProjects();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleUpdateProject = async (id, formData) => {
    try {
      const res = await apiCall(`/user-projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...formData, updated_by: user?.id })
      });
      fetchProjects();
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Confirm Mission Termination? Data will be archived.")) return;
    try {
      await apiCall(`/user-projects/${id}`, {
        method: 'DELETE',
        body: JSON.stringify({ deleted_by: user?.id })
      });
      fetchProjects();
    } catch (e) { console.error(e); }
  };

  const columns = [
    { id: "planning", title: "Planning", color: "bg-amber-500" },
    { id: "in-progress", title: "Active", color: "bg-blue-500" },
    { id: "on-hold", title: "On Hold", color: "bg-orange-500" },
    { id: "completed", title: "Solidified", color: "bg-emerald-500" }
  ];

  const filteredProjects = projects.filter(p => {
    const matchesSearch = (p.project_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading && projects.length === 0) return (
    <div className="flex flex-col items-center justify-center py-40">
       <RefreshCw className="animate-spin text-teal-600 w-8 h-8" />
       <p className="mt-4 text-[7px] font-black text-slate-400 uppercase tracking-[0.6em]">Polling Project Nodes...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mission Control: Projects</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Asset Deployment & Tracking</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
             <button onClick={() => setViewMode("kanban")} className={`p-1.5 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-400'}`}><LayoutDashboard size={12} /></button>
             <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-teal-600' : 'text-slate-400'}`}><BarChart3 size={12} /></button>
          </div>
          <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-600 text-white font-black text-[8px] uppercase tracking-widest shadow-md hover:bg-teal-700 border border-teal-400/20">
            <Plus size={12} /> New Project
          </button>
        </div>
      </div>

      <div className="flex gap-4 items-center">
         <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Search mission nodes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 bg-white shadow-sm text-[11px] font-bold outline-none focus:ring-2 focus:ring-teal-500/20 transition-all" />
         </div>
         <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm">
            <option value="all">All Sectors</option>
            {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
         </select>
      </div>

      {viewMode === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
          {columns.map(col => {
            const colProjects = filteredProjects.filter(p => (p.status || 'planning') === col.id);
            return (
              <div key={col.id} className="flex-shrink-0 w-80">
                <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-100 min-h-[500px]">
                  <div className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${col.color}`} />
                       <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{col.title}</h3>
                    </div>
                    <span className="bg-white px-3 py-1 rounded-lg text-[8px] font-black text-slate-400 border border-slate-100 shadow-sm">{colProjects.length}</span>
                  </div>
                  <div className="space-y-4">
                    {colProjects.length > 0 ? colProjects.map(p => (
                      <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden" onClick={() => { setSelectedProject(p); setIsEditModalOpen(true); }}>
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }} className="p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-lg transition-all"><Trash2 size={12} /></button>
                        </div>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-[10px] font-black text-slate-900 uppercase leading-tight group-hover:text-teal-600 transition-colors">{p.project_name}</h4>
                            <p className="text-[8px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{p.client_name || 'Generic Asset'}</p>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/projects/${p.id}/tasks`); }} className="p-1.5 bg-slate-50 hover:bg-teal-50 text-slate-400 hover:text-teal-600 rounded-lg transition-all border border-slate-100"><CheckSquare size={14} /></button>
                        </div>
                        <div className="space-y-3">
                           <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-500 rounded-full transition-all duration-1000" style={{ width: `${p.progress_percentage || 0}%` }} />
                           </div>
                           <div className="flex justify-between items-center text-[7px] font-black uppercase text-slate-400 tracking-widest">
                              <span className="flex items-center gap-1.5"><TrendingUp size={10} className="text-teal-500" /> {p.progress_percentage || 0}% SYNC</span>
                              <span className="flex items-center gap-1.5"><Clock size={10} /> {new Date(p.created_at).toLocaleDateString()}</span>
                           </div>
                        </div>
                      </div>
                    )) : (
                      <div className="py-20 text-center opacity-20"><FolderKanban size={24} className="mx-auto mb-3" /><p className="text-[8px] font-black uppercase tracking-[0.4em]">Sector Clear</p></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === "list" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    <th className="px-6 py-4 text-[8px] font-black uppercase text-slate-400 tracking-widest">Mission Node</th>
                    <th className="px-6 py-4 text-[8px] font-black uppercase text-slate-400 tracking-widest">Client Identity</th>
                    <th className="px-6 py-4 text-[8px] font-black uppercase text-slate-400 tracking-widest">Telemetry</th>
                    <th className="px-6 py-4 text-[8px] font-black uppercase text-slate-400 tracking-widest">Valuation</th>
                    <th className="px-6 py-4 text-[8px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredProjects.length > 0 ? filteredProjects.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-all cursor-pointer group" onClick={() => { setSelectedProject(p); setIsEditModalOpen(true); }}>
                       <td className="px-6 py-5">
                          <p className="text-[10px] font-black text-slate-900 uppercase group-hover:text-teal-600 transition-colors">{p.project_name}</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: PRJ-{p.id.toString().padStart(4, '0')}</p>
                       </td>
                       <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-black">{p.client_name?.[0] || 'G'}</div>
                             <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">{p.client_name || 'Generic Asset'}</p>
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                             <span className={`inline-flex px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest border ${p.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : p.status === 'on-hold' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{columns.find(c => c.id === p.status)?.title || 'Planning'}</span>
                             <div className="flex flex-col gap-1 w-20">
                                <div className="h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${p.progress_percentage}%` }} /></div>
                                <span className="text-[6px] font-black text-slate-400 text-right">{p.progress_percentage}%</span>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-5">
                          <p className="font-black text-[10px] text-slate-900">KSh {parseFloat(p.estimated_budget || 0).toLocaleString()}</p>
                          <p className="text-[7px] text-slate-400 font-black uppercase mt-1">Estimated Cost</p>
                       </td>
                       <td className="px-6 py-5 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => navigate(`/admin/projects/${p.id}/tasks`)} className="p-2 hover:bg-white rounded-xl text-teal-600 shadow-sm border border-slate-100" title="Tasks"><CheckSquare size={14} /></button>
                            <button onClick={() => { setSelectedProject(p); setIsEditModalOpen(true); }} className="p-2 hover:bg-white rounded-xl text-blue-500 shadow-sm border border-slate-100"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteProject(p.id)} className="p-2 hover:bg-white rounded-xl text-rose-500 shadow-sm border border-slate-100"><Trash2 size={14} /></button>
                          </div>
                       </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="py-40 text-center opacity-20 uppercase font-black text-[12px] tracking-[0.5em]">No Mission Project Nodes Synchronized</td></tr>
                  )}
               </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODALS */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdateProject}
        project={selectedProject}
      />
    </div>
  );
}

