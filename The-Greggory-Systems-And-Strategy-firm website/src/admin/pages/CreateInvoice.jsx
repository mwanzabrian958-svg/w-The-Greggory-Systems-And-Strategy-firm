import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, User, X, Save, RefreshCw, Send } from "lucide-react";
import { getApiUrl, API_BASE_URL } from "../../services/api";
import { formatKSH } from "../../utils/currencyUtils";
import { TAX_PRESETS, taxLabel, roundMoney } from "../../utils/kraTax";
import SearchBlock from "../../components/SearchBlock";

export function CreateInvoice() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);

  const [invoiceForm, setInvoiceForm] = useState({
    project_id: '', title: '', invoice_type: 'project_fee', tax_type: 'vat', tax_rate: '16',
    issue_date: new Date().toISOString().split('T')[0], due_date: '',
    client_name: '', client_email: '', client_phone: '', notes: '',
    items: [{ description: '', quantity: '1', unit_price: '' }]
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

  const itemsSubtotal = invoiceForm.items.reduce(
    (s, it) => s + parseFloat(it.quantity || 0) * parseFloat(it.unit_price || 0), 0
  );

  // Live KRA tax math (tax_rate is a whole percent in the UI; the server
  // converts it to the DECIMAL FRACTION the DB's generated columns require).
  const taxPct = parseFloat(invoiceForm.tax_rate || 0);
  const taxAmount = roundMoney(itemsSubtotal * (taxPct / 100));
  const grandTotal = roundMoney(itemsSubtotal + taxAmount);

  const pickTaxPreset = (pct) => {
    const preset = TAX_PRESETS.find(p => p.pct === Number(pct)) || TAX_PRESETS[0];
    setInvoiceForm((f) => ({ ...f, tax_rate: String(preset.pct), tax_type: preset.type }));
  };

  const updateItem = (idx, field, value) =>
    setInvoiceForm((f) => ({ ...f, items: f.items.map((it, i) => (i === idx ? { ...it, [field]: value } : it)) }));
  const addLineItem = () =>
    setInvoiceForm((f) => ({ ...f, items: [...f.items, { description: '', quantity: '1', unit_price: '' }] }));
  const removeLineItem = (idx) =>
    setInvoiceForm((f) => ({ ...f, items: f.items.length > 1 ? f.items.filter((_, i) => i !== idx) : f.items }));

  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...invoiceForm,
          subtotal: itemsSubtotal,
          items: invoiceForm.items.map((it) => ({
            description: it.description || invoiceForm.title,
            quantity: parseFloat(it.quantity || 1),
            unit_price: parseFloat(it.unit_price || 0),
            line_total: parseFloat(it.quantity || 1) * parseFloat(it.unit_price || 0),
          })),
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
            <div className="hidden sm:block">
              <h2 className="text-sm font-black text-white uppercase tracking-tight">Mission Deployment</h2>
              <p className="text-[6px] text-teal-500 font-black uppercase tracking-[0.4em]">Operational Protocol 7-Beta</p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-6">
            <SearchBlock variant="admin" placeholder="Search mission nodes..." />
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
                  <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Tax (KRA rate)</label>
                    <select value={invoiceForm.tax_rate} onChange={(e) => pickTaxPreset(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all">
                      {TAX_PRESETS.map(p => <option key={p.type} value={p.pct} className="bg-[#0f172a]">{p.label}</option>)}
                    </select>
                    <p className="mt-0.5 px-1 text-[6px] font-bold text-teal-400/80">{taxLabel(taxPct)} — {formatKSH(taxAmount)}</p>
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
              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                  <div className="flex items-center gap-2 text-emerald-400"><Briefcase size={10} /><h4 className="text-[7px] font-black uppercase tracking-widest">Line Items</h4></div>
                  <button type="button" onClick={addLineItem} className="text-[7px] font-black text-teal-400 uppercase tracking-widest hover:text-white transition-colors">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  <div className="hidden md:grid grid-cols-12 gap-2 px-1 text-[6px] font-black text-slate-500 uppercase tracking-widest">
                    <div className="col-span-6">Description</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Rate (KSH)</div>
                    <div className="col-span-2 text-right">Amount</div>
                  </div>
                  {invoiceForm.items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <input type="text" placeholder="Service / deliverable..." value={it.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} className="col-span-12 md:col-span-6 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all" />
                      <input type="number" min="1" step="any" value={it.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} className="col-span-4 md:col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all" />
                      <input type="number" min="0" step="any" placeholder="0" value={it.unit_price} onChange={(e) => updateItem(idx, 'unit_price', e.target.value)} className="col-span-5 md:col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold text-white outline-none focus:border-teal-500 transition-all" />
                      <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-2">
                        <span className="text-[10px] font-black text-emerald-400">{formatKSH(parseFloat(it.quantity || 0) * parseFloat(it.unit_price || 0))}</span>
                        <button type="button" onClick={() => removeLineItem(idx)} className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all" title="Remove item"><X size={11} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-1">
                  <div className="text-right">
                    <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest">Subtotal</p>
                    <p className="text-sm font-black text-emerald-400">{formatKSH(itemsSubtotal)}</p>
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
                <p className="text-[5.5px] font-black text-slate-500 uppercase tracking-widest">Subtotal</p>
                <p className="text-sm font-bold text-white">{formatKSH(itemsSubtotal)}</p>
                <p className="text-[5.5px] font-black text-teal-400 uppercase tracking-widest mt-1">{taxLabel(taxPct) || "No tax"}</p>
                <p className="text-[10px] font-bold text-teal-300">{formatKSH(taxAmount)}</p>
                <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest mt-2 border-t border-white/10 pt-1">Total incl. tax</p>
                <p className="text-xl font-black text-emerald-400">{formatKSH(grandTotal)}</p>
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
