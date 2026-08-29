import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HelpCircle, Plus, Search, Clock, AlertCircle, CheckCircle, MessageCircle, RefreshCw, ChevronRight, Layers } from "lucide-react";
import { apiCall } from "../../services/api";

/**
 * Support - Help & Documentation Relay
 * Optimized with compact containers and tiny typography.
 */
export function Support() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [kbItems, setKbItems] = useState([]);
  // Live client feedback relay (author='client' rows from the user_feedback table)
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  const loadTickets = async () => {
    try {
      setTicketsLoading(true);
      const data = await apiCall("/feedback?author=client&limit=25");
      setTickets(Array.isArray(data?.feedback) ? data.feedback : []);
    } catch (err) {
      console.error("Failed to load client feedback:", err);
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    // In a full implementation, we would fetch from /api/kb
    // For now, we clear the simulated data and show an empty state linked to the database matrix
    setKbItems([]);
    loadTickets();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><RefreshCw className="animate-spin text-teal-600 w-6 h-6" /></div>;

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Support Node</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Knowledge Base & Technical Relay</p>
        </div>
        <button onClick={() => alert("Initializing Knowledge Creation Node...")} className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-600 text-white font-black text-[8px] uppercase tracking-widest shadow-md hover:bg-teal-700 transition-all">
          <Plus size={12} /> New Entry
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Knowledge Base Nodes */}
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
             <div className="flex items-center gap-2"><HelpCircle size={14} className="text-blue-500" /><h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Protocol Library</h3></div>
             <div className="text-[6px] font-black text-slate-300 uppercase tracking-widest">Static Analysis Mode</div>
          </div>
          <div className="space-y-2">
             {kbItems.length > 0 ? kbItems.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
               <div key={item.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all cursor-pointer">
                  <div>
                    <p className="text-[9px] font-black text-slate-900 uppercase">{item.title}</p>
                    <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.category}</p>
                  </div>
                  <span className="bg-white px-2 py-0.5 rounded text-[6px] font-black text-slate-500 border border-slate-100 uppercase">{item.status}</span>
               </div>
             )) : (
               <div className="py-20 text-center opacity-20 border-2 border-dashed border-slate-200 rounded-2xl">
                  <Layers className="mx-auto h-8 w-8 mb-4" />
                  <p className="text-[8px] font-black uppercase tracking-widest">Protocol Matrix Empty</p>
                  <p className="text-[6px] mt-1 uppercase">No technical manuscripts found in current node.</p>
               </div>
             )}
          </div>
        </section>

        {/* Support Relay Monitor - live client feedback */}
        <section className="bg-[#0f172a] rounded-2xl p-5 border border-white/5 shadow-2xl">
           <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Active Relay Tickets</h3>
            <div className="flex items-center gap-2">
              <button onClick={loadTickets} title="Refresh" className="p-1 rounded hover:bg-white/10 transition-all">
                <RefreshCw size={12} className={`text-teal-400 ${ticketsLoading ? "animate-spin" : ""}`} />
              </button>
              <MessageCircle size={14} className="text-teal-400" />
            </div>
          </div>

          {ticketsLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <RefreshCw size={18} className="animate-spin text-teal-500 mb-3" />
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Synchronizing Relay Queue...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
               <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 group hover:bg-white/10 transition-all cursor-pointer" onClick={() => navigate('/admin/activity')}>
                  <CheckCircle size={20} className="text-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
               </div>
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Relay Queue Synchronized</p>
               <p className="text-[6px] text-slate-600 uppercase tracking-widest mt-1">No client feedback received yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {tickets.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-white uppercase truncate">{t.title || "Client feedback"}</p>
                      <p className="text-[7px] font-bold text-teal-400 uppercase tracking-widest mt-0.5 truncate">
                        {t.user_name || t.contact_name || "Unknown client"}
                        {t.project_name ? ` • ${t.project_name}` : ""}
                      </p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-[6px] font-black uppercase border ${
                      t.priority === "urgent" ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : t.priority === "high" ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : t.priority === "low" ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      : "bg-teal-500/10 text-teal-400 border-teal-500/20"}`}>
                      {t.priority || "medium"}
                    </span>
                  </div>
                  <p className="text-[8px] text-slate-400 leading-relaxed mt-1.5 line-clamp-2">{t.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[6px] font-black text-slate-400 uppercase border border-white/5 truncate">{(t.feedback_type || "service_feedback").replace(/_/g, " ")}</span>
                      <span className={`text-[6px] font-black uppercase shrink-0 ${
                        t.status === "resolved" || t.status === "closed" ? "text-emerald-400"
                        : t.status === "responded" ? "text-teal-400"
                        : t.status === "reviewed" ? "text-blue-400"
                        : "text-amber-400"}`}>{t.status || "new"}</span>
                    </div>
                    <span className="text-[6px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1 shrink-0">
                      <Clock size={8} />{t.created_at ? new Date(t.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Tighter Footer */}
      <footer className="pt-10 pb-20 flex flex-col items-center opacity-30">
         <p className="text-[6px] font-black text-slate-400 uppercase tracking-[0.8em]">Knowledge Relay Mode Active</p>
      </footer>
    </div>
  );
}
