import React, { useState, useEffect } from "react";
import { apiCall } from "../../services/api";
import { formatKSH } from "../../utils/currencyUtils";
import {
  RefreshCw, Download, TrendingUp, Wallet, Banknote, Receipt,
  FolderKanban, FileText, PieChart
} from "lucide-react";

export function Reports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    revenue: 0, expenses: 0, net: 0, outstanding: 0,
    projects: [], invoices: [], entries: []
  });

  useEffect(() => { fetchReportData(); }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [budgetRes, invoiceRes, projectsRes, ledgerRes] = await Promise.all([
        apiCall("/admin-complete/budget-overview"),
        apiCall("/invoices"),
        apiCall("/user-projects"),
        apiCall("/admin/ledger")
      ]);

      const invoices = invoiceRes?.invoices || invoiceRes?.data || (Array.isArray(invoiceRes) ? invoiceRes : []);
      const projects = Array.isArray(projectsRes) ? projectsRes : (projectsRes?.projects || projectsRes?.data || []);
      const entries = ledgerRes?.entries || [];
      const b = budgetRes?.data || {};

      const outstanding = invoices
        .filter(i => String(i.status || '').toLowerCase() !== 'paid')
        .reduce((s, i) => s + parseFloat(i.total_amount_kes || 0), 0);

      setData({
        revenue: b.revenue ?? 0,
        expenses: b.expenses ?? 0,
        net: b.net_income ?? ((b.revenue ?? 0) - (b.expenses ?? 0)),
        outstanding,
        projects,
        invoices,
        entries
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const exportCsv = (rows, filename) => {
    if (!rows.length) { alert("Nothing to export yet."); return; }
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  const downloadReport = () => {
    const lines = [
      `GREGGORY SYSTEMS & STRATEGY FIRM — BUSINESS REPORT`,
      `Generated: ${new Date().toLocaleString()}`,
      ``,
      `== FINANCIAL SUMMARY ==`,
      `Total Revenue: KSH ${data.revenue.toLocaleString()}`,
      `Total Expenses: KSH ${data.expenses.toLocaleString()}`,
      `Net Profit: KSH ${data.net.toLocaleString()}`,
      `Outstanding (Unpaid Invoices): KSH ${data.outstanding.toLocaleString()}`,
      ``,
      `== INVOICES ==`,
      `Total Invoices: ${data.invoices.length}`,
      `Paid: ${data.invoices.filter(i => String(i.status).toLowerCase() === 'paid').length}`,
      `Unpaid: ${data.invoices.filter(i => String(i.status).toLowerCase() !== 'paid').length}`,
      ``,
      `== PROJECTS ==`,
      `Total Projects: ${data.projects.length}`,
      ...Object.entries(projectStatusCounts()).map(([s, n]) => `${s}: ${n}`),
      ``,
      `== LEDGER ==`,
      `Total Entries: ${data.entries.length}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `greggory-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const projectStatusCounts = () => {
    const counts = {};
    data.projects.forEach(p => {
      const s = String(p.status || 'unknown').toLowerCase();
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <RefreshCw className="animate-spin text-teal-600 w-8 h-8" />
      <p className="mt-4 text-[7px] font-black text-slate-400 uppercase tracking-[0.6em]">Compiling Business Reports...</p>
    </div>
  );

  const statusCounts = projectStatusCounts();
  const maxStatus = Math.max(1, ...Object.values(statusCounts));
  const paidInvoices = data.invoices.filter(i => String(i.status).toLowerCase() === 'paid');

  const expenseByCategory = {};
  data.entries.filter(e => e.entry_type === 'expense').forEach(e => {
    const c = e.category || 'Uncategorized';
    expenseByCategory[c] = (expenseByCategory[c] || 0) + parseFloat(e.amount || 0);
  });
  const topExpenses = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxExpense = Math.max(1, ...topExpenses.map(e => e[1]));


  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1200px] mx-auto pb-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Reports & Analytics</h2>
          <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Live Business Performance — {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={downloadReport} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-5 py-3 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-teal-600/20 transition-all w-fit">
          <Download size={14} /> Download Report
        </button>
      </div>

      {/* FINANCIAL SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", val: data.revenue, color: "text-emerald-600", bg: "bg-emerald-50", icon: TrendingUp },
          { label: "Total Expenses", val: data.expenses, color: "text-rose-600", bg: "bg-rose-50", icon: Wallet },
          { label: "Net Profit", val: data.net, color: "text-sky-600", bg: "bg-sky-50", icon: Banknote },
          { label: "Outstanding", val: data.outstanding, color: "text-amber-600", bg: "bg-amber-50", icon: Receipt },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className={`${m.bg} w-8 h-8 rounded-xl flex items-center justify-center mb-3`}><m.icon size={14} className={m.color} /></div>
            <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
            <p className={`text-base font-black ${m.color}`}>{formatKSH(m.val)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


        {/* PROJECTS BY STATUS */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FolderKanban size={14} className="text-teal-500" />
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Projects by Status</h3>
          </div>
          {Object.keys(statusCounts).length === 0 ? (
            <p className="py-10 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">No projects yet</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{String(status).replace(/_/g, ' ')}</span>
                    <span className="text-[9px] font-black text-slate-900">{count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${(count / maxStatus) * 100}%` }}></div>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-50 flex justify-between">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                <span className="text-[10px] font-black text-slate-900">{data.projects.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* INVOICE PERFORMANCE */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText size={14} className="text-emerald-500" />
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Invoice Performance</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Total", n: data.invoices.length, color: "text-slate-900" },
              { label: "Paid", n: paidInvoices.length, color: "text-emerald-600" },
              { label: "Unpaid", n: data.invoices.length - paidInvoices.length, color: "text-amber-600" },
            ].map(s => (
              <div key={s.label} className="bg-slate-50/60 rounded-2xl p-4 text-center">
                <p className={`text-xl font-black ${s.color}`}>{s.n}</p>
                <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <button onClick={() => exportCsv(data.invoices, 'invoices.csv')} className="w-full py-2.5 border border-slate-200 hover:border-teal-500 rounded-xl text-[8px] font-black text-slate-600 uppercase tracking-widest transition-all flex items-center justify-center gap-2">
            <Download size={11} /> Export Invoices CSV
          </button>
        </div>


        {/* TOP EXPENSE CATEGORIES */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChart size={14} className="text-rose-500" />
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Top Expense Categories</h3>
          </div>
          {topExpenses.length === 0 ? (
            <p className="py-10 text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">No expenses recorded yet</p>
          ) : (
            <div className="space-y-4">
              {topExpenses.map(([cat, amt]) => (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{cat}</span>
                    <span className="text-[9px] font-black text-rose-600">{formatKSH(amt)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${(amt / maxExpense) * 100}%` }}></div>
                  </div>
                </div>
              ))}
              <button onClick={() => exportCsv(data.entries, 'ledger.csv')} className="w-full mt-2 py-2.5 border border-slate-200 hover:border-teal-500 rounded-xl text-[8px] font-black text-slate-600 uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <Download size={11} /> Export Full Ledger CSV
              </button>
            </div>
          )}
        </div>

        {/* QUICK LEDGER SUMMARY */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Banknote size={14} className="text-sky-500" />
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Ledger Summary</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Income Entries", n: data.entries.filter(e => e.entry_type !== 'expense').length, color: "text-emerald-600" },
              { label: "Expense Entries", n: data.entries.filter(e => e.entry_type === 'expense').length, color: "text-rose-600" },
              { label: "Total Entries", n: data.entries.length, color: "text-slate-900" },
            ].map(s => (
              <div key={s.label} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
                <span className={`text-sm font-black ${s.color}`}>{s.n}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
