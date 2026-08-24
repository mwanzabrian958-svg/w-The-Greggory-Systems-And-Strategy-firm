import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, Printer, X, RefreshCw } from "lucide-react";
import { getApiUrl } from "../../services/api";
import { formatKSH } from "../../utils/currencyUtils";

export function InvoicePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      const allRes = await fetch(getApiUrl("/api/invoices"));
      if (allRes.ok) {
        const data = await allRes.json();
        const found = data.invoices.find(inv => inv.id == id);
        setInvoice(found);
      }
      setLoading(false);
    };
    fetchInvoice();
  }, [id]);

  if (loading) return <div className="fixed inset-0 bg-[#020617] flex items-center justify-center"><RefreshCw className="animate-spin text-teal-500" /></div>;
  if (!invoice) return <div className="fixed inset-0 bg-[#020617] flex items-center justify-center text-white">Invoice Not Found <button onClick={() => navigate('/admin/billing')} className="ml-4 underline">Back</button></div>;

  return (
    <div className="fixed inset-0 bg-[#020617] z-[500] flex flex-col overflow-y-auto">
      <div className="bg-[#020617] px-10 py-6 flex justify-between items-center border-b border-white/5 no-print sticky top-0 z-[510]">
         <div className="flex items-center gap-6">
            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white font-black border border-white/10">GS</div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.5em]">Invoice Preview</h2>
         </div>
         <div className="flex gap-4">
            <a href={getApiUrl(`/api/documents/invoices/${id}/pdf`)} className="flex items-center gap-3 bg-teal-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-500 transition-all border border-teal-500"><Download size={16} /> Download PDF</a>
            <button onClick={() => window.print()} className="flex items-center gap-3 bg-white/5 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"><Printer size={16} /> Print</button>
            <button onClick={() => navigate('/admin/billing')} className="p-3 bg-rose-600 text-white rounded-2xl shadow-xl hover:bg-rose-700 transition-all"><X size={20} /></button>
         </div>
      </div>

      <div className="flex-1 bg-slate-900/50 py-20 px-4 flex justify-center">
         <div className="bg-white shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-[850px] p-24 text-slate-900 relative min-h-[1150px] font-serif printable-area overflow-hidden rounded-sm">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none rotate-[-35deg] select-none text-[150px] font-black uppercase">GREGGORY</div>

            <div className="flex justify-between items-start mb-24">
               <div className="space-y-8">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-[#0f172a] rounded-2xl flex items-center justify-center text-white font-black text-3xl">GS</div>
                     <h1 className="text-3xl font-black tracking-tighter leading-[0.85] text-slate-900 uppercase">THE GREGGORY SYSTEMS<br/><span className="text-teal-600 text-xl">& STRATEGY FIRM</span></h1>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-loose">
                     Nairobi, Kenya<br/>
                     thegreggorysystemsandstrategyf@gmail.com<br/>
                     Tel: +254 115 525 854
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-6xl font-black text-slate-200 uppercase tracking-[0.2em] mb-8">INVOICE</p>
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">No: {invoice.invoice_number}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Issued: {new Date(invoice.issue_date).toLocaleDateString()}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-24 mb-24">
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-teal-600 uppercase tracking-[0.4em] border-b-2 border-teal-50 pb-3">Strategic Client</h4>
                  <div className="space-y-1">
                     <p className="text-2xl font-black text-slate-900 uppercase">{invoice.client_name}</p>
                     <p className="text-sm font-bold text-slate-500">{invoice.client_email}</p>
                  </div>
               </div>
               <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] border-b-2 border-slate-50 pb-3">Operational Context</h4>
                  <div className="space-y-1">
                     <p className="text-sm font-black text-slate-900 uppercase tracking-widest">{invoice.project_name || 'General Services'}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                  </div>
               </div>
            </div>

            <div className="mb-24">
               <table className="w-full">
                  <thead>
                     <tr className="text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-b-4 border-slate-900">
                        <th className="py-6">Description</th>
                        <th className="py-6 text-right">Amount (KES)</th>
                     </tr>
                  </thead>
                  <tbody>
                     {(() => { let rows = []; try { const p = typeof invoice.items === "string" ? JSON.parse(invoice.items) : invoice.items; if (Array.isArray(p)) rows = p; } catch (e) {} if (!rows.length) rows = [{ item_description: invoice.title, line_total: invoice.subtotal }]; return rows; })().map((it, idx) => (
                        <tr key={idx} className="border-b border-slate-100">
                           <td className="py-8">
                              <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{it.item_description || it.description || "Service item"}</p>
                           </td>
                           <td className="py-8 text-right font-black text-slate-900 text-xl">{formatKSH(it.line_total != null ? it.line_total : (it.quantity || 1) * (it.unit_price || 0))}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

            <div className="flex justify-between items-end">
                <div className="bg-teal-50 p-5 rounded-2xl border border-teal-100 w-72">
                   <p className="text-[9px] font-black text-teal-700 uppercase tracking-[0.2em] mb-3">How to Pay - M-Pesa Send Money</p>
                   <ol className="text-[9px] font-bold text-slate-600 space-y-1.5 list-decimal list-inside">
                      <li>Open M-Pesa and choose Send Money</li>
                      <li>Send to <span className="font-black text-slate-900">+254 115 525 854</span></li>
                      <li>Use <span className="font-black text-slate-900">{invoice.invoice_number}</span> as the reference</li>
                   </ol>
                </div>
               <div className="w-80 space-y-6">
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400"><span>Subtotal</span><span>{formatKSH(invoice.subtotal)}</span></div>
                  <div className="flex justify-between items-center pt-8 border-t-8 border-slate-900">
                     <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">TOTAL</span>
                     <span className="text-4xl font-black text-slate-900 tracking-tighter underline decoration-teal-500 decoration-8 underline-offset-[12px]">{formatKSH(invoice.total_amount_kes)}</span>
                  </div>
               </div>
            </div>

            <div className="absolute bottom-16 left-24 right-24 flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-[0.8em] border-t border-slate-100 pt-12">
               <span>The Greggory Systems & Strategy Firm - Thank you</span>
               <span>Copyright (c) {new Date().getFullYear()}</span>
            </div>
         </div>
      </div>
    </div>
  );
}
