import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { getApiUrl } from "../../services/api";

/**
 * Content Management System - Blog Central
 * Optimized with compact blocks and tiny typography.
 * Clicking a node opens a dedicated full-screen preview node.
 */
export function Content({ user }) {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl("/api/blog-articles"));
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.articles || []);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); // Prevent opening preview when deleting
    if (!window.confirm("Terminate this node?")) return;
    const executeDelete = async () => {
      try {
        const response = await fetch(getApiUrl(`/api/blog-articles/${id}`), { method: "DELETE" });
        if (response.ok) setBlogs(blogs.filter((b) => b.id !== id));
      } catch (e) { console.error(e); }
    };
    executeDelete();
  };

  const filteredBlogs = blogs.filter((b) => (b.title || "").toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const paginatedBlogs = filteredBlogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Blog Management</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Global Relay Control</p>
        </div>
        <button onClick={() => navigate("/admin/content/create")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white font-black text-[8px] uppercase tracking-widest shadow-lg hover:bg-teal-700 transition-all border border-teal-400/20"><Plus size={12} /> New Post</button>
      </div>

      <div className="bg-[#0f172a] rounded-2xl p-4 border border-white/10 shadow-xl flex justify-end items-center">
        <div className="px-3 text-[7px] font-black uppercase text-slate-500 tracking-widest whitespace-nowrap">Active Nodes: {blogs.length}</div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><RefreshCw className="animate-spin text-teal-600 w-6 h-6" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {paginatedBlogs.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/admin/content/preview/${item.id}`)}
              className="bg-white rounded-2xl p-3 border border-slate-100 shadow-md hover:shadow-xl hover:scale-[1.03] transition-all group flex flex-col h-full cursor-pointer"
            >
              <div className="aspect-[4/3] bg-slate-100 rounded-xl mb-3 overflow-hidden border border-slate-50 relative">
                 {item.image_url ? (
                   <img src={item.image_url} alt="" className="w-full h-full object-cover transition-all duration-500" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-200"><FileText size={20} /></div>
                 )}
                 <div className="absolute top-1.5 left-1.5 bg-[#0f172a]/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded-md text-[5px] font-black uppercase tracking-widest">{item.category || "General"}</div>
              </div>

              <h4 className="font-black text-slate-900 leading-tight mb-4 text-[10px] uppercase tracking-tight line-clamp-3">{item.title}</h4>

              <div className="mt-auto pt-2 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                   <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[6px] font-black text-slate-400 uppercase">{(item.author || "A")[0]}</div>
                   <span className="text-[6px] font-black text-slate-400 uppercase tracking-widest truncate w-16">{item.author || "Admin"}</span>
                </div>
                <button onClick={(e) => handleDelete(e, item.id)} className="p-1.5 bg-rose-50 text-rose-500 rounded-md hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={10} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 pb-12">
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 shadow-sm transition-all"><ChevronLeft size={14} /></button>
          <div className="px-4 py-2 bg-[#0f172a] rounded-xl text-[8px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">Node {currentPage} / {totalPages}</div>
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 shadow-sm transition-all"><ChevronRight size={14} /></button>
        </div>
      )}
    </div>
  );
}

export default Content;
