import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckSquare, Plus, X, Save, RefreshCw, Trash2,
  Clock, AlertCircle, ChevronLeft, User, Calendar, Tag
} from "lucide-react";
import { getApiUrl, API_BASE_URL } from "../../services/api";

/**
 * ProjectTasks - Standalone Full-Screen Task Management Node
 * Optimized with high-density compact blocks and micro-typography.
 */
export function ProjectTasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [team, setTeam] = useState([]);

  const [newTask, setNewTask] = useState({
    task_name: "",
    task_description: "",
    assigned_to: "",
    status: "not_started",
    priority: "medium",
    due_date: ""
  });

  useEffect(() => {
    fetchProjectData();
    fetchTeam();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      // Fetch specific project details
      const pRes = await fetch(getApiUrl(`/api/user-projects/${projectId}`));
      if (pRes.ok) {
        const pData = await pRes.json();
        setProject(pData);
      }

      // Fetch tasks for this project
      const tRes = await fetch(getApiUrl(`/api/projects/${projectId}/tasks`));
      if (tRes.ok) {
        const tData = await tRes.json();
        setTasks(tData.tasks || []);
      }
    } catch (e) {
      console.error("Relay Failure:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await fetch(getApiUrl("/api/users"));
      if (res.ok) {
        const data = await res.json();
        // Filter for personnel who can be assigned tasks
        setTeam(data.users || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(getApiUrl(`/api/projects/${projectId}/tasks`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask)
      });
      if (res.ok) {
        setShowAddForm(false);
        setNewTask({ task_name: "", task_description: "", assigned_to: "", status: "not_started", priority: "medium", due_date: "" });
        fetchProjectData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await fetch(getApiUrl(`/api/tasks/${taskId}/status`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Terminate this task node?")) return;
    try {
      const res = await fetch(getApiUrl(`/api/tasks/${taskId}`), { method: "DELETE" });
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center"><RefreshCw className="animate-spin text-teal-500" size={24} /></div>;

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-[500] flex flex-col overflow-hidden font-sans text-white">
      {/* Tighter Header */}
      <div className="bg-[#0f172a] px-6 py-3 flex items-center justify-between border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-500 border border-teal-500/20">
            <CheckSquare size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase leading-none tracking-tighter">Task Management Hub</h2>
            <p className="text-[7px] text-slate-500 font-black uppercase tracking-[0.4em] mt-1">Project Node: <span className="text-teal-400">{project?.project_name || "Unknown"}</span></p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-teal-700 shadow-lg"
          >
            <Plus size={14} /> New Task
          </button>
          <button
            onClick={() => navigate('/admin/projects')}
            className="px-4 py-2 bg-white/5 text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all border border-white/10"
          >
            <X size={14} /> Return
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-950 p-6 md:p-10 pb-32">
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Dashboard Telemetry Nodes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Tasks", val: tasks.length, color: "text-blue-400" },
              { label: "Completed", val: tasks.filter(t => t.status === 'completed').length, color: "text-emerald-400" },
              { label: "In Progress", val: tasks.filter(t => t.status === 'in_progress').length, color: "text-sky-400" },
              { label: "Blocked/Late", val: tasks.filter(t => t.status === 'blocked').length, color: "text-rose-400" },
            ].map(stat => (
              <div key={stat.label} className="bg-white/2 border border-white/5 rounded-2xl p-4 shadow-xl">
                <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
              </div>
            ))}
          </div>

          {/* Task Grid - Compact Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.length > 0 ? tasks.map(task => (
              <div key={task.id} className="bg-white/2 border border-white/5 rounded-[32px] p-5 hover:bg-white/5 transition-all group flex flex-col h-full shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                   <span className={`px-2 py-0.5 rounded text-[6px] font-black uppercase border ${
                     task.priority === 'urgent' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                     task.priority === 'high' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                     'bg-blue-500/10 text-blue-500 border-blue-500/20'
                   }`}>{task.priority}</span>
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleDeleteTask(task.id)} className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={10} /></button>
                   </div>
                </div>

                <h4 className="text-[11px] font-black text-white uppercase tracking-tight mb-2">{task.task_name}</h4>
                <p className="text-[9px] text-slate-400 leading-relaxed mb-6 line-clamp-3">{task.task_description || "Strategic sub-node description pending."}</p>

                <div className="mt-auto space-y-4">
                   <div className="flex items-center justify-between text-[7px] font-black uppercase text-slate-500 tracking-widest border-t border-white/5 pt-4">
                      <div className="flex items-center gap-1.5">
                         <User size={10} className="text-teal-500" />
                         <span>{task.assigned_to_name || "Unassigned"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                         <Calendar size={10} className="text-blue-500" />
                         <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : "No Date"}</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-[8px] font-black uppercase text-white outline-none focus:border-teal-500"
                      >
                         <option value="not_started" className="bg-[#0f172a]">NOT STARTED</option>
                         <option value="in_progress" className="bg-[#0f172a]">IN PROGRESS</option>
                         <option value="completed" className="bg-[#0f172a]">COMPLETED</option>
                         <option value="blocked" className="bg-[#0f172a]">BLOCKED</option>
                      </select>
                      <div className="flex items-center justify-center bg-white/5 rounded-lg border border-white/10">
                         <p className="text-[7px] font-black text-slate-500 uppercase">Node Sync</p>
                      </div>
                   </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center bg-white/2 rounded-[40px] border border-dashed border-white/5">
                 <CheckSquare size={48} className="mx-auto text-slate-800 mb-4 opacity-20" />
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">No Active Task Nodes Found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* COMPACT TASK ADD FORM - FULL SCREEN SUB-WORKSPACE */}
      {showAddForm && (
        <div className="fixed inset-0 bg-[#0f172a] z-[600] animate-in fade-in duration-300 flex items-center justify-center p-6">
           <div className="bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
              <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-950">
                 <div className="flex items-center gap-3">
                    <Plus className="text-teal-500" />
                    <h3 className="text-xl font-black uppercase tracking-tighter">Initialize Task Node</h3>
                 </div>
                 <button onClick={() => setShowAddForm(false)} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white"><X size={18} /></button>
              </div>
              <form onSubmit={handleAddTask} className="p-8 space-y-6 flex-1 overflow-y-auto">
                 <div>
                    <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Task Objective</label>
                    <input type="text" value={newTask.task_name} onChange={(e) => setNewTask({...newTask, task_name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold outline-none focus:border-teal-500" placeholder="Objective name..." required />
                 </div>
                 <div>
                    <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Technical Brief</label>
                    <textarea value={newTask.task_description} onChange={(e) => setNewTask({...newTask, task_description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-medium text-slate-300 outline-none h-24 resize-none" placeholder="Deployment instructions..." />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Assign Actor Node</label>
                       <select value={newTask.assigned_to} onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[9px] font-bold outline-none">
                          <option value="" className="bg-[#0f172a]">Select Personnel...</option>
                          {team.map(t => <option key={`${t.source_table}-${t.id}`} value={t.id} className="bg-[#0f172a]">{t.display_name}</option>)}
                       </select>
                    </div>
                    <div>
                       <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Execution Deadline</label>
                       <input type="date" value={newTask.due_date} onChange={(e) => setNewTask({...newTask, due_date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[9px] font-bold outline-none" required />
                    </div>
                 </div>
                 <div className="pt-10 flex gap-4">
                    <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-white/5 py-4 rounded-2xl text-[9px] font-black uppercase">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="flex-[2] bg-teal-600 hover:bg-teal-500 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3">
                       {isSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />} Commit Node
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
