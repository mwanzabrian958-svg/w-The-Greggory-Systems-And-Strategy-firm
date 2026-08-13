import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, User, X, Save, RefreshCw, Send } from "lucide-react";
import { getApiUrl, API_BASE_URL } from "../../services/api";

export function CreateInvoice() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);

  const [invoiceForm, setInvoiceForm] = useState({
    project_id: '', title: '', invoice_type: 'project_fee', subtotal: '', tax_rate: '0',
    issue_date: new Date().toISOString().split('T')[0], due_date: '',
    client_name: '', client_email: '', client_phone: '', notes: ''
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(getApiUrl("/api/user-projects"));
        if (response.ok) {
          const data = await response.json();
          setProjects(Array.isArray(data) ? data : []);
        }
      } catch (error) { console.error(error); }
    };
    fetchProjects();
  }, []);

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invoiceForm,
          items: [{ description: invoiceForm.title, amount: invoiceForm.subtotal }],
          currency: 'KES'
        })
      });
      if (response.ok) navigate('/admin/billing');
    } catch (error) { console.error(error); }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-[500] flex flex-col overflow-hidden font-sans">
      <div className="bg-[#0f172a] px-8 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white font-black text-lg border border-white/10">GS</div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tighter uppercase leading-none">Mission Deployment</h2>
            <p className="text-[8px] text-teal-500 font-black uppercase tracking-[0.4em] mt-1">Operational Protocol 7-Beta</p>
          </div>
        </div>
        <button onClick={() => navigate('/admin/billing')} className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg"><X size={14} /> Abort</button>
      </div>

      <form onSubmit={handleInvoiceSubmit} className="flex-1 overflow-y-auto bg-slate-950 p-8 pb-32">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-teal-500 border-b border-white/5 pb-2"><Briefcase size={12} /><h4 className="text-[9px] font-black uppercase tracking-[0.25em]">Alignment</h4></div>
              <div className="grid gap-4">
                <div><label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Project Node</label>
                  <select value={invoiceForm.project_id} onChange={(e) => setInvoiceForm({...invoiceForm, project_id: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-teal-500 transition-all" required>
                    <option value="" className="bg-[#0f172a]">Select Mission...</option>
                    {projects.map(p => <option key={p.id} value={p.id} className="bg-[#0f172a]">{p.project_name || p.name}</option>)}
                  </select>
                </div>
                <div><label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Objective</label><input type="text" placeholder="Description..." value={invoiceForm.title} onChange={(e) => setInvoiceForm({...invoiceForm, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-teal-500 transition-all" required /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Value (KSh)</label><input type="number" value={invoiceForm.subtotal} onChange={(e) => setInvoiceForm({...invoiceForm, subtotal: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[11px] font-black text-emerald-400 outline-none focus:border-emerald-500 transition-all" required /></div>
                  <div><label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Tax (%)</label><input type="number" value={invoiceForm.tax_rate} onChange={(e) => setInvoiceForm({...invoiceForm, tax_rate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-teal-500 transition-all" /></div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-blue-500 border-b border-white/5 pb-2"><User size={12} /><h4 className="text-[9px] font-black uppercase tracking-[0.25em]">Telemetry</h4></div>
              <div className="grid gap-4">
                <div><label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Entity Name</label><input type="text" placeholder="Legal Name..." value={invoiceForm.client_name} onChange={(e) => setInvoiceForm({...invoiceForm, client_name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-blue-500 transition-all" required /></div>
                <div><label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">M-Pesa Node</label><input type="text" placeholder="254..." value={invoiceForm.client_phone} onChange={(e) => setInvoiceForm({...invoiceForm, client_phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-blue-500 transition-all" required /></div>
                <div><label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Deadline</label><input type="date" value={invoiceForm.due_date} onChange={(e) => setInvoiceForm({...invoiceForm, due_date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[10px] font-bold text-white outline-none focus:border-blue-500 transition-all" required /></div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-2"><div className="bg-[#1e293b]/20 rounded-2xl p-6 border border-white/5"><label className="block text-[7px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2 px-2">Mission Constraints & Notes</label><textarea value={invoiceForm.notes} onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})} className="w-full bg-transparent text-[10px] font-medium text-slate-400 outline-none h-20 resize-none leading-relaxed" placeholder="Deployment requirements..."></textarea></div></div>

          <div className="lg:col-span-2 bg-[#0f172a] rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8 mt-6">
            <div className="flex gap-8">
              <div className="bg-white/5 px-6 py-4 rounded-xl border border-white/10">
                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1">Strategic Debt</p>
                <p className="text-2xl font-black text-white leading-none">KSh {(parseFloat(invoiceForm.subtotal || 0) * (1 + parseFloat(invoiceForm.tax_rate || 0)/100)).toLocaleString()}</p>
              </div>
              <div className="hidden lg:flex flex-col justify-center"><p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.4em]">Ledger Standard</p><p className="text-[9px] font-black text-teal-500 uppercase tracking-widest mt-1">Certified KSh Telemetry</p></div>
            </div>
            <button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-500 text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-xl flex items-center gap-3 border border-teal-400/20">
              {isSubmitting ? <RefreshCw className="animate-spin" size={12} /> : <Send size={12} />} Deploy to Global Ledger
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
