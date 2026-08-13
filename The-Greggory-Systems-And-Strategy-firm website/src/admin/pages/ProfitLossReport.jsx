import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PieChart, X, ArrowUpRight, ArrowDownRight, FileText, Download, RefreshCw } from "lucide-react";
import { getApiUrl } from "../../services/api";

export function ProfitLossReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ revenue: 0, expenses: 0, net: 0, entries: [] });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await fetch(getApiUrl(`/api/admin/ledger${location.search}`));
      if (res.ok) {
        const result = await res.json();
        const rev = result.entries.filter(e => e.entry_type === 'invoice_payment' || e.entry_type === 'income').reduce((s, e) => s + parseFloat(e.amount), 0);
        const exp = result.entries.filter(e => e.entry_type === 'expense').reduce((s, e) => s + parseFloat(e.amount), 0);
        setData({ revenue: rev, expenses: exp, net: rev - exp, entries: result.entries });
      }
      setLoading(false);
    };
    fetchData();
  }, [location.search]);

  if (loading) return <div className="fixed inset-0 bg-[#020617] flex items-center justify-center text-white"><RefreshCw className="animate-spin" /></div>;

  return (
    <div className="fixed inset-0 bg-[#020617] z-[500] flex flex-col overflow-hidden font-sans">
      <div className="bg-[#0f172a] p-8 flex items-center justify-between border-b border-white/5 relative flex-shrink-0">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32"></div>
         <div className="relative z-10 flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-2xl"><PieChart size={24} className="text-blue-400" /></div>
            <div>
               <h2 className="text-3xl font-black text-white tracking-tight uppercase">Profit & Loss Telemetry</h2>
               <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.4em] mt-1">Strategic Audit Node Active</p>
            </div>
         </div>
         <button onClick={() => navigate('/admin/billing')} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 relative z-10 transition-all group">
          <X className="w-6 h-6 text-slate-500 group-hover:text-rose-500 transition-colors" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-12 space-y-12">
         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2 p-8 bg-white/2 rounded-[40px] border border-white/5">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Gross Revenue</p>
              <p className="text-5xl font-black text-emerald-500">KSh {data.revenue.toLocaleString()}</p>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600/50 mt-4 uppercase"><ArrowUpRight size={14} /><span>Ledger Inflow</span></div>
            </div>
            <div className="space-y-2 p-8 bg-white/2 rounded-[40px] border border-white/5">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Operational Burn</p>
              <p className="text-5xl font-black text-rose-500">KSh {data.expenses.toLocaleString()}</p>
              <div className="flex items-center gap-2 text-xs font-bold text-rose-600/50 mt-4 uppercase"><ArrowDownRight size={14} /><span>Total Outflow</span></div>
            </div>
            <div className="space-y-2 p-8 bg-blue-600/10 rounded-[40px] border border-blue-500/20 shadow-2xl shadow-blue-900/20">
              <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Net Profit Margin</p>
              <p className="text-5xl font-black text-blue-400">{data.revenue > 0 ? Math.round((data.net / data.revenue) * 100) : 0}%</p>
              <p className="text-[8px] font-black text-blue-500/50 uppercase tracking-widest mt-4">Firm Efficiency Node</p>
            </div>
         </div>

         <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
               <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] border-b border-white/5 pb-4">Revenue Streams</h4>
               {['invoice_payment', 'income'].map(type => {
                 const amount = data.entries.filter(e => e.entry_type === type).reduce((s, e) => s + parseFloat(e.amount), 0);
                 const p = data.revenue > 0 ? (amount / data.revenue) * 100 : 0;
                 return (
                   <div key={type} className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>{type}</span><span>KSh {amount.toLocaleString()}</span></div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p}%` }}></div></div>
                   </div>
                 );
               })}
            </div>
            <div className="space-y-6 text-center py-10 bg-white/2 rounded-[40px] border border-dashed border-white/5">
               <FileText size={32} className="mx-auto text-slate-700 mb-4" />
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Extended Financial Report Generation Coming Soon</p>
            </div>
         </div>
      </div>

      <div className="bg-[#0f172a] p-10 border-t border-white/5 flex justify-between items-center flex-shrink-0">
         <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.6em]">Property of Greggory Systems & Strategy Firm © 2024</p>
         <button className="bg-white/5 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 hover:bg-white/10 transition-all">Download Strategic Audit</button>
      </div>
    </div>
  );
}
