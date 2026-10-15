import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Search, Download, Clock, FolderKanban,
  ChevronDown, User, Mail, Phone, AlertCircle
} from "lucide-react";
import { apiCall, downloadFile } from "../../services/api";
import { InlineLoader } from "../../components/Loading";

const STATUS_CHIP = {
  draft: "bg-slate-50 text-slate-500 border-slate-200",
  review: "bg-amber-50 text-amber-600 border-amber-200",
  approved: "bg-emerald-50 text-emerald-600 border-emerald-200",
  rejected: "bg-rose-50 text-rose-600 border-rose-200",
  archived: "bg-slate-100 text-slate-400 border-slate-200",
};

const TYPE_CHIP = {
  contract: "bg-blue-50 text-blue-600 border-blue-200",
  proposal: "bg-indigo-50 text-indigo-600 border-indigo-200",
  report: "bg-teal-50 text-teal-600 border-teal-200",
  invoice: "bg-amber-50 text-amber-600 border-amber-200",
  deliverable: "bg-emerald-50 text-emerald-600 border-emerald-200",
  legal: "bg-purple-50 text-purple-600 border-purple-200",
  technical: "bg-sky-50 text-sky-600 border-sky-200",
  other: "bg-slate-50 text-slate-500 border-slate-200",
};

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "—";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const formatDate = (v) => {
  if (!v) return "—";
  try { return new Date(v).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); } catch { return "—"; }
};

export function Records({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;
    apiCall("/api/admin/client-documents")
      .then((data) => {
        if (cancelled) return;
        setDocuments(data?.success ? data.documents || [] : []);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load records");
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(["all"]);
    documents.forEach((d) => { if (d.category) set.add(d.category); });
    return [...set];
  }, [documents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return documents.filter((d) => {
      const matchQ = !q ||
        (d.document_name || "").toLowerCase().includes(q) ||
        (d.client_name || "").toLowerCase().includes(q) ||
        (d.client_email || "").toLowerCase().includes(q) ||
        (d.client_phone || "").toLowerCase().includes(q) ||
        (d.project_name || "").toLowerCase().includes(q);
      const matchCat = categoryFilter === "all" || d.category === categoryFilter;
      return matchQ && matchCat;
    });
  }, [documents, query, categoryFilter]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((d) => {
      const cat = d.category || "Uncategorized";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(d);
    });
    return Object.keys(groups)
      .sort()
      .reduce((acc, cat) => {
        acc[cat] = groups[cat].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return acc;
      }, {});
  }, [filtered]);

  const handleDownload = async (doc) => {
    try {
      const blob = await downloadFile(`/api/documents/client_documents/${doc.id}/pdf`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const base = doc.document_name || `client_document_${doc.id}`;
      a.download = base.toLowerCase().endsWith(".pdf") ? base : `${base}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || "Download failed");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <InlineLoader tone="teal" label="Loading records…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="max-w-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-3" />
          <h3 className="text-sm font-black text-slate-900 mb-1">Records unavailable</h3>
          <p className="text-[10px] text-slate-500 mb-4">{error}</p>
          <button
            onClick={() => { setError(null); setLoading(true); window.location.reload(); }}
            className="px-4 py-2 rounded-xl text-[10px] font-bold text-white bg-teal-600 hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Client Records</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
            All generated client documents — search by receiver name, phone, email or project.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full lg:w-48 pl-10 pr-4 py-2 rounded-xl text-[10px] font-bold border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="relative w-full lg:w-72 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search receiver, phone, email or project…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-xl text-[10px] font-bold border border-slate-300 bg-white focus:ring-2 focus:ring-teal-500 outline-none"
            />
            {query.trim() && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500"
                aria-label="Clear search"
              >
                <ChevronDown size={10} rotate={90} />
              </button>
            )}
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="px-4 py-2 rounded-xl text-[10px] font-bold text-white bg-[#0f172a] hover:bg-teal-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border border-slate-200 bg-white">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Documents</p>
          <p className="text-sm font-black text-slate-900">{documents.length}</p>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-white">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Matching Results</p>
          <p className="text-sm font-black text-slate-900">{filtered.length}</p>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-white">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Categories</p>
          <p className="text-sm font-black text-slate-900">{categories.length - 1}</p>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-white">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">With Files</p>
          <p className="text-sm font-black text-slate-900">
            {documents.filter((d) => d.file_path || d.file_data).length}
          </p>
        </div>
      </div>

      {/* Document groups by category */}
      <div className="space-y-5">
        {Object.keys(grouped).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FolderKanban className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              No records match your search
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <section key={category} className="border border-slate-200 rounded-2xl bg-white overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-teal-600" />
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{category}</p>
                </div>
                <p className="text-[9px] font-bold text-slate-500">{items.length} document{item.length !== 1 ? "s" : ""}</p>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((doc) => (
                  <div key={doc.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[8px] font-bold border ${TYPE_CHIP[doc.document_type] || TYPE_CHIP.other}`}
                        >
                          {doc.document_type}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[8px] font-bold border ${STATUS_CHIP[doc.status] || STATUS_CHIP.draft}`}
                        >
                          {doc.status}
                        </span>
                      </div>
                      <p className="text-sm font-black text-slate-900 truncate" title={doc.document_name}>
                        {doc.document_name}
                      </p>
                      <p className="text-[9px] text-slate-500 truncate">
                        <User className="inline h-3.5 w-3.5 mr-1 text-slate-400" />
                        {doc.client_name || "—"}
                        {doc.project_name ? ` · <span className="font-bold text-teal-700">{doc.project_name}</span>` : ""}
                      </p>
                      <p className="text-[9px] text-slate-500 truncate">
                        <Mail className="inline h-3.5 w-3.5 mr-1 text-slate-400" />
                        {doc.client_email || "—"} &nbsp;
                        <Phone className="inline h-3.5 w-3.5 mr-1 text-slate-400" />
                        {doc.client_phone || "—"}
                      </p>
                      <p className="text-[9px] text-slate-400 font-mono mt-1">
                        <Clock className="inline h-3.5 w-3.5 mr-1 text-slate-400" />
                        v{doc.version_number} &nbsp;·&nbsp; {formatDate(doc.created_at)}
                        {doc.file_size ? ` &nbsp;·&nbsp; ${formatBytes(doc.file_size)}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.file_path || doc.file_data ? (
                        <button
                          onClick={() => handleDownload(doc)}
                          title="Download PDF"
                          className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      ) : (
                        <div className="p-2 text-slate-300 rounded-lg" title="No file attached">
                          <Download className="h-5 w-5 opacity-50 grayscale" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}