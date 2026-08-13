import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../services/api";
import { TrendingUp, Plus, Banknote, ShieldCheck, Clock, RefreshCw, Filter, Briefcase, X, Save, AlertCircle, PieChart, ArrowUpRight, ArrowDownRight, FileText, Send, User, Download, QrCode, Printer } from "lucide-react";

/**
 * Financial - Admin Revenue Monitor & Invoicing Suite
 */
export function Billing({ user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ledger");
  const [loading, setLoading] = useState(true);
  const [financials, setFinancials] = useState({
    revenue: 0, expenses: 0, net_income: 0,
    entries: [], invoices: [],
    filters: { clients: [], projects: [], team: [] }
  });

  const [isolation, setIsolation] = useState({ client_id: '', project_id: '', team_member_id: '', type: 'all' });

  useEffect(() => { fetchFinancialData(); }, [isolation]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(isolation);
      const [ledgerRes, budgetRes, invoiceRes] = await Promise.all([
        apiCall(`/admin/ledger?${queryParams}`),
        apiCall("/admin/budget-overview"),
        apiCall("/invoices")
      ]);

      const totalRevenue = (ledgerRes.entries || [])
        .filter(e => e.entry_type === 'invoice_payment' || e.entry_type === 'income')
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const totalExpenses = (ledgerRes.entries || [])
        .filter(e => e.entry_type === 'expense')
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

      setFinancials({
        revenue: totalRevenue,
        expenses: totalExpenses,
        net_income: totalRevenue - totalExpenses,
        entries: ledgerRes.entries || [],
        invoices: invoiceRes.invoices || [],
        filters: ledgerRes.filters || { clients: [], projects: [], team: [] }
      });
    } catch (e) {
      console.error("Ledger Node Failure:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && financials.entries.length === 0) return (
    <div className="flex flex-col items-center justify-center py-40">
       <RefreshCw className="animate-spin text-teal-600 w-8 h-8" />
       <p className="mt-4 text-[7px] font-black text-slate-400 uppercase tracking-[0.6em]">Synchronizing Master Ledger...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1400px] mx-auto">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Receivable Relay", value: financials.revenue, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Operational Outflow", value: financials.expenses, icon: Banknote, color: "text-rose-500", bg: "bg-rose-50" },
          { label: "Net Sync Node", value: financials.net_income, icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-50", action: () => navigate('/admin/billing/pl-report') },
        ].map((metric) => (
          <div key={metric.label} onClick={metric.action} className={`bg-white rounded-xl p-4 border border-slate-100 shadow-md flex items-center justify-between transition-all ${metric.action ? 'cursor-pointer hover:scale-[1.03] hover:border-blue-200' : ''}`}>
            <div>
              <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{metric.label}</p>
              <p className="text-xl font-black text-slate-900">KSh {metric.value.toLocaleString()}</p>
            </div>
            <div className={`${metric.bg} p-2.5 rounded-xl ${metric.color}`}><metric.icon size={16} /></div>
          </div>
        ))}
      </div>

      <div className="bg-[#0f172a] rounded-2xl p-4 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-3 text-teal-400"><Filter size={14} /><h3 className="text-[9px] font-black uppercase tracking-widest">Isolation Protocol</h3></div>
          <div className="flex gap-2">
             <button onClick={() => navigate('/admin/billing/create')} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all border border-white/10"><FileText size={12} className="text-teal-400" />Generate</button>
             <button onClick={() => navigate('/admin/billing/entry')} className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-[7px] font-black uppercase tracking-widest transition-all shadow-lg"><Plus size={12} />Record</button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select value={isolation.client_id} onChange={(e) => setIsolation({...isolation, client_id: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[8px] font-black uppercase text-white outline-none"><option value="">All Clients</option>{financials.filters.clients.map(c => <option key={c.id} value={c.id} className="bg-[#0f172a]">{c.name}</option>)}</select>
          <select value={isolation.project_id} onChange={(e) => setIsolation({...isolation, project_id: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[8px] font-black uppercase text-white outline-none"><option value="">All Projects</option>{financials.filters.projects.map(p => <option key={p.id} value={p.id} className="bg-[#0f172a]">{p.name}</option>)}</select>
          <select value={isolation.team_member_id} onChange={(e) => setIsolation({...isolation, team_member_id: e.target.value})} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[8px] font-black uppercase text-white outline-none"><option value="">All Personnel</option>{financials.filters.team.map(t => <option key={t.id} value={t.id} className="bg-[#0f172a]">{t.name}</option>)}</select>
          <button onClick={() => setIsolation({client_id: '', project_id: '', team_member_id: '', type: 'all'})} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 text-slate-400 text-[8px] font-black uppercase tracking-widest transition-all">Reset Sync</button>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50">
            {["ledger", "invoices"].map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 px-4 py-3 text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white border-b-2 border-teal-500 text-teal-600" : "text-slate-400 hover:text-slate-600 hover:bg-white/50"}`}>{tab}</button>))}
        </div>
        <div className="p-4">
          {activeTab === "ledger" && (
            <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead className="bg-slate-50/50"><tr className="text-[7px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50"><th className="px-4 py-3">Transaction</th><th className="px-4 py-3">Node</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3 text-right">Date</th></tr></thead><tbody className="divide-y divide-slate-50">{financials.entries.length > 0 ? financials.entries.map((entry) => (<tr key={entry.id} className="hover:bg-slate-50/50 transition-colors"><td className="px-4 py-3"><p className="font-black text-slate-900 text-[9px] uppercase">{entry.description}</p><p className="text-[7px] text-slate-400 font-bold uppercase">{entry.client_name || 'Internal'}</p></td><td className="px-4 py-3 font-black text-slate-600 text-[8px] uppercase">{entry.project_name || 'General'}</td><td className="px-4 py-3 font-black text-slate-900 text-[10px]">KSh {parseFloat(entry.amount).toLocaleString()}</td><td className="px-4 py-3 text-slate-400 text-[8px] font-black uppercase text-right">{new Date(entry.transaction_date).toLocaleDateString()}</td></tr>)) : (<tr><td colSpan="4" className="py-20 text-center opacity-20 uppercase font-black text-[10px]">Empty Ledger Node</td></tr>)}</tbody></table></div>
          )}
          {activeTab === "invoices" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{financials.invoices.length > 0 ? financials.invoices.map(invoice => (
              <div key={invoice.id} className="bg-slate-50/50 rounded-xl p-3 border border-slate-100 hover:border-teal-300 transition-all cursor-pointer group" onClick={() => navigate(`/admin/billing/preview/${invoice.id}`)}>
                <div className="flex justify-between items-start mb-3"><p className="text-[7px] font-black text-teal-600 uppercase tracking-widest">{invoice.invoice_number}</p><span className={`px-2 py-0.5 rounded-md text-[6px] font-black uppercase ${invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{invoice.status}</span></div>
                <h4 className="font-black text-slate-900 text-[9px] uppercase mb-1 truncate group-hover:text-teal-600">{invoice.title}</h4>
                <p className="text-[7px] font-bold text-slate-400 uppercase truncate mb-4">{invoice.client_name}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                   <span className="text-[11px] font-black text-slate-900">KSh {parseFloat(invoice.total_amount_kes || 0).toLocaleString()}</span>
                   <FileText size={12} className="text-slate-300 group-hover:text-teal-500" />
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center opacity-20 uppercase font-black text-[10px]">Zero Invoices Found</div>
            )}</div>
          )}
        </div>
      </div>
    </div>
  );
}
