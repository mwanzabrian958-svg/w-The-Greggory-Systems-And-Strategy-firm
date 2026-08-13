import React, { useState, useEffect } from "react";
import {
  Activity,
  Search,
  Filter,
  Clock,
  User,
  FileText,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Monitor,
  ShieldCheck,
  Zap
} from "lucide-react";
import { getApiUrl } from "../../services/api";

/**
 * ActivityLogs - Strategic Operations Log
 * High-density compact view for system auditing.
 */
export function ActivityLogs({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(getApiUrl("/api/admin/activity-logs"));
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch = (l.details || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (l.admin_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || l.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="flex items-center justify-center py-20"><RefreshCw className="animate-spin text-teal-600 w-6 h-6" /></div>;

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Operation Logs</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Immutable System Telemetry</p>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchLogs} className="p-2 bg-white border border-slate-100 rounded-lg text-teal-600 shadow-sm"><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* Tighter Log Controls */}
      <div className="bg-[#0f172a] rounded-xl p-3 border border-white/10 shadow-xl flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input type="text" placeholder="Filter audit stream..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-bold text-white outline-none focus:ring-1 focus:ring-teal-500 transition-all" />
        </div>
        <div className="flex gap-3">
           <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[8px] font-black uppercase text-white outline-none">
              <option value="all" className="bg-[#0f172a]">All Activities</option>
              <option value="auth" className="bg-[#0f172a]">Authentication</option>
              <option value="ledger" className="bg-[#0f172a]">Financial</option>
              <option value="content" className="bg-[#0f172a]">Content</option>
           </select>
        </div>
      </div>

      {/* High-Density Log Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr className="text-[7px] font-black uppercase tracking-widest text-slate-400">
                  <th className="px-4 py-3">Sequence / Activity</th>
                  <th className="px-4 py-3">Actor Node</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Timestamp</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
                {paginatedLogs.map((l, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-all">
                     <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400"><Monitor size={14} /></div>
                           <div className="min-w-0">
                              <p className="text-[9px] font-black text-slate-900 uppercase truncate max-w-xs">{l.details}</p>
                              <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest">{l.activity}</p>
                           </div>
                        </div>
                     </td>
                     <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                           <div className="w-5 h-5 rounded-full bg-[#0f172a] flex items-center justify-center text-[7px] font-black text-white">{(l.admin_name || 'S')[0]}</div>
                           <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{l.admin_name}</span>
                        </div>
                     </td>
                     <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[6px] font-black uppercase tracking-tighter">Verified</span>
                     </td>
                     <td className="px-4 py-3 text-right">
                        <p className="text-[9px] font-black text-slate-900">{new Date(l.timestamp).toLocaleTimeString()}</p>
                        <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{new Date(l.timestamp).toLocaleDateString()}</p>
                     </td>
                  </tr>
                ))}
             </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 pb-12">
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 shadow-sm transition-all"><ChevronLeft size={14} /></button>
          <div className="px-4 py-2 bg-[#0f172a] rounded-xl text-[8px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">Log {currentPage} / {totalPages}</div>
          <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 shadow-sm transition-all"><ChevronRight size={14} /></button>
        </div>
      )}
    </div>
  );
}
