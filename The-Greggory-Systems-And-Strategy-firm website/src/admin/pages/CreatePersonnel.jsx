import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Users, X, RefreshCw, Send, Type, Briefcase, ImageIcon, Upload } from "lucide-react";
import { getApiUrl } from "../../services/api";

const normalizeBio = (rawContent) => {
  if (!rawContent || !rawContent.trim()) return "";
  const trimmed = rawContent.trim();
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  if (looksLikeHtml) return trimmed;
  return trimmed
    .split(/\n{2,}|\r\n\r\n/)
    .map((block) => `<p>${block.replace(/\n/g, "<br />")}</p>`)
    .join("");
};

export function CreatePersonnel() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    position: "",
    bio: "",
    image_url: "",
    image_base64: "",
    sort_order: 0,
    is_active: true,
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
      const payload = {
        ...form,
        bio: normalizeBio(form.bio),
        sort_order: form.sort_order === "" || form.sort_order == null ? 0 : Number(form.sort_order),
      };
      const response = await fetch(getApiUrl("/api/company-personnel"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) navigate("/admin/personnel");
      else {
        const d = await response.json().catch(() => ({}));
        window.alert(d?.message || "Failed to publish personnel node");
      }
    } catch (error) { console.error(error); window.alert(error.message); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-[500] flex flex-col overflow-hidden font-sans">
      <div className="bg-[#0f172a] px-6 py-3 flex items-center justify-between border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-500 border border-teal-500/20"><Users size={16} /></div>
          <div className="hidden sm:block">
            <h2 className="text-lg font-black text-white uppercase leading-none tracking-tighter">Personnel Deployment</h2>
            <p className="text-[6px] text-teal-500 font-black uppercase tracking-[0.4em] mt-1">Company Personnel Relay</p>
          </div>
        </div>
        <button onClick={() => navigate("/admin/personnel")} className="px-3 py-1.5 bg-rose-600/20 text-rose-500 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all border border-rose-600/20 flex items-center gap-2"><X size={12} /> Close Node</button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="max-w-[1200px] mx-auto p-6 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
              <section className="space-y-4 bg-white/2 p-5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-teal-500 border-b border-white/5 pb-2"><ImageIcon size={10} /><h4 className="text-[8px] font-black uppercase tracking-[0.2em]">Profile Image</h4></div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                <div onClick={() => fileInputRef.current?.click()} className={`aspect-[4/5] max-h-[320px] rounded-2xl border border-dashed border-white/10 bg-white/2 overflow-hidden cursor-pointer flex items-center justify-center transition-all duration-500 ${form.image_base64 || form.image_url ? "border-purple-500/30" : ""}`}>
                  {form.image_base64 || form.image_url ? (
                    <img src={form.image_base64 || form.image_url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center opacity-10"><Upload size={24} className="mx-auto" /><p className="text-[6px] font-black uppercase tracking-widest mt-1">Upload Photo</p></div>
                  )}
                </div>
                <div>
                  <label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Or Image URL (optional)</label>
                  <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value, image_base64: "" })} placeholder="https://... or /images/....jpg" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[9px] font-bold text-white outline-none focus:border-purple-500" />
                </div>
              </section>
            </div>

            <div className="space-y-6 lg:col-span-2">
              <section className="space-y-4 bg-white/2 p-5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-teal-500 border-b border-white/5 pb-2"><Type size={10} /><h4 className="text-[8px] font-black uppercase tracking-[0.2em]">Identity Node</h4></div>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Full Name</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Brian Mwanza" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[9px] font-bold text-white outline-none focus:border-teal-500" />
                  </div>
                  <div>
                    <label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Position</label>
                    <div className="relative"><Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600" size={10} /><input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required placeholder="e.g. Founder & Managing Director" className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-[9px] font-bold text-white outline-none focus:border-teal-500" /></div>
                  </div>
                  <div>
                    <label className="block text-[6px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Credentials & Records (bio)</label>
                    <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[9px] font-medium text-slate-300 outline-none h-[320px] resize-none leading-relaxed focus:border-teal-500" placeholder="Full credentials, history and records posted about this person... HTML is supported. Plain text will be formatted into readable paragraphs." />
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="lg:col-span-3 bg-[#0f172a] rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 mt-4">
            <div className="flex gap-6">
              <div className="bg-white/5 px-6 py-3 rounded-xl border border-white/10"><p className="text-[6px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Status</p><p className="text-lg font-black text-teal-400 leading-none">READY</p></div>
              <div className="bg-white/5 px-6 py-3 rounded-xl border border-white/10"><p className="text-[6px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Display Sort Order</p><input type="number" min="0" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className="w-16 bg-transparent text-lg font-black text-white outline-none" /></div>
            </div>
            <button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-500 text-white px-10 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl flex items-center gap-3 border border-teal-400/20 transition-all active:scale-95">
              {isSubmitting ? <RefreshCw className="animate-spin" size={12} /> : <Send size={12} />} Publish Node
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreatePersonnel;