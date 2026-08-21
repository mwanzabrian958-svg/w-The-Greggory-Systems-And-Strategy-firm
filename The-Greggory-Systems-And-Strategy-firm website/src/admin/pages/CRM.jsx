import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, TrendingUp, Filter, Plus, RefreshCw, Star, ChevronRight } from "lucide-react";
import { apiCall } from "../../services/api";
import { formatKSH } from "../../utils/currencyUtils";

/**
 * CRM - Strategic Relationship Telemetry
 */
export function CRM({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    clients: [],
    opportunities: [],
    pipeline: []
  });

  useEffect(() => {
    fetchCRM();
  }, []);

  const fetchCRM = async () => {
    try {
      setLoading(true);
      const result = await apiCall("/admin/crm-telemetry");
      if (result.success) {
        setData({
          clients: result.clients || [],
          opportunities: result.opportunities || [],
          pipeline: result.pipeline || []
        });
      }
    } catch (error) {
      console.error("CRM Relay failure:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center py-40 animate-fade-in"><RefreshCw className="animate-spin text-teal-600 w-8 h-8" /><p className="mt-4 text-[7px] font-black text-slate-400 uppercase tracking-[0.6em]">Scanning CRM Nodes...</p></div>;

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1400px] mx-auto">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.pipeline.map((lead) => (
          <div key={lead.stage} onClick={() => navigate('/admin/projects')} className="bg-white rounded-xl p-4 border border-slate-100 shadow-md flex items-center justify-between cursor-pointer hover:border-teal-500/30 transition-all">
            <div>
              <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{lead.stage}</p>
              <p className="text-xl font-black text-slate-900">{lead.count}</p>
            </div>
            <div className={`p-2.5 rounded-lg ${lead.color} bg-opacity-10`}><TrendingUp size={16} /></div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Client Asset Matrix</h3>
            <button onClick={() => navigate('/admin/users/manage')} className="p-1.5 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors"><Plus size={14} /></button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[7px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                  <th className="py-2 px-1">Identity</th>
                  <th className="py-2 px-1 text-center">Satisfaction</th>
                  <th className="py-2 px-1 text-right">Nodes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.clients.length > 0 ? data.clients.map((c) => (
                  <tr key={c.id} onClick={() => navigate(`/admin/users/detail/${c.id}/client`)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                    <td className="py-3 px-1">
                      <p className="text-[9px] font-black text-slate-900 uppercase group-hover:text-teal-600">{c.name}</p>
                      <p className="text-[7px] text-slate-400 uppercase truncate w-32">{c.email}</p>
                    </td>
                    <td className="py-3 px-1 text-center">
                       <div className="flex items-center justify-center gap-1">
                          <span className="text-[9px] font-black text-slate-900">{parseFloat(c.satisfaction).toFixed(1)}</span>
                          <Star size={8} className="fill-amber-400 text-amber-400" />
                       </div>
                    </td>
                    <td className="py-3 px-1 text-right font-black text-[9px] text-slate-600">{c.projects}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="3" className="py-20 text-center opacity-20 uppercase font-black text-[10px]">Zero Relationships Recorded</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="bg-[#0f172a] rounded-2xl p-5 border border-white/5 shadow-2xl">
           <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Strategic Pipeline</h3>
            <TrendingUp size={14} className="text-teal-400" />
          </div>
          <div className="space-y-3">
             {data.opportunities.length > 0 ? data.opportunities.map((opp) => (
               <div key={opp.id} onClick={() => navigate('/admin/projects')} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                     <p className="text-[9px] font-black text-white uppercase leading-tight group-hover:text-teal-400">{opp.title}</p>
                     <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-[6px] font-black uppercase tracking-tighter">{opp.stage}</span>
                  </div>
                  <div className="flex justify-between items-end">
                     <p className="text-sm font-black text-white">{formatKSH(opp.value)}</p>
                     <p className="text-[6px] font-black text-slate-500 uppercase tracking-widest">{opp.daysLeft}d Remaining</p>
                  </div>
               </div>
             )) : (
                <div className="py-20 text-center opacity-20 uppercase font-black text-[10px] text-white">No Active Opportunities</div>
             )}
          </div>
        </section>
      </div>
    </div>
  );
}
