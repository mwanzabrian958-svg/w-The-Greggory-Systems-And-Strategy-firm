import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../services/api";
import { formatKSH } from "../../utils/currencyUtils";
import { CreateProjectModal, EditProjectModal } from "../components/ProjectModals";
import { FolderKanban, Plus, Search, Edit2, Trash2, Calendar, User, DollarSign, Clock, MoreVertical, Filter, TrendingUp, RefreshCw, LayoutDashboard, BarChart3, ChevronRight, CheckSquare, X } from "lucide-react";

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
  const [focusedCategory, setFocusedCategory] = useState(null);

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
         <div className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-[7px] font-black text-slate-500 uppercase tracking-widest border border-slate-200/50">
            Use Global Strategic Search to locate specific mission nodes
         </div>
         <select
            value={statusFilter}
            onChange={(e) => {
              const val = e.target.value;
              setStatusFilter(val);
              if (val !== 'all') {
                const category = columns.find(c => c.id === val);
                setFocusedCategory(category);
              }
            }}
            className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm cursor-pointer hover:border-teal-500 transition-colors"
          >
            <option value="all">Select Sector to Monitor...</option>
            {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
         </select>
      </div>

      {/* Main Display: Sector Isolation Standby */}
      {!focusedCategory && (
        <div className="py-40 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
           <BarChart3 size={48} className="mx-auto text-slate-200 mb-6" />
           <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">Strategic Sectors Standby</h3>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Select a Sector from the Deployment Node to initiate full-screen monitoring</p>
        </div>
      )}

      {focusedCategory && (
        <div className="fixed inset-0 bg-[#f8fafc] z-[1000] flex flex-col animate-in fade-in zoom-in-95 duration-300">
          {/* Fullscreen Navbar */}
          <div className="bg-[#0f172a] text-white px-8 py-4 flex items-center justify-between border-b border-white/5 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${focusedCategory.color} animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.2)]`} />
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter leading-none">{focusedCategory.title} Sector</h2>
                <p className="text-[8px] text-teal-500 font-black uppercase tracking-[0.4em] mt-1">Full-Screen Strategic View</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="hidden md:flex gap-8">
                  <div className="text-right">
                    <p className="text-[7px] text-slate-500 font-black uppercase tracking-widest">Active Assets</p>
                    <p className="text-lg font-black">{filteredProjects.filter(p => (p.status || 'planning') === focusedCategory.id).length}</p>
                  </div>
               </div>
               <button
                onClick={() => {
                  setFocusedCategory(null);
                  setStatusFilter('all');
                }}
                className="p-3 bg-white/5 hover:bg-rose-600 text-slate-400 hover:text-white rounded-2xl border border-white/10 transition-all group"
               >
                <X className="w-6 h-6" />
               </button>
            </div>
          </div>

          {/* Fullscreen Content */}
          <div className="flex-1 overflow-y-auto p-12 bg-slate-50">
             <div className="max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                   {filteredProjects.filter(p => (p.status || 'planning') === focusedCategory.id).length > 0 ? (
                     filteredProjects.filter(p => (p.status || 'planning') === focusedCategory.id).map(p => (
                      <div
                        key={p.id}
                        className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden"
                        onClick={() => { setSelectedProject(p); setIsEditModalOpen(true); }}
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id); }} className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={16} /></button>
                        </div>

                        <div className="mb-8">
                          <h4 className="text-sm font-black text-slate-900 uppercase group-hover:text-teal-600 transition-colors mb-2">{p.project_name}</h4>
                          <div className="flex items-center gap-2 mb-4">
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-black uppercase tracking-widest">{p.client_name || 'Internal'}</span>
                            <span className="text-[9px] text-teal-600 font-bold">{formatKSH(p.estimated_budget)}</span>
                          </div>
                        </div>

                        <div className="space-y-6">
                           <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(20,184,166,0.3)]" style={{ width: `${p.progress_percentage || 0}%` }} />
                           </div>
                           <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-400 tracking-widest">
                              <span className="flex items-center gap-2"><TrendingUp size={12} className="text-teal-500" /> {p.progress_percentage || 0}% SYNC</span>
                              <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/projects/${p.id}/tasks`); }} className="flex items-center gap-2 text-teal-600 hover:text-teal-700 transition-colors"><CheckSquare size={12} /> Access Tasks</button>
                           </div>
                        </div>
                      </div>
                     ))
                   ) : (
                    <div className="col-span-full py-40 text-center opacity-20 flex flex-col items-center">
                       <FolderKanban size={64} className="mb-6 text-slate-400" />
                       <h3 className="text-2xl font-black uppercase tracking-[0.5em] text-slate-900">{focusedCategory.title} Sector Clear</h3>
                       <p className="text-sm font-bold uppercase tracking-widest mt-4">Zero synchronized assets in this node.</p>
                    </div>
                   )}
                </div>
             </div>
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

