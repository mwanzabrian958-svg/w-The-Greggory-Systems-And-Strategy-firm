import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Save, RefreshCw } from "lucide-react";
import { getApiUrl, API_BASE_URL } from "../../services/api";

export function ManualEntry() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);

  const [form, setForm] = useState({
    project_id: '', entry_type: 'expense', category: 'Operations',
    amount: '', description: '', transaction_date: new Date().toISOString().split('T')[0],
    transaction_reference: '', payment_method: 'bank_transfer'
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
    <div className="fixed inset-0 bg-[#0f172a] z-[500] flex flex-col overflow-hidden font-sans">
      <div className="bg-[#0f172a] px-8 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white font-black text-lg">GS</div>
          <div>
            <h2 className="text-xl font-black text-white uppercase leading-none">Manual Ledger Entry</h2>
            <p className="text-[8px] text-teal-500 font-black uppercase tracking-[0.4em] mt-1">Operational Sync Protocol</p>
          </div>
        </div>
        <button onClick={() => navigate('/admin/billing')} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all"><X size={14} /></button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-slate-950 p-10">
        <div className="max-w-3xl mx-auto space-y-8 bg-[#1e293b]/20 p-10 rounded-[40px] border border-white/5 shadow-2xl">
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Project Target Node</label>
              <select value={form.project_id} onChange={(e) => setForm({...form, project_id: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none focus:border-teal-500 transition-all" required>
                <option value="" className="bg-[#0f172a]">Select Project...</option>
                {projects.map(p => <option key={p.id} value={p.id} className="bg-[#0f172a]">{p.project_name || p.name}</option>)}
              </select>
            </div>
            <div><label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Entry Type</label>
              <select value={form.entry_type} onChange={(e) => setForm({...form, entry_type: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none focus:border-teal-500 transition-all">
                <option value="expense" className="bg-[#0f172a]">Expense (Operational)</option>
                <option value="income" className="bg-[#0f172a]">Income (Other)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div><label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Commitment Value (KSh)</label><input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[12px] font-black text-emerald-400 outline-none focus:border-emerald-500 transition-all" required /></div>
            <div><label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Timestamp</label><input type="date" value={form.transaction_date} onChange={(e) => setForm({...form, transaction_date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none focus:border-teal-500 transition-all" required /></div>
          </div>
          <div><label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Description / Metadata</label><input type="text" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none focus:border-teal-500 transition-all" required /></div>

          <div className="pt-10 flex gap-4">
             <button type="button" onClick={() => navigate('/admin/billing')} className="flex-1 bg-white/5 text-slate-400 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/10 transition-all">Cancel</button>
             <button type="submit" disabled={isSubmitting} className="flex-[2] bg-teal-600 hover:bg-teal-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3">
               {isSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />} Commit to Ledger
             </button>
          </div>
        </div>
      </form>
    </div>
  );
}
