import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, User, FolderKanban, CheckSquare, Calculator, ArrowRight, RefreshCw, Mail, Phone, Globe, Shield } from "lucide-react";
import { apiCall } from "../../services/api";

/**
 * SearchResults - Detailed System Query Display
 * High-density workstation for viewing comprehensive search data.
 */
export function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      performDeepSearch();
    }
  }, [query]);

  const performDeepSearch = async () => {
    setLoading(true);
    try {
      // Deep search querying the system backbone
      const data = await apiCall(`/admin/search?q=${encodeURIComponent(query)}&deep=true`);
      if (data.success) {
        setResults(data.results || []);
      }
    } catch (e) {
      console.error("Deep Search Failure", e);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'user': return <User className="text-teal-400" size={20} />;
      case 'project': return <FolderKanban className="text-blue-400" size={20} />;
      case 'task': return <CheckSquare className="text-purple-400" size={20} />;
      case 'ledger': return <Calculator className="text-emerald-400" size={20} />;
      default: return <Search className="text-slate-400" size={20} />;
    }
  };

  const getDetailLink = (item) => {
    // The backend builds the correct deep-link per result type — trust it
    // (deriving from item.role produced invalid segments like /user).
    return item.link;
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans max-w-[1400px] mx-auto pb-20">
      {/* Header telemetry */}
      <div className="flex items-end justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">System Query Results</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[8px] mt-2">
            Parameter: <span className="text-teal-600">"{query}"</span> • Results: <span className="text-slate-900">{results.length} Nodes</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
           <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
           {loading ? 'Re-indexing...' : 'Index Current'}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
           <RefreshCw className="animate-spin text-teal-600 w-10 h-10 mb-4" />
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scanning System Backbone...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid gap-6">
          {results.map((item, idx) => (
            <div key={`${item.type}-${item.id}-${idx}`} className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden hover:border-teal-500/30 transition-all group">
              <div className="flex flex-col md:flex-row">
                {/* Visual Identity Block */}
                <div className="md:w-64 bg-slate-50 p-8 flex flex-col items-center justify-center border-r border-slate-100">
                   <div className="w-20 h-20 rounded-3xl bg-[#0f172a] flex items-center justify-center text-white mb-4 shadow-2xl">
                      {getIcon(item.type)}
                   </div>
                   <p className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">{item.type} Node</p>
                   <p className="text-[10px] font-black text-slate-900 uppercase text-center">{item.title}</p>
                </div>

                {/* Data Telemetry Block */}
                <div className="flex-1 p-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="space-y-4">
                         <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Core Attributes</h4>
                         <div className="space-y-3">
                            <div className="flex items-center gap-3">
                               <Mail size={12} className="text-slate-300" />
                               <span className="text-[10px] font-bold text-slate-700">{item.email || item.subtitle || 'N/A'}</span>
                            </div>
                            {item.phone && (
                               <div className="flex items-center gap-3">
                                  <Phone size={12} className="text-slate-300" />
                                  <span className="text-[10px] font-bold text-slate-700">{item.phone}</span>
                               </div>
                            )}
                            {item.role && (
                               <div className="flex items-center gap-3">
                                  <Shield size={12} className="text-slate-300" />
                                  <span className="text-[10px] font-black uppercase text-teal-600">{item.role}</span>
                               </div>
                            )}
                         </div>
                      </div>

                      <div className="space-y-4">
                         <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Operational Context</h4>
                         <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">
                            {item.description || item.metadata || "Node synchronized within the primary database matrix. No technical brief provided."}
                         </p>
                      </div>

                      <div className="flex flex-col justify-between">
                         <div className="space-y-4">
                            <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Status Node</h4>
                            <div className={`inline-flex px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${item.status === 'active' || item.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                               {item.status || (item.is_active ? 'Active' : 'Archived')}
                            </div>
                         </div>

                         <button
                            onClick={() => navigate(getDetailLink(item))}
                            className="mt-6 w-full py-3 bg-[#0f172a] text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all"
                         >
                            Initialize Detail View <ArrowRight size={14} className="text-teal-400" />
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-dashed border-slate-300 py-40 text-center">
           <Search size={48} className="mx-auto text-slate-200 mb-6" />
           <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Node Not Found</h3>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Query returned zero synchronized assets for "{query}"</p>
           <button onClick={() => navigate('/admin')} className="mt-8 px-8 py-3 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Return to Dashboard</button>
        </div>
      )}
    </div>
  );
}
