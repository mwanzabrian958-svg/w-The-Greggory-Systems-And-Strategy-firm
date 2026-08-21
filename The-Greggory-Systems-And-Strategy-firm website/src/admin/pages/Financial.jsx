import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../services/api";
import { formatKSH } from "../../utils/currencyUtils";
import {
  TrendingUp, Banknote, ShieldCheck, RefreshCw, FileText,
  Trash2, Edit2, ChevronRight, AlertCircle, X
} from "lucide-react";

export function Billing({ user }) {
  const navigate = useNavigate();
  const [displayMode, setDisplayMode] = useState("ledger"); // 'ledger' or 'invoices'
  const [loading, setLoading] = useState(true);
  const [financials, setFinancials] = useState({
    revenue: 0, expenses: 0, net_income: 0,
    entries: [], invoices: []
  });

  useEffect(() => { fetchFinancialData(); }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const [ledgerRes, invoiceRes] = await Promise.all([
        apiCall("/admin/ledger"),
        apiCall("/invoices")
      ]);

      const entries = ledgerRes.entries || [];
      const totalRevenue = entries.filter(e => e.entry_type === 'income' || e.entry_type === 'invoice_payment').reduce((s, e) => s + parseFloat(e.amount), 0);
      const totalExpenses = entries.filter(e => e.entry_type === 'expense').reduce((s, e) => s + parseFloat(e.amount), 0);

      setFinancials({
        revenue: totalRevenue,
        expenses: totalExpenses,
        net_income: totalRevenue - totalExpenses,
        entries: entries,
        invoices: invoiceRes.invoices || []
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm("Confirm Ledger Deletion?")) return;
    try {
      const res = await apiCall(`/accounting/entries/${id}`, { method: 'DELETE' });
      if (res.success) fetchFinancialData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm("Terminate this Invoice node?")) return;
    try {
      const res = await apiCall(`/invoices/${id}`, { method: 'DELETE' });
      if (res.success) fetchFinancialData();
    } catch (e) { console.error(e); }
  };

  if (loading && financials.entries.length === 0) return (
    <div className="flex flex-col items-center justify-center py-40">
       <RefreshCw className="animate-spin text-teal-600 w-8 h-8" />
       <p className="mt-4 text-[7px] font-black text-slate-400 uppercase tracking-[0.6em]">Polling Master Matrix...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1200px] mx-auto pb-10">

      {/* SECTION 1: MASTER METRICS */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Asset Inflow", val: financials.revenue, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Operational Outflow", val: financials.expenses, color: "text-rose-500", bg: "bg-rose-50" },
          { label: "Net Matrix Balance", val: financials.net_income, color: "text-sky-500", bg: "bg-sky-50" },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
               <p className={`text-sm font-black ${m.color}`}>{formatKSH(m.val)}</p>
            </div>
            <div className={`${m.bg} p-2 rounded-xl`}><ShieldCheck size={14} className={m.color} /></div>
          </div>
        ))}
      </div>

      {/* SECTION 2: COMMAND BUTTONS */}
      <div className="bg-[#0f172a] rounded-2xl p-4 border border-white/10 shadow-xl flex justify-between items-center">
         <div className="flex gap-2">
            <button
              onClick={() => setDisplayMode("ledger")}
              className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${displayMode === 'ledger' ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40' : 'bg-white/5 text-slate-400 hover:text-white'}`}
            >
              Call Ledger Hub
            </button>
            <button
              onClick={() => setDisplayMode("invoices")}
              className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${displayMode === 'invoices' ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40' : 'bg-white/5 text-slate-400 hover:text-white'}`}
            >
              Call Invoicing Hub
            </button>
         </div>
         <div className="flex gap-2">
            <button onClick={() => navigate('/admin/billing/create')} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"><FileText size={14} /></button>
            <button onClick={() => navigate('/admin/billing/entry')} className="p-2 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all"><Banknote size={14} /></button>
         </div>
      </div>

      {/* SECTION 3: DYNAMIC DISPLAY AREA */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">

        {displayMode === "ledger" ? (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Accounting Ledger</h3>
               <button onClick={fetchFinancialData} className="text-[7px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-1"><RefreshCw size={10} /> Sync Relay</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="text-[7px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                      <th className="py-3 px-4">Transaction / Entity</th>
                      <th className="py-3 px-4">Node Link</th>
                      <th className="py-3 px-4 text-right">Value</th>
                      <th className="py-3 px-4 text-center">Protocol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {financials.entries.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="py-4 px-4">
                           <p className="text-[9px] font-black text-slate-900 uppercase">{e.description}</p>
                           <p className="text-[7px] text-slate-400 font-bold uppercase mt-0.5">{new Date(e.transaction_date).toLocaleDateString()}</p>
                        </td>
                        <td className="py-4 px-4">
                           <span className="text-[8px] font-black text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">{e.client_email || 'INTERNAL_SYNC'}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                           <p className="text-[10px] font-black text-slate-900">{formatKSH(e.amount)}</p>
                        </td>
                        <td className="py-4 px-4">
                           <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => navigate(`/admin/billing/entry`)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"><Edit2 size={12} /></button>
                              <button onClick={() => handleDeleteEntry(e.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md"><Trash2 size={12} /></button>
                           </div>
                        </td>
                      </tr>
                    ))}
                    {financials.entries.length === 0 && <tr><td colSpan="4" className="py-20 text-center opacity-20 uppercase font-black text-[10px]">Zero Ledger Records</td></tr>}
                  </tbody>
               </table>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Active Billing Invoices</h3>
               <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Global Relay Stream Active</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {financials.invoices.map(inv => (
                 <div key={inv.id} className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 hover:border-teal-400 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                       <p className="text-[8px] font-black text-teal-600 uppercase">{inv.invoice_number}</p>
                       <div className="flex gap-1">
                          <button onClick={() => navigate(`/admin/billing/create`)} className="p-1 text-slate-400 hover:text-blue-500 transition-colors"><Edit2 size={10} /></button>
                          <button onClick={() => handleDeleteInvoice(inv.id)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={10} /></button>
                       </div>
                    </div>
                    <h4 className="text-[10px] font-black text-slate-900 uppercase mb-1 line-clamp-1">{inv.title}</h4>
                    <p className="text-[8px] text-slate-500 font-bold truncate mb-6">{inv.client_email}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                       <p className="text-sm font-black text-slate-900">{formatKSH(inv.total_amount_kes)}</p>
                       <button onClick={() => navigate(`/admin/billing/preview/${inv.id}`)} className="p-1.5 bg-white rounded-lg shadow-sm group-hover:bg-teal-500 group-hover:text-white transition-all"><ChevronRight size={14} /></button>
                    </div>
                 </div>
               ))}
               {financials.invoices.length === 0 && <div className="col-span-full py-20 text-center opacity-20 uppercase font-black text-[10px]">Zero Invoices Found</div>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
