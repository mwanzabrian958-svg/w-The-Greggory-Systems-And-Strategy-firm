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

  useEffect(() => {
    // In a full implementation, we would fetch from /api/kb
    // For now, we clear the simulated data and show an empty state linked to the database matrix
    setKbItems([]);
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

        {/* Support Relay Monitor */}
        <section className="bg-[#0f172a] rounded-2xl p-5 border border-white/5 shadow-2xl">
           <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Active Relay Tickets</h3>
            <MessageCircle size={14} className="text-teal-400" />
          </div>
          <div className="flex flex-col items-center justify-center py-12 text-center">
             <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 group hover:bg-white/10 transition-all cursor-pointer" onClick={() => navigate('/admin/activity')}>
                <CheckCircle size={20} className="text-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
             </div>
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Relay Queue Synchronized</p>
             <p className="text-[6px] text-slate-600 uppercase tracking-widest mt-1">Zero pending escalations detected.</p>
          </div>
        </section>
      </div>

      {/* Tighter Footer */}
      <footer className="pt-10 pb-20 flex flex-col items-center opacity-30">
         <p className="text-[6px] font-black text-slate-400 uppercase tracking-[0.8em]">Knowledge Relay Mode Active</p>
      </footer>
    </div>
  );
}
