import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Download, Printer, X, RefreshCw, Send, MailCheck, BadgeCheck } from "lucide-react";
import { getApiUrl, apiCall } from "../../services/api";
import SearchBlock from "../../components/SearchBlock";

export function InvoicePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendMsg, setSendMsg] = useState(null);

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

  const handleSendInvoice = async () => {
    if (!invoice) return;
    if (!invoice.client_email) {
      setSendMsg({ ok: false, text: "This invoice has no client email — add one and retry." });
      return;
    }
    if (!window.confirm(`Send invoice ${invoice.invoice_number || "INV-" + invoice.id} to ${invoice.client_email}?`)) return;
    setSending(true);
    setSendMsg(null);
    try {
      const data = await apiCall(`/invoices/${invoice.id}/send`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setInvoice((inv) => ({ ...inv, email_sent: 1, email_sent_at: new Date().toISOString(), status: "sent" }));
      setSendMsg({ ok: true, text: data.message || "Invoice sent to client." });
    } catch (e) {
      setSendMsg({ ok: false, text: String(e.message || e) });
    }
    setSending(false);
  };

  if (loading) return <div className="fixed inset-0 bg-[#020617] flex items-center justify-center"><RefreshCw className="animate-spin text-teal-500" /></div>;
  if (!invoice) return <div className="fixed inset-0 bg-[#020617] flex items-center justify-center text-white">Invoice Not Found <button onClick={() => navigate('/admin/billing')} className="ml-4 underline">Back</button></div>;

  // ── Contractor-template layout: mirror the client-facing PDF renderer ──
  const currency = invoice.currency || "KES";
  const isQuote = String(invoice.invoice_type || "").toLowerCase().includes("quote");
  const docTitle = isQuote ? "QUOTE" : "INVOICE";

  const items = (() => {
    let rows = [];
    try {
      const p = typeof invoice.items === "string" ? JSON.parse(invoice.items) : invoice.items;
      if (Array.isArray(p)) rows = p;
    } catch (e) {}
    if (!rows.length) rows = [{ description: invoice.title || "Professional services as per agreement", quantity: 1, unit_price: invoice.subtotal || 0, line_total: invoice.subtotal || 0 }];
    return rows.map(it => ({
      description: it.item_description || it.description || it.name || "Service item",
      quantity: it.quantity != null ? Number(it.quantity) : 1,
      unit_price: Number(it.unit_price || it.rate || it.price || 0),
      line_total: Number(it.line_total != null ? it.line_total : (it.amount != null ? it.amount : ((it.quantity || 1) * (it.unit_price || 0)))),
    }));
  })();

  const subtotal = items.reduce((s, it) => s + it.line_total, 0);
  const rateRaw = Number(invoice.tax_rate || 0);
  const ratePct = rateRaw > 1 ? rateRaw : Number((rateRaw * 100).toFixed(2));
  const taxAmount = Number(invoice.tax_amount) > 0 ? Number(invoice.tax_amount) : subtotal * (ratePct / 100);
  const storedTotal = Number(invoice.total_amount_kes) > 0 ? Number(invoice.total_amount_kes) : Number(invoice.total_amount);
  const grandTotal = storedTotal > 0 ? storedTotal : subtotal + taxAmount;

  const fmt = (n) => {
    const v = Number(n || 0);
    const s = v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return currency && currency !== "KES" ? `${currency} ${s}` : `KSH ${s}`;
  };

  const noteText = [invoice.notes, invoice.terms_conditions, invoice.payment_terms]
    .filter(n => n && String(n).trim())
    .join("\n");

  const statusColour =
    String(invoice.status || "").toLowerCase() === "paid" ? "bg-emerald-50 text-emerald-700" :
    String(invoice.status || "").toLowerCase() === "overdue" ? "bg-rose-50 text-rose-700" :
    "bg-amber-50 text-amber-700";

  return (
    <div className="fixed inset-0 bg-[#020617] z-[500] flex flex-col overflow-y-auto">
      <div className="bg-[#020617] px-10 py-6 flex justify-between items-center border-b border-white/5 no-print sticky top-0 z-[510]">
         <div className="flex items-center gap-6">
            <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white font-black border border-white/10">GS</div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.5em] hidden sm:block">Invoice Preview</h2>
         </div>

         <div className="flex-1 max-w-lg mx-10 hidden md:block">
            <SearchBlock variant="admin" placeholder="Query mission database..." />
         </div>
         <div className="flex gap-4">
            <button onClick={handleSendInvoice} disabled={sending} className={`flex items-center gap-3 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${invoice.email_sent ? "bg-emerald-600/90 border-emerald-400 text-white" : "bg-white/5 border-white/10 text-white hover:bg-emerald-600 hover:border-emerald-400"} disabled:opacity-60`}>
               {sending ? <RefreshCw size={16} className="animate-spin" /> : invoice.email_sent ? <MailCheck size={16} /> : <Send size={16} />}
               {invoice.email_sent ? "Sent" : "Send to Client"}
            </button>
            <a href={getApiUrl(`/api/documents/invoices/${id}/pdf`)} className="flex items-center gap-3 bg-teal-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-500 transition-all border border-teal-500"><Download size={16} /> Download PDF</a>
            <a href={getApiUrl(`/api/pdf/completion/invoices/${id}`)} className="flex items-center gap-3 bg-white/5 text-teal-300 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-600 hover:text-white transition-all border border-teal-500/40"><BadgeCheck size={16} /> Completion PDF</a>
            <button onClick={() => window.print()} className="flex items-center gap-3 bg-white/5 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all border border-white/10"><Printer size={16} /> Print</button>
            <button onClick={() => navigate('/admin/billing')} className="p-3 bg-rose-600 text-white rounded-2xl shadow-xl hover:bg-rose-700 transition-all"><X size={20} /></button>
         </div>
      </div>

      {sendMsg && (
         <div className={`mx-10 mt-4 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border ${sendMsg.ok ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
            {sendMsg.text}
         </div>
      )}

      <div className="flex-1 bg-slate-900/50 py-20 px-4 flex justify-center">
         <div className="bg-white shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-[850px] text-slate-900 relative min-h-[700px] lg:min-h-[1150px] font-sans printable-area rounded-sm overflow-hidden">
            <div className="p-8 sm:p-12 lg:p-16">

               {/* Brand banner + document title (matches the client-facing PDF) */}
               <div className="bg-[#0f172a] text-white mb-8 overflow-hidden">
                  <div className="flex justify-between items-center px-8 lg:px-12 py-9">
                     <div>
                        <p className="text-xl lg:text-2xl font-black leading-tight">THE GREGGORY SYSTEMS</p>
                        <p className="text-base lg:text-lg font-black text-teal-300 leading-tight">AND STRATEGY FIRM</p>
                        <p className="text-[8px] lg:text-[9px] font-bold text-teal-200/80 uppercase tracking-[0.25em] mt-2">Strategic Projects, Systems &amp; Business Solutions</p>
                     </div>
                     <div className="text-right">
                        <p className="text-5xl lg:text-6xl font-black text-teal-500 uppercase tracking-tight leading-none">{docTitle}</p>
                        <p className="text-[9px] lg:text-[10px] font-black text-slate-300 uppercase tracking-widest mt-3">No. {invoice.invoice_number || invoice.id}</p>
                     </div>
                  </div>
               </div>

               {/* Teal rule (mirrors the renderer's divider) */}
               <div className="h-[3px] bg-teal-600 w-full mb-8" />

               {/* Bill-to (left) + meta grid (right) */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                  <div>
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.35em] mb-2">Bill To</p>
                     <p className="text-xl font-black text-slate-900 uppercase leading-tight">{invoice.client_name || "Client"}</p>
                     {invoice.client_email && <p className="text-xs font-bold text-slate-500 mt-1">{invoice.client_email}</p>}
                     {invoice.client_phone && <p className="text-xs font-bold text-slate-500 mt-0.5">{invoice.client_phone}</p>}
                     {invoice.client_address && <p className="text-xs font-bold text-slate-500 mt-0.5">{invoice.client_address}</p>}
                  </div>
                  <div className="space-y-2.5 sm:pt-1">
                     <div className="flex justify-between gap-6 text-xs">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em]">Invoice No.</span>
                        <span className="font-black text-slate-900">{invoice.invoice_number || invoice.id}</span>
                     </div>
                     <div className="flex justify-between gap-6 text-xs">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em]">Issued</span>
                        <span className="font-bold text-slate-700">{invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : "—"}</span>
                     </div>
                     {invoice.due_date && (
                     <div className="flex justify-between gap-6 text-xs">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em]">Due Date</span>
                        <span className="font-bold text-slate-700">{new Date(invoice.due_date).toLocaleDateString()}</span>
                     </div>
                     )}
                     <div className="flex justify-between gap-6 items-center">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em]">Status</span>
                        <span className={`font-black uppercase px-2 py-0.5 rounded-full text-[8px] ${statusColour}`}>{String(invoice.status || "sent").toUpperCase()}</span>
                     </div>
                  </div>
               </div>

               {/* Line-item table: # / Description / Qty / Rate / Amount */}
               <table className="w-full mb-8">
                  <thead>
                     <tr className="bg-[#0f172a] text-white">
                        <th className="py-3 pl-4 text-left text-[9px] font-black uppercase tracking-widest w-10">#</th>
                        <th className="py-3 text-left text-[9px] font-black uppercase tracking-widest">Description</th>
                        <th className="py-3 text-right text-[9px] font-black uppercase tracking-widest w-16">Qty</th>
                        <th className="py-3 text-right text-[9px] font-black uppercase tracking-widest w-24">Rate</th>
                        <th className="py-3 pr-4 text-right text-[9px] font-black uppercase tracking-widest w-28">Amount</th>
                     </tr>
                  </thead>
                  <tbody>
                     {items.map((it, idx) => (
                        <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50" : "bg-white"}>
                           <td className="py-3 pl-4 text-[10px] font-bold text-slate-400">{idx + 1}</td>
                           <td className="py-3 text-xs font-bold text-slate-800">{it.description}</td>
                           <td className="py-3 text-right text-[10px] font-bold text-slate-500">{it.quantity}</td>
                           <td className="py-3 text-right text-[10px] font-bold text-slate-500">{fmt(it.unit_price)}</td>
                           <td className="py-3 pr-4 text-right text-xs font-black text-slate-900">{fmt(it.line_total)}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>

            {/* Payment instructions + totals */}
               <div className="flex flex-col sm:flex-row justify-between gap-8 mb-4">
                  <div className="bg-teal-50 border-l-4 border-teal-600 p-5 rounded-sm max-w-sm">
                     <p className="text-[8px] font-black text-teal-700 uppercase tracking-[0.2em] mb-3">How to Pay — M-Pesa Send Money</p>
                     <ol className="text-[9px] font-bold text-slate-600 space-y-1.5 list-decimal list-inside">
                        <li>Open M-Pesa and choose Send Money</li>
                        <li>Send to <span className="font-black text-slate-900">+254 115 525 854</span></li>
                        <li>Use <span className="font-black text-slate-900">{invoice.invoice_number || "Invoice"}</span> as the reference</li>
                     </ol>
                  </div>

                  <div className="w-full sm:w-72 space-y-2.5 sm:pt-1">
                     <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        <span>Subtotal</span><span className="font-black text-slate-900">{fmt(subtotal)}</span>
                     </div>
                     {ratePct > 0 && (
                     <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        <span>Tax ({ratePct}%)</span><span className="font-black text-slate-900">{fmt(taxAmount)}</span>
                     </div>
                     )}
                     <div className="flex justify-between items-center pt-3 border-t-2 border-slate-900">
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-900">TOTAL</span>
                        <span className="text-2xl font-black text-teal-600 tracking-tight">{fmt(grandTotal)}</span>
                     </div>
                  </div>
               </div>

               {/* Notes / terms */}
               {noteText && (
                  <div className="mt-8">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.35em] mb-1">Notes &amp; Terms</p>
                     <p className="text-[10px] font-bold text-slate-600 whitespace-pre-line leading-relaxed">{noteText}</p>
                  </div>
               )}

               {/* Thank-you + footer */}
               <div className="mt-14 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <p className="text-[10px] font-bold text-slate-500 text-center sm:text-left">Thank you for choosing The Greggory Systems And Strategy Firm.</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] text-center">© {new Date().getFullYear()} The Greggory Systems &amp; Strategy Firm</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
