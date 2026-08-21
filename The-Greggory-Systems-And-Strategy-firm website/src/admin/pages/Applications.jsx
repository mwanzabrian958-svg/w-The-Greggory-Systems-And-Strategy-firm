import React, { useState, useEffect } from "react";
import { ClipboardList, CheckCircle, XCircle, Clock, Search, Filter, RefreshCw, ChevronRight } from "lucide-react";
import { apiCall } from "../../services/api";

/**
 * Applications - Inbound Request Telemetry
 * Optimized with compact containers and tiny typography.
 */
export function Applications({ user }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const data = await apiCall("/admin/pending-invoices");
        if (data) {
          setApps(data.data || []);
        }
        setLoading(false);
      } catch (e) { console.error(e); setLoading(false); }
    };
    fetchApps();
  }, []);

  const filtered = apps.filter(a => (a.project || "").toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="flex items-center justify-center py-20"><RefreshCw className="animate-spin text-teal-600 w-6 h-6" /></div>;

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Applications Relay</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Awaiting System Validation</p>
        </div>
        <div className="px-4 py-1.5 rounded-lg bg-white border border-slate-100 shadow-sm text-[8px] font-black uppercase tracking-widest text-slate-500">
           Pending Nodes: {filtered.length}
        </div>
      </div>

      <div className="bg-[#0f172a] rounded-xl p-3 border border-white/10 shadow-xl">
        <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.4em] text-center">
           Awaiting Verification Stream - Deep Scan via Global System Query
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((app) => (
          <div key={app.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-md hover:scale-[1.03] transition-all group flex flex-col">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100"><ClipboardList size={18} /></div>
               <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black text-slate-900 uppercase truncate">{app.project}</p>
                  <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Asset Application</p>
               </div>
            </div>

            <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
               <div className="flex justify-between items-center">
                  <span className="text-[6px] font-black uppercase text-slate-400">Commitment</span>
                  <span className="text-[9px] font-black text-slate-900">KSh {parseFloat(app.amount).toLocaleString()}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[6px] font-black uppercase text-slate-400">Timestamp</span>
                  <span className="text-[7px] font-bold text-slate-600">{new Date(app.date).toLocaleDateString()}</span>
               </div>
            </div>

            <div className="mt-auto flex gap-2">
               <button className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-[7px] font-black uppercase tracking-widest hover:bg-black transition-all">Audit</button>
               <button className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-[7px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">Validate</button>
               <button className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-600 hover:text-white transition-all"><XCircle size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
