import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { apiCall } from "../../services/api";

/**
 * Personnel Management - Company Personnel Central
 * Same workflow as Blog Management but a separate entity,
 * displayed on the public About page (never in the blog feed).
 */
export function Personnel() {
  const navigate = useNavigate();
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/company-personnel");
      if (data.success) {
        setPersonnel(data.personnel || []);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Terminate this personnel node?")) return;
    try {
      const res = await apiCall(`/company-personnel/${id}`, { method: "DELETE" });
      if (res.success) setPersonnel(personnel.filter((p) => p.id !== id));
    } catch (e) { console.error(e); }
  };

  const filtered = personnel.filter((p) =>
    ((p.name || "") + " " + (p.position || "")).toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Personnel Management</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Company Personnel Relay</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Query personnel..."
              className="pl-7 pr-3 py-1.5 bg-white border border-slate-100 rounded-xl text-[8px] font-bold text-slate-600 outline-none focus:border-teal-500/50 w-44"
            />
          </div>
          <button
            onClick={() => navigate("/admin/personnel/create")}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 transition-all"
          >
            <Plus size={12} /> New Node
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><RefreshCw className="animate-spin text-teal-500" size={20} /></div>
      ) : paginated.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
          <Users className="w-10 h-10 text-slate-200 mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No personnel nodes found</p>
          <button onClick={() => navigate("/admin/personnel/create")} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest">Create the first profile</button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginated.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/admin/personnel/preview/${item.id}`)}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl group cursor-pointer transition-all"
              >
                <div className="relative aspect-[4/5] bg-slate-50 overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-teal-50 text-4xl font-black text-teal-600">{item.name?.charAt(0) || "P"}</div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-black text-slate-900 truncate">{item.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[7px] font-black uppercase tracking-widest text-teal-600 truncate">{item.position}</p>
                    <button onClick={(e) => handleDelete(e, item.id)} className="p-1.5 bg-rose-50 text-rose-500 rounded-md hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={10} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages >1 && (
            <div className="flex items-center justify-center gap-2 pt-6 pb-12">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p -1))} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 shadow-sm transition-all">Prev</button>
              <div className="px-4 py-2 bg-[#0f172a] rounded-xl text-[8px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">Node {currentPage} / {totalPages}</div>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p +1))} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 shadow-sm transition-all">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Personnel;