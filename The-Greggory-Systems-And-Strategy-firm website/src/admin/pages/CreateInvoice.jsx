import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, User, X, Save, RefreshCw, Send } from "lucide-react";
import { getApiUrl, API_BASE_URL } from "../../services/api";
import { formatKSH } from "../../utils/currencyUtils";

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
    <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-md z-[500] flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      <div className="bg-[#0f172a] w-full max-w-4xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-3 flex items-center justify-between border-b border-white/5 bg-[#1e293b]/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white font-black text-sm">GS</div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-tight">Mission Deployment</h2>
              <p className="text-[6px] text-teal-500 font-black uppercase tracking-[0.4em]">Operational Protocol 7-Beta</p>
            </div>
          </div>
          <button onClick={() => navigate('/admin/billing')} className="p-2 hover:bg-rose-600/20 text-slate-400 hover:text-rose-500 rounded-lg transition-all"><X size={16} /></button>
        </div>

        <form onSubmit={handleInvoiceSubmit} className="flex-1 overflow-y-auto p-6 bg-slate-950">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-teal-500 border-b border-white/5 pb-1.5"><Briefcase size={10} /><h4 className="text-[7px] font-black uppercase tracking-widest">Alignment</h4></div>
                <div className="grid gap-3">
                  <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Project Node</label>
                    <select value={invoiceForm.project_id} onChange={(e) => setInvoiceForm({...invoiceForm, project_id: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all" required>
                      <option value="" className="bg-[#0f172a]">Select Mission...</option>
                      {projects.map(p => <option key={p.id} value={p.id} className="bg-[#0f172a]">{p.project_name || p.name}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Objective</label><input type="text" placeholder="Description..." value={invoiceForm.title} onChange={(e) => setInvoiceForm({...invoiceForm, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all" required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Value (KSH)</label><input type="number" value={invoiceForm.subtotal} onChange={(e) => setInvoiceForm({...invoiceForm, subtotal: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black text-emerald-400 outline-none focus:border-emerald-500 transition-all" required /></div>
                    <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Tax (%)</label><input type="number" value={invoiceForm.tax_rate} onChange={(e) => setInvoiceForm({...invoiceForm, tax_rate: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all" /></div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-blue-500 border-b border-white/5 pb-1.5"><User size={10} /><h4 className="text-[7px] font-black uppercase tracking-widest">Telemetry</h4></div>
                <div className="grid gap-3">
                  <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Entity Name</label><input type="text" placeholder="Legal Name..." value={invoiceForm.client_name} onChange={(e) => setInvoiceForm({...invoiceForm, client_name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-blue-500 transition-all" required /></div>
                  <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Entity Email</label><input type="email" placeholder="client@example.com" value={invoiceForm.client_email} onChange={(e) => setInvoiceForm({...invoiceForm, client_email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-blue-500 transition-all" required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">M-Pesa Node</label><input type="text" placeholder="254..." value={invoiceForm.client_phone} onChange={(e) => setInvoiceForm({...invoiceForm, client_phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-blue-500 transition-all" required /></div>
                    <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Deadline</label><input type="date" value={invoiceForm.due_date} onChange={(e) => setInvoiceForm({...invoiceForm, due_date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-blue-500 transition-all" required /></div>
                  </div>
                </div>
              </section>
            </div>

            <div className="md:col-span-2">
              <textarea value={invoiceForm.notes} onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})} className="w-full bg-white/2 border border-white/5 rounded-xl text-[9px] font-medium text-slate-400 p-4 outline-none h-16 resize-none" placeholder="Mission constraints..."></textarea>
            </div>
          </div>
        </form>

        <div className="p-6 bg-[#0f172a] border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex gap-6">
              <div className="text-left">
                <p className="text-[5.5px] font-black text-slate-500 uppercase tracking-widest">Calculated Debt</p>
                <p className="text-xl font-black text-white">{formatKSH(parseFloat(invoiceForm.subtotal || 0) * (1 + parseFloat(invoiceForm.tax_rate || 0)/100))}</p>
              </div>
           </div>
           <button onClick={handleInvoiceSubmit} disabled={isSubmitting} className="w-full md:w-auto bg-teal-600 hover:bg-teal-500 text-white px-8 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2">
              {isSubmitting ? <RefreshCw className="animate-spin" size={12} /> : <Send size={12} />} Deploy to Ledger
           </button>
        </div>
      </div>
    </div>
  );
}
