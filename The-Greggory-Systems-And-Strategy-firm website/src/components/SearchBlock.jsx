import React, { useState, useEffect, useRef } from "react";
import { Search, RefreshCw, X, ArrowRight, Globe, FolderKanban, CheckSquare, Calculator, User } from "lucide-react";
import { apiCall } from "../services/api";
import { useTheme } from "../context/ThemeContext";

/**
 * SearchBlock — reusable, system-wide search input + dropdown.
 *
 * Props
 *  - endpoint        : API path ("/api/admin/search" | "/api/users/search")
 *  - resultsBase     : full results route ("/admin/search" | "/client-search")
 *  - placeholder     : input placeholder
 *  - variant         : "admin" (dark header) | "client" (themed)
 *  - minChars        : trigger length (default 2)
 */
const ICON_MAP = { user: User, project: FolderKanban, task: CheckSquare, ledger: Calculator };

export default function SearchBlock({
  endpoint = "/api/admin/search",
  resultsBase = "/admin/search",
  placeholder = "Query system database…",
  variant = "admin",
  minChars = 2,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  const { darkMode } = useTheme();

  // Click-away to close
  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShow(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Debounced fetch
  useEffect(() => {
    const id = setTimeout(async () => {
      const trimmed = query.trim();
      if (trimmed.length < minChars) {
        setResults([]);
        setShow(false);
        return;
      }
      setLoading(true);
      setError(null);
      setShow(true);
      try {
        const data = await apiCall(`${endpoint}?q=${encodeURIComponent(trimmed)}`);
        if (data?.success) setResults(data.results || []);
        else setError(data?.message || "Search unavailable");
      } catch (e) {
        console.error("[SearchBlock] fetch error:", e);
        setError("Search unavailable");
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [query, endpoint, minChars]);

  const onKeyDown = (e) => {
    if (e.key === "Enter" && query.trim().length >= minChars) {
      setShow(false);
      window.location.href = `${resultsBase}?q=${encodeURIComponent(query.trim())}`;
    } else if (e.key === "Escape") {
      setShow(false);
      inputRef.current?.blur();
    }
  };

  const pickSuggestion = (item) => {
    setShow(false);
    setQuery("");
    window.location.href = item?.link || `${resultsBase}?q=${encodeURIComponent(query.trim())}`;
  };

  const IconFor = (type) => ICON_MAP[type] || Search;
  const isAdminTheme = variant === "admin";

  return (
    <div className="relative" ref={wrapRef}>
      <div className="relative">
        <Search
          className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
            isAdminTheme ? "text-slate-400" : darkMode ? "text-slate-400" : "text-slate-500"
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => query.trim().length >= minChars && setShow(true)}
          placeholder={placeholder}
          className={
            isAdminTheme
              ? "w-full pl-10 pr-8 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[11px] font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder-slate-500"
              : darkMode
              ? "w-full pl-10 pr-8 py-1.5 rounded-xl bg-slate-800 border border-slate-600 text-white text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder-slate-500"
              : "w-full pl-10 pr-8 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder-slate-400"
          }
        />
        {loading && <RefreshCw className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-teal-500" />}
        {!loading && query && (
          <button
            onClick={() => { setQuery(""); setResults([]); setShow(false); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
            aria-label="Clear search"
          >
            <X size={10} />
          </button>
        )}
      </div>

      {show && (
        <div
          className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl border overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-150 ${
            isAdminTheme ? "bg-[#1e293b] border-white/10" : darkMode ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200"
          }`}
        >
          {error ? (
            <div className="p-4 text-[9px] font-black uppercase tracking-widest text-rose-400">{error}</div>
          ) : results.length > 0 ? (
            <div className="max-h-[320px] overflow-y-auto custom-scrollbar p-1">
              {results.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => pickSuggestion(item)}
                  className={`w-full flex items-center gap-3 p-3 text-left rounded-lg transition-all group ${
                    isAdminTheme ? "hover:bg-white/5 text-slate-200" : darkMode ? "hover:bg-slate-700 text-slate-200" : "hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isAdminTheme ? "bg-teal-500/10 text-teal-400" : "bg-teal-500/10 text-teal-600"}`}>
                    <IconFor type={item.type} size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-bold text-[11px] leading-tight truncate ${isAdminTheme || darkMode ? "text-white" : "text-slate-900"}`}>
                      {item.title}
                    </p>
                    <p className="text-[8px] font-black uppercase text-slate-500">{item.subtitle}</p>
                  </div>
                  <ArrowRight size={12} className={isAdminTheme ? "text-slate-500" : darkMode ? "text-slate-500" : "text-slate-400"} />
                </button>
              ))}
              <div
                className={`flex items-center justify-center gap-1 p-2 text-[8px] font-black uppercase cursor-pointer ${isAdminTheme ? "text-slate-500 hover:text-teal-400" : darkMode ? "text-slate-500 hover:text-teal-400" : "text-slate-500 hover:text-teal-600"}`}
                onClick={() => { setShow(false); window.location.href = `${resultsBase}?q=${encodeURIComponent(query.trim())}`; }}
              >
                View all results <Globe size={10} />
              </div>
            </div>
          ) : query.trim().length >= minChars ? (
            <div className="p-4 text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">No Nodes Found</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
