import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, User, FolderKanban, CheckSquare, Calculator, ArrowRight, RefreshCw, Mail, Globe } from "lucide-react";
import { apiCall } from "../services/api";
import { useTheme } from "../context/ThemeContext";

/**
 * ClientSearchResults — themed deep results page for client-side global search.
 * Mirrors the admin SearchResults layout, backed by /api/users/search.
 */
export function ClientSearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (query) performDeepSearch(); }, [query]);

  const performDeepSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const data = await apiCall(`/api/users/search?q=${encodeURIComponent(query)}&deep=true`);
      if (data?.success) setResults(data.results || []);
    } catch (e) {
      console.error("[CLIENT SEARCH RESULTS] Failure:", e);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "user": return <User className="text-teal-400" size={20} />;
      case "project": return <FolderKanban className="text-blue-400" size={20} />;
      case "task": return <CheckSquare className="text-purple-400" size={20} />;
      case "ledger": return <Calculator className="text-emerald-400" size={20} />;
      default: return <Search className="text-slate-400" size={20} />;
    }
  };

  const getDetailLink = (item) => {
    // The backend builds the correct deep-link per result type — trust it.
    return item?.link || "/client-portal";
  };

  return (
    <div className={`min-h-screen pt-10 px-4 pb-8 font-sans transition-colors duration-300 ${darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"}`}>
      <div className="max-w-6xl mx-auto space-y-4 animate-fade-in">

        {/* Header telemetry */}
        <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">System Query Results</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] text-[8px] mt-2 flex items-center gap-2">
              <Globe size={10} className="text-teal-500" />
              Parameter: <span className="text-teal-600 dark:text-teal-400">&quot;{query}&quot;</span> • Results: <span className="text-slate-900 dark:text-white">{results.length} Nodes</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
            <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
            {loading ? "Re-indexing..." : "Index Current"}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <RefreshCw className="animate-spin text-teal-600 dark:text-teal-400 w-8 h-8 mb-4" />
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scanning Your Workspace...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid gap-3">
            {results.map((item, idx) => (
              <div
                key={`${item.type}-${item.id}-${idx}`}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 hover:border-teal-500/30 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4">
                  {/* Identity block */}
                  <div className="p-2.5 rounded-xl bg-teal-500/10 shrink-0">
                    {getIcon(item.type)}
                  </div>

                  {/* Core info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[11px] font-black uppercase tracking-tight text-slate-900 dark:text-white truncate">{item.title}</h3>
                      <span className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[7px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{item.type}</span>
                      {item.status && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${String(item.status).toLowerCase() === "completed" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-sky-500/10 text-sky-600 dark:text-sky-400"}`}>
                          {item.status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Mail size={10} className="text-slate-300 dark:text-slate-600 shrink-0" />
                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 truncate">{item.subtitle || "N/A"}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => navigate(getDetailLink(item))}
                    className="shrink-0 px-4 py-2 bg-slate-900 dark:bg-teal-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-teal-600 dark:hover:bg-teal-500 transition-all"
                  >
                    Open <ArrowRight size={11} className="text-teal-400 dark:text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-600 py-28 text-center">
            <Search size={40} className="mx-auto text-slate-200 dark:text-slate-600 mb-5" />
            <h3 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">Node Not Found</h3>
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-2">
              Query returned zero synchronized assets for &quot;{query}&quot;
            </p>
            <button
              onClick={() => navigate("/client-portal")}
              className="mt-7 px-7 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              Return to Portal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
