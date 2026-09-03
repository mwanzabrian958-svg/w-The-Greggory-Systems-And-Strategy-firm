import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiCall } from "../../services/api";
import { formatKSH } from "../../utils/currencyUtils";
import { ArrowLeft, Calendar, User, DollarSign, Clock, CheckSquare, FileText, RefreshCw } from "lucide-react";

export function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [p, t] = await Promise.all([
        apiCall(`/user-projects/${id}`),
        apiCall(`/projects/${id}/tasks`)
      ]);
      setProject(p);
      setTasks(Array.isArray(t) ? t : []);
    } catch (e) { console.error("Project fetch failed:", e); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <RefreshCw className="animate-spin text-teal-600 w-8 h-8" />
      <p className="mt-4 text-[7px] font-black text-slate-400 uppercase tracking-[0.6em]">Loading Project Intel...</p>
    </div>
  );

  if (!project) return (
    <div className="text-center py-20">
      <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Project Not Found</p>
      <Link to="/admin/projects" className="mt-4 inline-block px-6 py-2 bg-slate-900 text-white rounded-xl text-[8px] font-black uppercase">Back to Projects</Link>
    </div>
  );

  const tasksByStatus = {
    not_started: tasks.filter(t => t.status === "not_started"),
    in_progress: tasks.filter(t => t.status === "in_progress"),
    completed: tasks.filter(t => t.status === "completed")
  };
\n
  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-[1400px] mx-auto">
      <Link to="/admin/projects" className="inline-flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest hover:text-teal-600">
        <ArrowLeft size={12} /> Back to Projects
      </Link>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">{project.project_name}</h1>
            <p className="text-slate-500 text-xs mt-1">{project.description || "No description"}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest ${
            project.status === "completed" ? "bg-emerald-50 text-emerald-600" :
            project.status === "in-progress" ? "bg-blue-50 text-blue-600" :
            project.status === "on-hold" ? "bg-orange-50 text-orange-600" : "bg-amber-50 text-amber-600"
          }`}>{project.status}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-50 rounded-xl p-3">
            <User size={12} className="text-slate-400 mb-1" />
            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Client</p>
            <p className="text-[10px] font-bold text-slate-900 mt-0.5">{project.client_name || "Unassigned"}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <Calendar size={12} className="text-slate-400 mb-1" />
            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Start Date</p>
            <p className="text-[10px] font-bold text-slate-900 mt-0.5">{project.start_date ? new Date(project.start_date).toLocaleDateString() : "Not set"}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <DollarSign size={12} className="text-slate-400 mb-1" />
            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Budget</p>
            <p className="text-[10px] font-bold text-slate-900 mt-0.5">{formatKSH(project.estimated_budget || 0)}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <Clock size={12} className="text-slate-400 mb-1" />
            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest">Progress</p>
            <p className="text-[10px] font-bold text-slate-900 mt-0.5">{project.progress_percentage || 0}%</p>
          </div>
        </div>
      </div>
      <div className="flex gap-1 border-b border-slate-100">
        {["tasks", "files", "timeline"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-[8px] font-black uppercase tracking-widest border-b-2 transition-all ${
              activeTab === tab ? "border-teal-600 text-teal-600" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}>{tab}</button>
        ))}
      </div>
      {activeTab === "tasks" && (
        <div className="space-y-4">
          {Object.entries(tasksByStatus).map(([status, items]) => (
            <div key={status} className="bg-white rounded-xl border border-slate-100 p-4">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">{status.replace("_", " ")} ({items.length})</h3>
              {items.length === 0 ? <p className="text-[8px] text-slate-400 italic">No tasks</p> : (
                <div className="space-y-2">
                  {items.map(t => (
                    <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-50">
                      <CheckSquare size={12} className={t.status === "completed" ? "text-emerald-500" : "text-slate-300"} />
                      <span className={`text-[9px] font-bold ${t.status === "completed" ? "text-slate-400 line-through" : "text-slate-700"}`}>{t.task_name}</span>
                      <span className={`ml-auto text-[6px] font-black uppercase px-2 py-0.5 rounded-full ${
                        t.priority === "high" ? "bg-rose-50 text-rose-600" : t.priority === "medium" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                      }`}>{t.priority}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {activeTab === "files" && (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
          <FileText size={24} className="mx-auto text-slate-300 mb-3" />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No files uploaded yet</p>
        </div>
      )}
      {activeTab === "timeline" && (
        <div className="bg-white rounded-xl border border-slate-100 p-8 text-center">
          <Clock size={24} className="mx-auto text-slate-300 mb-3" />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Timeline data unavailable</p>
        </div>
      )}
    </div>
  );
}
