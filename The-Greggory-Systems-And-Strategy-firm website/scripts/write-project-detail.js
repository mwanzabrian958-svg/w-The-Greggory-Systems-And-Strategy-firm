const fs = require('fs');
const p = 'c:/Users/Lydia mwanza/OneDrive/Desktop/personal projects/w-The-Greggory-Systems-And-Strategy-firm/The-Greggory-Systems-And-Strategy-firm website/src/admin/pages/ProjectDetail.jsx';
let c = fs.readFileSync(p, 'utf8').replace('// placeholder', '');
c += `
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
          <span className={\`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest \${
            project.status === "completed" ? "bg-emerald-50 text-emerald-600" :
            project.status === "in-progress" ? "bg-blue-50 text-blue-600" :
            project.status === "on-hold" ? "bg-orange-50 text-orange-600" : "bg-amber-50 text-amber-600"
          }\`}>{project.status}</span>
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
            className={\`px-4 py-2 text-[8px] font-black uppercase tracking-widest border-b-2 transition-all \${
              activeTab === tab ? "border-teal-600 text-teal-600" : "border-transparent text-slate-400 hover:text-slate-600"
            }\`}>{tab}</button>
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
                      <span className={\`text-[9px] font-bold \${t.status === "completed" ? "text-slate-400 line-through" : "text-slate-700"}\`}>{t.task_name}</span>
                      <span className={\`ml-auto text-[6px] font-black uppercase px-2 py-0.5 rounded-full \${
                        t.priority === "high" ? "bg-rose-50 text-rose-600" : t.priority === "medium" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"
                      }\`}>{t.priority}</span>
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
`;
fs.writeFileSync(p, c, 'utf8');
console.log('ProjectDetail.jsx complete:', c.length, 'chars');
