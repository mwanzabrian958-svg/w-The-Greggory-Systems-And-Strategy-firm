import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HelpCircle, Plus, Search, Clock, CheckCircle, MessageCircle, RefreshCw,
  ChevronRight, ClipboardList, FileSignature, Eye, Filter,
} from "lucide-react";
import { apiCall } from "../../services/api";

const CR_COLORS = {
  submitted: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  under_review: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  approved: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  implemented: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};
const SIG_COLORS = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  signed: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  declined: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  expired: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};
const ACTION_MATRIX = {
  submitted: ["under_review", "cancelled"],
  under_review: ["approved", "rejected", "cancelled"],
  approved: ["implemented"],
  rejected: ["under_review", "cancelled"],
  implemented: [],
  cancelled: ["submitted"],
};

export function Support() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [kbItems, setKbItems] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [changeRequests, setChangeRequests] = useState([]);
  const [crLoading, setCrLoading] = useState(true);
  const [sigRequests, setSigRequests] = useState([]);
  const [sigLoading, setSigLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(null);

  const loadTickets = async () => {
    try {
      setTicketsLoading(true);
      const d = await apiCall("/feedback?author=client&limit=25");
      setTickets(Array.isArray(d?.feedback) ? d.feedback : []);
    } catch (e) {
      console.error("Failed to load client feedback:", e);
      setTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  const loadChangeRequests = async () => {
    try {
      setCrLoading(true);
      const d = await apiCall("/admin/change-requests");
      setChangeRequests(Array.isArray(d?.changeRequests) ? d.changeRequests : []);
    } catch (e) {
      console.error("Failed to load change requests:", e);
      setChangeRequests([]);
    } finally {
      setCrLoading(false);
    }
  };

  const loadSignatures = async () => {
    try {
      setSigLoading(true);
      const d = await apiCall("/admin/signature-requests");
      setSigRequests(Array.isArray(d?.signatureRequests) ? d.signatureRequests : []);
    } catch (e) {
      console.error("Failed to load signature requests:", e);
      setSigRequests([]);
    } finally {
      setSigLoading(false);
    }
  };

  const handleCrAction = async (id, status, name) => {
    if (status === "rejected") {
      const r = window.prompt(`Reason for rejecting "${name || ""}"'s change request?`, "Client request");
      if (r === null) return;
    }
    setActionBusy(id);
    try {
      await apiCall(`/admin/change-requests/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
      await loadChangeRequests();
    } catch (e) {
      console.error("CR action failed:", e);
      alert(`Could not update the change request.\n${e.message || ""}`);
    } finally {
      setActionBusy(null);
    }
  };

  useEffect(() => {
    setKbItems([]);
    loadTickets();
    loadChangeRequests();
    loadSignatures();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="animate-spin text-teal-600 w-6 h-6" />
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in font-sans max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Support Node</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Knowledge Base &amp; Technical Relay</p>
        </div>
        <button
          onClick={() => alert("Initializing Knowledge Creation Node...")}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-teal-600 text-white font-black text-[8px] uppercase tracking-widest shadow-md hover:bg-teal-700 transition-all"
        >
          <Plus size={12} /> New Entry
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <HelpCircle size={14} className="text-blue-500" />
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Protocol Library</h3>
            </div>
            <div className="text-[6px] font-black text-slate-300 uppercase tracking-widest">Static Analysis Mode</div>
          </div>
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Search protocols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-200 text-[7px] font-black uppercase placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
            <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="space-y-2">
            {kbItems.length > 0 ? (
              kbItems
                .filter((i) => i.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all cursor-pointer"
                  >
                    <div>
                      <p className="text-[9px] font-black text-slate-900 uppercase">{item.title}</p>
                      <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.category}</p>
                    </div>
                    <ChevronRight size={10} className="text-slate-400 group-hover:text-slate-900 transition-colors" />
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Filter size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-[7px] font-black text-slate-400 uppercase">No protocols matched</p>
              </div>
            )}
          </div>
        </section>

        <section className="bg-[#0f172a] rounded-2xl p-5 border border-white/5 shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <MessageCircle size={14} className="text-teal-400" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Active Relay Tickets</h3>
            </div>
            <div className="text-[6px] font-black text-slate-300 uppercase">Live Relay</div>
          </div>
          {ticketsLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="animate-spin text-teal-600 w-6 h-6" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 group hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => navigate("/admin/activity")}
              >
                <CheckCircle size={20} className="text-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Relay Queue Synchronized</p>
              <p className="text-[6px] text-slate-600 uppercase tracking-widest mt-1">No client feedback received yet.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {tickets.map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-white uppercase truncate">{t.title || "Client feedback"}</p>
                      <p className="text-[7px] font-bold text-teal-400 uppercase tracking-widest mt-0.5 truncate">
                        {t.user_name || t.contact_name || "Unknown client"}
                        {t.project_name ? ` \u00b7 ${t.project_name}` : ""}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded text-[6px] font-black uppercase border ${
                        t.priority === "urgent"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : t.priority === "high"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : t.priority === "low"
                          ? "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                      }`}
                    >
                      {t.priority || "medium"}
                    </span>
                  </div>
                  <p className="text-[8px] text-slate-400 leading-relaxed mt-1.5 line-clamp-2">{t.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-[6px] font-black text-slate-400 uppercase border border-white/5 truncate">
                        {(t.feedback_type || "service_feedback").replace(/_/g, " ")}
                      </span>
                      <span
                        className={`text-[6px] font-black uppercase shrink-0 ${
                          t.status === "resolved" || t.status === "closed"
                            ? "text-emerald-400"
                            : t.status === "responded"
                            ? "text-teal-400"
                            : t.status === "reviewed"
                            ? "text-blue-400"
                            : "text-amber-400"
                        }`}
                      >
                        {t.status || "new"}
                      </span>
                    </div>
                    <span className="text-[6px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1 shrink-0">
                      <Clock size={8} />{t.created_at ? new Date(t.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-[#0f172a] rounded-2xl p-5 border border-white/5 shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ClipboardList size={14} className="text-blue-400" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Client Change Requests</h3>
            </div>
            <button
              onClick={loadChangeRequests}
              className="p-1.5 rounded bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-white/10 transition-all border border-white/5"
            >
              <RefreshCw size={10} />
            </button>
          </div>
          {crLoading ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <RefreshCw className="animate-spin text-blue-600 w-5 h-5" />
            </div>
          ) : changeRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center flex-1">
              <ClipboardList size={24} className="text-slate-500 mb-2" />
              <p className="text-[7px] font-black text-slate-500 uppercase">No change requests yet</p>
              <p className="text-[6px] text-slate-600 uppercase mt-1">Requests submitted via the client portal appear here, scoped to each account.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {changeRequests.map((cr) => (
                <div key={cr.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/20 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-white uppercase truncate">{cr.request_number}</p>
                      <p className="text-[7px] font-bold text-blue-300 uppercase tracking-widest mt-0.5 truncate">
                        {cr.requester_name || "Unknown client"} ({cr.requester_email || ""})
                      </p>
                      {cr.project_name ? (
                        <p className="text-[6px] text-teal-400 font-bold uppercase mt-0.5 truncate">Project: {cr.project_name}</p>
                      ) : null}
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded text-[6px] font-black uppercase border ${CR_COLORS[cr.status] || CR_COLORS.submitted}`}
                    >
                      {cr.status || "submitted"}
                    </span>
                  </div>
                  <p className="text-[8px] text-slate-300 leading-relaxed line-clamp-2 mb-2">
                    {cr.change_description || cr.reason_for_change || "No detail provided."}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      {cr.estimated_cost_impact && Number(cr.estimated_cost_impact) > 0 ? (
                        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[6px] font-black text-green-400 uppercase border border-white/5 truncate">
                          {Number(cr.estimated_cost_impact).toLocaleString()} impact
                        </span>
                      ) : null}
                      <span className="text-[6px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Clock size={8} />
                        {cr.created_at ? new Date(cr.created_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {(ACTION_MATRIX[cr.status] || []).includes("under_review") && (
                        <button
                          onClick={() => handleCrAction(cr.id, "under_review", cr.requester_name)}
                          disabled={actionBusy === cr.id}
                          className="px-1.5 py-0.5 rounded text-[6px] font-black uppercase border disabled:opacity-50 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                          title={`Mark under review \u2014 ${cr.requester_name || ""}`}
                        >
                          Review
                        </button>
                      )}
                      {(ACTION_MATRIX[cr.status] || []).includes("approved") && (
                        <button
                          onClick={() => handleCrAction(cr.id, "approved", cr.requester_name)}
                          disabled={actionBusy === cr.id}
                          className="px-1.5 py-0.5 rounded text-[6px] font-black uppercase border disabled:opacity-50 bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500/20"
                        >
                          Approve
                        </button>
                      )}
                      {(ACTION_MATRIX[cr.status] || []).includes("rejected") && (
                        <button
                          onClick={() => handleCrAction(cr.id, "rejected", cr.requester_name)}
                          disabled={actionBusy === cr.id}
                          className="px-1.5 py-0.5 rounded text-[6px] font-black uppercase border disabled:opacity-50 bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                        >
                          Reject
                        </button>
                      )}
                      {(ACTION_MATRIX[cr.status] || []).includes("cancelled") && (
                        <button
                          onClick={() => handleCrAction(cr.id, "cancelled", cr.requester_name)}
                          disabled={actionBusy === cr.id}
                          className="px-1.5 py-0.5 rounded text-[6px] font-black uppercase border disabled:opacity-50 bg-slate-500/10 text-slate-400 border-slate-500/20 hover:bg-slate-500/20"
                        >
                          Cancel
                        </button>
                      )}
                      {(ACTION_MATRIX[cr.status] || []).includes("implemented") && (
                        <button
                          onClick={() => handleCrAction(cr.id, "implemented", cr.requester_name)}
                          disabled={actionBusy === cr.id}
                          className="px-1.5 py-0.5 rounded text-[6px] font-black uppercase border disabled:opacity-50 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                        >
                          {actionBusy === cr.id ? <RefreshCw size={8} className="animate-spin" /> : "Implement"}
                        </button>
                      )}
                      <button
                        className="p-1 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                        title="Open full request detail"
                      >
                        <Eye size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-[#0f172a] rounded-2xl p-5 border border-white/5 shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <FileSignature size={14} className="text-purple-400" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Signature Requests</h3>
            </div>
            <button
              onClick={loadSignatures}
              className="p-1.5 rounded bg-white/5 text-slate-400 hover:text-purple-400 hover:bg-white/10 transition-all border border-white/5"
            >
              <RefreshCw size={10} />
            </button>
          </div>
          {sigLoading ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <RefreshCw className="animate-spin text-purple-600 w-5 h-5" />
            </div>
          ) : sigRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center flex-1">
              <FileSignature size={24} className="text-slate-500 mb-2" />
              <p className="text-[7px] font-black text-slate-500 uppercase">No signature requests yet</p>
              <p className="text-[6px] text-slate-600 uppercase mt-1">Documents awaiting client signatures appear here, scoped to each account.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {sigRequests.map((sig) => (
                <div key={sig.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/20 transition-all">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-[9px] font-black text-white uppercase truncate">{sig.document_title || `Document #${sig.document_id}`}</p>
                      <p className="text-[7px] font-bold text-purple-300 uppercase tracking-widest mt-0.5 truncate">
                        {sig.signer_name} ({sig.signer_email || ""})
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded text-[6px] font-black uppercase border ${SIG_COLORS[sig.signature_status] || SIG_COLORS.pending}`}
                    >
                      {sig.signature_status || "pending"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex flex-wrap items-center gap-2 min-w-0">
                      <span className="text-[6px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <Clock size={8} />req. {sig.created_at ? new Date(sig.created_at).toLocaleDateString() : ""}
                      </span>
                      {sig.signature_date ? (
                        <span className="text-[6px] font-bold text-emerald-400 uppercase">
                          signed {new Date(sig.signature_date).toLocaleTimeString()}
                        </span>
                      ) : null}
                      {sig.ip_address ? <span className="text-[6px] font-black text-slate-500">IP: {sig.ip_address}</span> : null}
                    </div>
                    <button className="p-1 rounded bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all border border-white/5" title="View document">
                      <Eye size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tighter Footer */}
        <footer className="pt-10 pb-20 flex flex-col items-center opacity-30">
          <p className="text-[6px] font-black text-slate-400 uppercase tracking-[0.8em]">Knowledge Relay Mode Active</p>
        </footer>
      </div>
    </div>
  );
}

export default Support;
