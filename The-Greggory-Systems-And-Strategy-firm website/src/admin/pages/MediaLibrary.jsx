import React, { useState, useEffect } from "react";
import { apiCall } from "../../services/api";
import { Upload, Image, FileText, Trash2, Search, RefreshCw } from "lucide-react";

export function MediaLibrary() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchImages(); }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/api/images");
      setImages(Array.isArray(data) ? data : (data.images || []));
    } catch (e) { console.error("Failed to fetch images:", e); }
    finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      await apiCall("/api/images", { method: "POST", body: formData });
      fetchImages();
    } catch (e) { console.error("Upload failed:", e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await apiCall(`/api/images/${id}`, { method: "DELETE" });
      fetchImages();
    } catch (e) { console.error("Delete failed:", e); }
  };

  const filtered = images.filter(img =>
    (img.filename || img.name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <RefreshCw className="animate-spin text-teal-600 w-8 h-8" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Media Library</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Upload & manage assets</p>
        </div>
        <label className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest cursor-pointer hover:bg-teal-700">
          <Upload size={12} /> Upload File
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      <div className="px-4 py-2.5 bg-slate-100 rounded-xl flex items-center gap-2">
        <Search size={12} className="text-slate-400" />
        <input type="text" placeholder="Search files..." value={search} onChange={e => setSearch(e.target.value)}
          className="bg-transparent text-[8px] font-bold text-slate-700 w-full outline-none" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
          <Image size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No media found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map(img => (
            <div key={img.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden group">
              <div className="aspect-square bg-slate-100 flex items-center justify-center">
                {img.url || img.data ? (
                  <img src={img.url || `data:${img.content_type};base64,${img.data}`} alt={img.filename} className="w-full h-full object-cover" />
                ) : (
                  <FileText size={24} className="text-slate-300" />
                )}
              </div>
              <div className="p-2 flex items-center justify-between">
                <p className="text-[7px] font-bold text-slate-600 truncate">{img.filename || img.name || `File #${img.id}`}</p>
                <button onClick={() => handleDelete(img.id)} className="p-1 rounded hover:bg-rose-50 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100">
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
