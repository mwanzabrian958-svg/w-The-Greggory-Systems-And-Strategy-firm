import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Download, MailCheck, Printer, Send, X } from "lucide-react";
import { apiCall, getPdfUrl } from "../../services/api";
import { PageLoader } from "../../components/Loading";

export function InvoicePdfPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pdfFrame = useRef(null);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState("");
  const [sendMessage, setSendMessage] = useState(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    apiCall(`/invoices/${id}`)
      .then((data) => {
        if (active) setInvoice(data);
      })
      .catch((loadError) => {
        console.error(loadError);
        if (active) setError(loadError.message || "Could not load this invoice.");
      });
    return () => {
      active = false;
    };
  }, [id]);

  const pdfUrl = getPdfUrl(`/api/documents/invoices/${id}/pdf?inline=true`);
  const downloadUrl = getPdfUrl(`/api/documents/invoices/${id}/pdf`);

  const handleSendInvoice = async () => {
    if (!invoice) return;
    if (!invoice.client_email) {
      setSendMessage({ ok: false, text: "This invoice has no client email address." });
      return;
    }
    if (!window.confirm(`Send invoice ${invoice.invoice_number || `INV-${invoice.id}`} to ${invoice.client_email}?`)) return;

    setSending(true);
    setSendMessage(null);
    try {
      const result = await apiCall(`/invoices/${invoice.id}/send`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setInvoice((current) => ({ ...current, email_sent: 1, status: "sent" }));
      setSendMessage({ ok: true, text: result.message || "Invoice sent to client." });
    } catch (sendError) {
      setSendMessage({ ok: false, text: sendError.message || "Could not send invoice." });
    } finally {
      setSending(false);
    }
  };

  if (!invoice && !error) {
    return <PageLoader label="Generating invoice PDF…" tone="teal" className="bg-[#020617]" />;
  }

  return (
    <div className="fixed inset-0 z-[500] flex flex-col overflow-hidden bg-[#020617] text-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#020617] px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h1 className="text-sm font-bold">Invoice PDF</h1>
          {invoice && (
            <p className="truncate text-xs text-slate-400">
              {invoice.invoice_number || `Invoice ${invoice.id}`} · {invoice.client_name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {invoice && (
            <>
              <button
                type="button"
                onClick={handleSendInvoice}
                disabled={sending}
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/10"
              >
                {sending ? <Send size={14} className="animate-pulse" /> : invoice.email_sent ? <MailCheck size={14} /> : <Send size={14} />}
                {sending ? "Sending…" : invoice.email_sent ? "Sent" : "Email invoice"}
              </button>
              <button
                type="button"
                onClick={() => pdfFrame.current?.contentWindow?.print()}
                className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/10"
              >
                <Printer size={14} /> Print
              </button>
              <a
                href={downloadUrl}
                className="flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold hover:bg-teal-500"
              >
                <Download size={14} /> Download PDF
              </a>
            </>
          )}
          <button
            type="button"
            onClick={() => navigate("/admin/billing")}
            aria-label="Close invoice PDF"
            title="Close"
            className="rounded-lg bg-rose-600 p-2 hover:bg-rose-500"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {error ? (
        <div role="alert" className="m-6 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : (
        <iframe
          ref={pdfFrame}
          key={id}
          title={`Invoice PDF ${invoice?.invoice_number || id}`}
          src={pdfUrl}
          className="min-h-0 flex-1 border-0 bg-slate-700"
        />
      )}
      {sendMessage && (
        <div
          role={sendMessage.ok ? "status" : "alert"}
          className={`fixed bottom-4 right-4 z-[520] max-w-lg rounded-lg border px-4 py-3 text-sm shadow-lg ${sendMessage.ok ? "border-emerald-500/30 bg-emerald-950 text-emerald-100" : "border-rose-500/30 bg-rose-950 text-rose-100"}`}
        >
          {sendMessage.text}
        </div>
      )}
    </div>
  );
}
