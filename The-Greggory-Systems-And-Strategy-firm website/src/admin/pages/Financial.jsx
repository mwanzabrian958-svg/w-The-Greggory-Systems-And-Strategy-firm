import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiCall, getApiUrl } from "../../services/api";
import { formatKSH } from "../../utils/currencyUtils";
import {
  TrendingUp, Banknote, RefreshCw, FilePlus2,
  Trash2, Eye, Plus, Wallet, Receipt, Send, FileDown
} from "lucide-react";

export function Billing() {
  const navigate = useNavigate();
  const [displayMode, setDisplayMode] = useState("invoices"); // 'invoices' | 'ledger' | 'mpesa'
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [financials, setFinancials] = useState({
    revenue: 0, expenses: 0, net_income: 0, outstanding: 0,
    entries: [], invoices: [], mpesa: []
  });

  useEffect(() => { fetchFinancialData(); }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const [ledgerRes, invoiceRes, mpesaRes] = await Promise.all([
        apiCall("/admin/ledger"),
        apiCall("/invoices"),
        apiCall("/mpesa/transactions")
      ]);

      const entries = ledgerRes.entries || [];
      const invoices = invoiceRes.invoices || invoiceRes.data || (Array.isArray(invoiceRes) ? invoiceRes : []);
      const totalRevenue = entries.filter(e => e.entry_type === 'income' || e.entry_type === 'invoice_payment').reduce((s, e) => s + parseFloat(e.amount || 0), 0);
      const totalExpenses = entries.filter(e => e.entry_type === 'expense').reduce((s, e) => s + parseFloat(e.amount || 0), 0);

      // Outstanding = sum of invoices not yet marked paid
      const outstanding = invoices
        .filter(inv => String(inv.status || '').toLowerCase() !== 'paid')
        .reduce((s, inv) => s + parseFloat(inv.total_amount_kes || 0), 0);

      const mpesaList = Array.isArray(mpesaRes) ? mpesaRes : ((mpesaRes && (mpesaRes.transactions || mpesaRes.data)) || []);
      setFinancials({
        revenue: totalRevenue,
        expenses: totalExpenses,
        net_income: totalRevenue - totalExpenses,
        outstanding,
        entries,
        invoices,
        mpesa: mpesaList
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSendInvoice = async (inv) => {
    if (!inv.client_email) {
      setNotice({ ok: false, text: `Invoice ${inv.invoice_number || inv.id} has no client email — open it and add one.` });
      return;
    }
    if (!window.confirm(`Send invoice ${inv.invoice_number || "INV-" + inv.id} to ${inv.client_email}?`)) return;
    setSendingId(inv.id);
    setNotice(null);
    try {
      const res = await apiCall(`/invoices/${inv.id}/send`, { method: "POST", body: JSON.stringify({}) });
      if (res.success) {
        setNotice({ ok: true, text: res.message || "Invoice sent to client." });
        fetchFinancialData();
      } else {
        setNotice({ ok: false, text: res.message || res.error || "Failed to send invoice." });
      }
    } catch (e) {
      setNotice({ ok: false, text: String(e.message || e) });
    }
    setSendingId(null);
    setTimeout(() => setNotice(null), 6000);
  };

  // Download a professional "Completion" PDF for any record type
  const handleDownloadCompletion = (recordType, id) => {
    if (!id) return;
    setNotice({ ok: true, text: `Generating completion PDF for ${recordType.replace(/_/g, " ")} #${id}…` });
    window.open(getApiUrl(`/api/pdf/completion/${recordType}/${id}`), "_blank");
    setTimeout(() => setNotice(null), 4000);
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm("Delete this ledger entry?")) return;
    try {
      const res = await apiCall(`/accounting/entries/${id}`, { method: 'DELETE' });
      if (res.success) fetchFinancialData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      const res = await apiCall(`/invoices/${id}`, { method: 'DELETE' });
      if (res.success) fetchFinancialData();
    } catch (e) { console.error(e); }
  };

  const statusBadge = (status) => {
    const s = String(status || 'draft').toLowerCase();
    const tone = s === 'paid' ? 'bg-emerald-50 text-emerald-600'
      : s === 'sent' || s === 'pending' ? 'bg-amber-50 text-amber-600'
      : s === 'overdue' ? 'bg-rose-50 text-rose-600'
      : 'bg-slate-100 text-slate-500';
    return <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${tone}`}>{s}</span>;
  };

  if (loading && financials.invoices.length === 0 && financials.entries.length === 0) return (
    <div className="flex flex-col items-center justify-center py-40">
       <RefreshCw className="animate-spin text-teal-600 w-8 h-8" />
       <p className="mt-4 text-[7px] font-black text-slate-400 uppercase tracking-[0.6em]">Loading financial data...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1200px] mx-auto pb-10">

      {notice && (
        <div className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border ${notice.ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
          {notice.text}
        </div>
      )}

      {/* HEADER + PRIMARY ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Financial Hub</h2>
          <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Invoices · Ledger · M-Pesa Payments</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/billing/create')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-5 py-3 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all">
            <FilePlus2 size={14} /> New Invoice
          </button>
          <button onClick={() => navigate('/admin/billing/entry')} className="flex items-center gap-2 bg-white border border-slate-200 hover:border-teal-500 text-slate-700 rounded-xl px-5 py-3 text-[9px] font-black uppercase tracking-widest transition-all">
            <Plus size={14} /> Ledger Entry
          </button>
        </div>
      </div>

      {/* SECTION 1: MASTER METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Money In (Revenue)", val: financials.revenue, color: "text-emerald-600", bg: "bg-emerald-50", icon: TrendingUp },
          { label: "Money Out (Expenses)", val: financials.expenses, color: "text-rose-600", bg: "bg-rose-50", icon: Wallet },
          { label: "Net Income", val: financials.net_income, color: "text-sky-600", bg: "bg-sky-50", icon: Banknote },
          { label: "Unpaid Invoices", val: financials.outstanding, color: "text-amber-600", bg: "bg-amber-50", icon: Receipt },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
               <p className={`text-sm font-black ${m.color}`}>{formatKSH(m.val)}</p>
            </div>
            <div className={`${m.bg} p-2 rounded-xl`}><m.icon size={14} className={m.color} /></div>
          </div>
        ))}
      </div>

      {/* SECTION 2: TABS */}
      <div className="bg-[#0f172a] rounded-2xl p-4 border border-white/10 shadow-xl flex justify-between items-center">
         <div className="flex gap-2">
            {[
              { key: "invoices", label: `Invoices (${financials.invoices.length})` },
              { key: "ledger", label: `Ledger (${financials.entries.length})` },
              { key: "mpesa", label: `M-Pesa (${financials.mpesa.length})` },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setDisplayMode(t.key)}
                className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${displayMode === t.key ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40' : 'bg-white/5 text-slate-400 hover:text-white'}`}
              >
                {t.label}
              </button>
            ))}
         </div>
         <button onClick={fetchFinancialData} className="text-[7px] font-black text-teal-400 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
           <RefreshCw size={10} /> Refresh
         </button>
      </div>

      {/* SECTION 3: CONTENT */}
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">


        {/* INVOICES */}
        {displayMode === "invoices" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Invoices</h3>
               <button onClick={() => navigate('/admin/billing/create')} className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 hover:underline">
                 <FilePlus2 size={11} /> Generate New
               </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Invoice #", "Client", "Issued", "Due", "Amount", "Status", ""].map(h => (
                      <th key={h} className="pb-3 text-[7px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {financials.invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="py-3 px-2 text-[9px] font-black text-teal-700 font-mono">{inv.invoice_number || `INV-${inv.id}`}</td>
                      <td className="py-3 px-2 text-[9px] font-bold text-slate-700">{inv.client_name || inv.client_email || '—'}</td>
                      <td className="py-3 px-2 text-[8px] font-bold text-slate-400">{inv.issue_date ? new Date(inv.issue_date).toLocaleDateString() : '—'}</td>
                      <td className="py-3 px-2 text-[8px] font-bold text-slate-400">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : '—'}</td>
                      <td className="py-3 px-2 text-right text-[10px] font-black text-slate-900">{formatKSH(inv.total_amount_kes)}</td>
                      <td className="py-3 px-2 text-center">{statusBadge(inv.status)}</td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1 justify-end">
                          <button onClick={() => handleSendInvoice(inv)} disabled={sendingId === inv.id} title={inv.client_email ? `Send invoice to ${inv.client_email}` : "No client email"} className={`p-1.5 rounded-lg transition-all ${inv.email_sent ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400 hover:bg-teal-500 hover:text-white"} disabled:opacity-60`}>
                            {sendingId === inv.id ? <RefreshCw size={11} className="animate-spin" /> : <Send size={11} />}
                          </button>
                          <button onClick={() => handleDownloadCompletion("invoices", inv.id)} title="Download completion PDF" className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:bg-teal-600 hover:text-white transition-all"><FileDown size={11} /></button>
                          <button onClick={() => navigate(`/admin/billing/preview/${inv.id}`)} title="View invoice" className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:bg-teal-500 hover:text-white transition-all"><Eye size={11} /></button>
                          <button onClick={() => handleDeleteInvoice(inv.id)} title="Delete invoice" className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={11} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {financials.invoices.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-14 text-center">
                        <p className="uppercase font-black text-[10px] text-slate-300 mb-4">No invoices yet</p>
                        <button onClick={() => navigate('/admin/billing/create')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-2.5 text-[8px] font-black uppercase tracking-widest transition-all">
                          Create your first invoice
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* LEDGER */}
        {displayMode === "ledger" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Accounting Ledger</h3>
               <button onClick={() => navigate('/admin/billing/entry')} className="text-[8px] font-black text-teal-600 uppercase tracking-widest flex items-center gap-1 hover:underline">
                 <Plus size={11} /> Add Entry
               </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Date", "Description", "Type", "Category", "Reference", "Amount", ""].map(h => (
                      <th key={h} className="pb-3 text-[7px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {financials.entries.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="py-3 px-2 text-[8px] font-bold text-slate-400">{e.transaction_date ? new Date(e.transaction_date).toLocaleDateString() : new Date(e.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-2 text-[9px] font-bold text-slate-700">{e.description || '—'}</td>
                      <td className="py-3 px-2">
                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${e.entry_type === 'expense' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {String(e.entry_type || '').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-[8px] font-bold text-slate-500">{e.category || '—'}</td>
                      <td className="py-3 px-2 text-[8px] font-bold text-slate-400 font-mono">{e.transaction_reference || '—'}</td>
                      <td className={`py-3 px-2 text-right text-[10px] font-black ${e.entry_type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {e.entry_type === 'expense' ? '-' : '+'}{formatKSH(e.amount)}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <button onClick={() => handleDownloadCompletion("accounting_entries", e.id)} title="Download completion PDF" className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:bg-teal-600 hover:text-white transition-all mr-1"><FileDown size={11} /></button>
                        <button onClick={() => handleDeleteEntry(e.id)} title="Delete entry" className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:bg-rose-500 hover:text-white transition-all"><Trash2 size={11} /></button>
                      </td>
                    </tr>
                  ))}
                  {financials.entries.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-14 text-center">
                        <p className="uppercase font-black text-[10px] text-slate-300 mb-4">Ledger is empty</p>
                        <button onClick={() => navigate('/admin/billing/entry')} className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-6 py-2.5 text-[8px] font-black uppercase tracking-widest transition-all">
                          Record first entry
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* MPESA */}
        {displayMode === "mpesa" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">M-Pesa Payments</h3>
               <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Lipa Na M-Pesa STK Push</p>
            </div>
            {financials.mpesa.length === 0 ? (
              <div className="py-14 text-center">
                <p className="uppercase font-black text-[10px] text-slate-300 mb-2">No M-Pesa transactions yet</p>
                <p className="text-[8px] font-bold text-slate-400 max-w-md mx-auto leading-relaxed">
                  When clients pay invoices via M-Pesa STK Push, every transaction (receipt number, phone, amount, status) appears here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Receipt", "Phone", "Date", "Amount", "Status"].map(h => (
                        <th key={h} className="pb-3 text-[7px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {financials.mpesa.map(t => (
                      <tr key={t.id || t.transaction_id} className="hover:bg-slate-50/50 transition-all">
                        <td className="py-3 px-4 text-[9px] font-black text-slate-900 font-mono">{t.mpesa_receipt || t.transaction_id}</td>
                        <td className="py-3 px-4 text-[9px] font-bold text-slate-600">{t.phone_number}</td>
                        <td className="py-3 px-4 text-[8px] font-bold text-slate-400">{new Date(t.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right text-[10px] font-black text-slate-900">{formatKSH(t.amount)}</td>
                        <td className="py-3 px-4 text-center">
                           <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full ${t.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : t.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>{String(t.status || 'unknown')}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
