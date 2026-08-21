import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, X, RefreshCw, Send, Type, Tag, Clock, User, ImageIcon, Link, Upload } from "lucide-react";
import { getApiUrl, API_BASE_URL } from "../../services/api";

/**
 * CreateBlog - Standalone Full-Screen Post Page
 * Optimized with compact containers and technical-grade tiny typography.
 * Excerpt field removed as per user instruction.
 */
const normalizeBlogContent = (rawContent) => {
  if (!rawContent || !rawContent.trim()) return "";

  const trimmed = rawContent.trim();
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);

  if (looksLikeHtml) {
    return trimmed;
  }

  return trimmed
    .split(/\n{2,}|\r\n\r\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${block.replace(/\n/g, '<br />')}</p>`)
    .join("");
};

export function CreateBlog() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    author: "Administrator",
    category: "Strategic Systems",
    read_time: "5 min",
    image_url: "",
    image_base64: "",
    is_published: true
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, image_base64: reader.result, image_url: "" });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const normalizedContent = normalizeBlogContent(form.content);
      const payload = {
        ...form,
        content: normalizedContent,
        excerpt: normalizedContent.replace(/<[^>]+>/g, "").substring(0, 150).replace(/[#*`]/g, "") + "..."
      };
      const response = await fetch(`${API_BASE_URL}/blog-articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) navigate("/admin/content");
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-[500] flex flex-col overflow-hidden font-sans">
      <div className="bg-[#0f172a] px-6 py-3 flex items-center justify-between border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-500 border border-teal-500/20"><FileText size={16} /></div>
          <div>
            <h2 className="text-lg font-black text-white uppercase leading-none tracking-tighter">Manuscript Deployment</h2>
            <p className="text-[6px] text-teal-500 font-black uppercase tracking-[0.4em] mt-1">Strategic Relay</p>
          </div>
        </div>
        <button onClick={() => navigate("/admin/content")} className="px-3 py-1.5 bg-rose-600/20 text-rose-500 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all border border-rose-600/20 flex items-center gap-2"><X size={12} /> Abort</button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-slate-950 p-6 pb-24">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* COMPACT VISUAL ASSET RELAY */}
          <section className="bg-white/2 p-5 rounded-2xl border border-white/5 shadow-2xl">
            <div className="flex items-center gap-2 text-purple-500 border-b border-white/5 pb-2 mb-4">
              <ImageIcon size={10} />
              <h4 className="text-[8px] font-black uppercase tracking-[0.2em]">Visual Asset Relay</h4>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Remote Link</label>
                  <div className="relative">
                    <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" size={10} />
                    <input type="url" placeholder="https://..." value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value, image_base64: "" })} className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-[9px] font-bold text-white outline-none focus:border-purple-500" />
                  </div>
                </div>
                <div className="relative flex justify-center items-center py-1"><div className="w-full border-t border-white/5"></div><span className="absolute bg-slate-950 px-2 text-[5px] font-black text-slate-700">OR</span></div>
                <div>
                   <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                   <button type="button" onClick={() => fileInputRef.current.click()} className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg py-2.5 transition-all"><Upload size={12} className="text-purple-500" /><span className="text-[8px] font-black uppercase tracking-widest">Local Storage</span></button>
                </div>
              </div>
              <div className={`aspect-video max-h-[140px] rounded-2xl border border-dashed border-white/10 bg-white/2 overflow-hidden transition-all duration-500 flex items-center justify-center ${form.image_url || form.image_base64 ? 'border-purple-500/30' : ''}`}>
                 {form.image_url || form.image_base64 ? <img src={form.image_url || form.image_base64} alt="Preview" className="w-full h-full object-cover transition-all duration-500" /> : <div className="text-center opacity-10"><ImageIcon size={24} className="mx-auto" /><p className="text-[6px] font-black uppercase tracking-widest mt-1">Awaiting Node</p></div>}
              </div>
            </div>
          </section>

          {/* COMPACT MANUSCRIPT DATA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="space-y-4 bg-white/2 p-5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-teal-500 border-b border-white/5 pb-2"><Type size={10} /><h4 className="text-[8px] font-black uppercase tracking-[0.2em]">Manuscript Data</h4></div>
                <div className="grid gap-4">
                  <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Primary Title</label><input type="text" placeholder="Strategic title..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-bold text-white outline-none focus:border-teal-500" required /></div>
                  <div>
                    <label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Master Content</label>
                    <textarea
                      placeholder="Write plain text or paste HTML like <p>...</p> <h2>...</h2>"
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[9px] font-medium text-slate-300 outline-none h-[350px] resize-none leading-relaxed focus:border-teal-500"
                      required
                    />
                    <p className="mt-2 text-[6px] font-black uppercase tracking-[0.25em] text-slate-500">HTML is supported. Plain text will be formatted into readable paragraphs.</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
               <section className="space-y-4 bg-white/2 p-5 rounded-2xl border border-white/5 h-full">
                  <div className="flex items-center gap-2 text-blue-500 border-b border-white/5 pb-2"><Tag size={10} /><h4 className="text-[8px] font-black uppercase tracking-[0.2em]">Telemetry</h4></div>
                  <div className="grid gap-4">
                    <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Classification</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[9px] font-bold text-white outline-none focus:border-blue-500"><option value="Strategic Systems" className="bg-[#0f172a]">Strategic Systems</option><option value="Operational Excellence" className="bg-[#0f172a]">Operational Excellence</option><option value="Financial Intelligence" className="bg-[#0f172a]">Financial Intelligence</option><option value="Tech Insights" className="bg-[#0f172a]">Tech Insights</option></select></div>
                    <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Read Time</label><div className="relative"><Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" size={10} /><input type="text" value={form.read_time} onChange={(e) => setForm({ ...form, read_time: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-[9px] font-bold text-white outline-none" /></div></div>
                    <div><label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Author Node</label><div className="relative"><User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" size={10} /><input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-[9px] font-bold text-white outline-none" /></div></div>
                  </div>
               </section>
            </div>
          </div>

          {/* COMPACT COMMITMENT BLOCK */}
          <div className="lg:col-span-3 bg-[#0f172a] rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 mt-4">
            <div className="flex gap-6"><div className="bg-white/5 px-6 py-3 rounded-xl border border-white/10"><p className="text-[6px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Status</p><p className="text-lg font-black text-teal-400 leading-none">READY</p></div></div>
            <button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-500 text-white px-10 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-3 border border-teal-400/20 transition-all active:scale-95">
              {isSubmitting ? <RefreshCw className="animate-spin" size={12} /> : <Send size={12} />} Broadcast
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
