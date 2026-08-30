import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Save, RefreshCw } from "lucide-react";
import { getApiUrl, API_BASE_URL } from "../../services/api";
import SearchBlock from "../../components/SearchBlock";

export function ManualEntry() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);

  const [form, setForm] = useState({
    project_id: '', entry_type: 'expense', category: 'Operations',
    amount: '', description: '', transaction_date: new Date().toISOString().split('T')[0],
    transaction_reference: '', payment_method: 'bank_transfer', client_email: ''
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(getApiUrl("/api/user-projects"));
        if (res.ok) {
          const data = await res.json();
          setProjects(Array.isArray(data) ? data : []);
        }
      } catch (e) { console.error(e); }
    };
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/accounting/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, currency: 'KES', exchange_rate: 1, payment_status: 'completed' })
      });
      if (res.ok) navigate('/admin/billing');
    } catch (e) { console.error(e); }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-md z-[500] flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      <div className="bg-[#0f172a] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="bg-[#0f172a] px-6 py-3 flex items-center justify-between border-b border-white/5 bg-[#1e293b]/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-white font-black text-sm border border-white/10">GS</div>
            <div className="hidden sm:block">
              <h2 className="text-sm font-black text-white uppercase leading-none">Manual Ledger Entry</h2>
              <p className="text-[6px] text-teal-500 font-black uppercase tracking-[0.4em]">Operational Sync Protocol</p>
            </div>
          </div>

          <div className="flex-1 max-w-sm mx-4">
            <SearchBlock variant="admin" placeholder="Query ledger sync..." />
          </div>
          <button onClick={() => navigate('/admin/billing')} className="p-2 hover:bg-rose-600/20 text-slate-400 hover:text-rose-500 rounded-lg transition-all"><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-slate-950 p-6">
          <div className="space-y-6 bg-[#1e293b]/20 p-6 rounded-2xl border border-white/5">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Project Node</label>
                <select value={form.project_id} onChange={(e) => setForm({...form, project_id: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all" required>
                  <option value="" className="bg-[#0f172a]">Select Project...</option>
                  {projects.map(p => <option key={p.id} value={p.id} className="bg-[#0f172a]">{p.project_name || p.name}</option>)}
                </select>
              </div>
              <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Entry Type</label>
                <select value={form.entry_type} onChange={(e) => setForm({...form, entry_type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all">
                  <option value="expense" className="bg-[#0f172a]">Expense</option>
                  <option value="income" className="bg-[#0f172a]">Income</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Value (KSH)</label><input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[11px] font-black text-emerald-400 outline-none focus:border-emerald-500 transition-all" required /></div>
              <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Timestamp</label><input type="date" value={form.transaction_date} onChange={(e) => setForm({...form, transaction_date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all" required /></div>
            </div>
            <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Entity Email (System Linking)</label><input type="email" placeholder="client@example.com" value={form.client_email} onChange={(e) => setForm({...form, client_email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all" required /></div>
            <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Metadata</label><input type="text" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all" required /></div>

            <div className="pt-4 flex gap-3">
               <button type="button" onClick={() => navigate('/admin/billing')} className="flex-1 bg-white/5 text-slate-400 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all">Abort</button>
               <button type="submit" disabled={isSubmitting} className="flex-[2] bg-teal-600 hover:bg-teal-500 text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2">
                 {isSubmitting ? <RefreshCw className="animate-spin" size={12} /> : <Save size={12} />} Commit Entry
               </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
