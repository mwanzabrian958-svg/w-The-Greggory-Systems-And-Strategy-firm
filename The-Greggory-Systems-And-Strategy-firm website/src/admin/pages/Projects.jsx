import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../services/api";
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

  const columns = [
    { id: "planning", title: "Planning", color: "bg-amber-500" },
    { id: "active", title: "Active", color: "bg-blue-500" },
    { id: "review", title: "Audit", color: "bg-purple-500" },
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
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-600 text-white font-black text-[8px] uppercase tracking-widest shadow-md hover:bg-teal-700 border border-teal-400/20">
            <Plus size={12} /> New Project
          </button>
        </div>
      </div>

      {viewMode === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar">
          {columns.map(col => {
            const colProjects = filteredProjects.filter(p => (p.status || 'planning') === col.id);
            return (
              <div key={col.id} className="flex-shrink-0 w-64">
                <div className="bg-slate-100/50 rounded-xl p-3 border border-slate-100">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                       <div className={`w-1.5 h-1.5 rounded-full ${col.color}`} />
                       <h3 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{col.title}</h3>
                    </div>
                    <span className="bg-white px-2 py-0.5 rounded-md text-[6px] font-black text-slate-400 border border-slate-100">{colProjects.length}</span>
                  </div>
                  <div className="space-y-3">
                    {colProjects.length > 0 ? colProjects.map(p => (
                      <div key={p.id} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-[9px] font-black text-slate-900 uppercase leading-tight group-hover:text-teal-600 truncate pr-2">{p.project_name}</h4>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/projects/${p.id}/tasks`); }} className="p-1 hover:bg-slate-100 rounded text-teal-600"><CheckSquare size={12} /></button>
                        </div>
                        <div className="space-y-2">
                           <div className="h-0.5 w-full bg-slate-50 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${p.progress_percentage || 0}%` }} />
                           </div>
                           <div className="flex justify-between items-center text-[6px] font-black uppercase text-slate-400 tracking-widest">
                              <span>Prog: {p.progress_percentage || 0}%</span>
                              <span className="flex items-center gap-1"><Clock size={8} /> {new Date(p.created_at).toLocaleDateString()}</span>
                           </div>
                        </div>
                      </div>
                    )) : (
                      <div className="py-10 text-center opacity-10"><p className="text-[7px] font-black uppercase tracking-widest">Clear</p></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === "list" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-4 py-3 text-[7px] font-black uppercase text-slate-400 tracking-widest">Project Mission</th>
                    <th className="px-4 py-3 text-[7px] font-black uppercase text-slate-400 tracking-widest">Telemetry Status</th>
                    <th className="px-4 py-3 text-[7px] font-black uppercase text-slate-400 tracking-widest">Value (KSh)</th>
                    <th className="px-4 py-3 text-[7px] font-black uppercase text-slate-400 tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredProjects.length > 0 ? filteredProjects.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                       <td className="px-4 py-3">
                          <p className="text-[9px] font-black text-slate-900 uppercase">{p.project_name}</p>
                          <p className="text-[7px] text-slate-400 uppercase tracking-widest mt-0.5">{p.client_name || 'Generic Asset'}</p>
                       </td>
                       <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-md text-[6px] font-black uppercase tracking-tighter ${p.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{p.status || 'Planning'}</span>
                       </td>
                       <td className="px-4 py-3 font-black text-[9px] text-slate-900">KSh {parseFloat(p.estimated_budget || 0).toLocaleString()}</td>
                       <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => navigate(`/admin/projects/${p.id}/tasks`)} className="p-1.5 hover:bg-white rounded-lg text-teal-600" title="Tasks"><CheckSquare size={12} /></button>
                            <button className="p-1.5 hover:bg-white rounded-lg text-slate-400"><MoreVertical size={12} /></button>
                          </div>
                       </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="py-20 text-center opacity-20 uppercase font-black text-[10px]">No Project Nodes Synchronized</td></tr>
                  )}
               </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
