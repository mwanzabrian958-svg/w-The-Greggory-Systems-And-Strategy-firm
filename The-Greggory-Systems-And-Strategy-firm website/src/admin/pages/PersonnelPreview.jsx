import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, RefreshCw, Briefcase, ChevronLeft } from "lucide-react";
import { getApiUrl } from "../../services/api";

const normalizeBio = (raw) => {
  if (!raw || !raw.trim()) return "";
  const trimmed = raw.trim();
  if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) return trimmed;
  return trimmed.split(/\n{2,}|\r\n\r\n/).map((b) => `<p>${b.replace(/\n/g, "<br />")}</p>`).join("");
};

export function PersonnelPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const fetchPerson = async () => {
      try {
        const response = await fetch(getApiUrl(`/api/company-personnel/${id}`));
        if (response.ok) {
          const data = await response.json();
          setPerson(data.personnel);
        }
      } catch (error) {
        console.error("Failed to fetch personnel node:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPerson();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex items-center justify-center"><RefreshCw className="animate-spin text-teal-500" size={24} /></div>
    );
  }

  if (!person) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center text-white p-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-4">Node Not Found</p>
        <button onClick={() => navigate("/admin/personnel")} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"><ChevronLeft size={12} /> Return to Relay</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#020617] z-[500] flex flex-col overflow-hidden font-sans">
      <div className="bg-[#0f172a] px-6 py-3 flex items-center justify-between border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-teal-500/10 rounded-lg flex items-center justify-center text-teal-500 border border-teal-500/20"><Briefcase size={16} /></div>
          <div className="hidden sm:block">
            <h2 className="text-lg font-black text-white uppercase leading-none tracking-tighter">Personnel Record Review</h2>
            <p className="text-[6px] text-teal-500 font-black uppercase tracking-[0.4em] mt-1">Company Personnel Relay View</p>
          </div>
        </div>
        <button onClick={() => navigate("/admin/personnel")} className="px-3 py-1.5 bg-rose-600/20 text-rose-500 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all border border-rose-600/20 flex items-center gap-2"><X size={12} /> Close</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8 lg:p-12">
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="w-44 h-52 md:w-56 md:h-64 rounded-[28px] overflow-hidden shadow-2xl bg-white/2 border border-white/10 flex-shrink-0">
              {person.image_url ? (
                <img src={person.image_url} alt={person.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-teal-500/10 text-6xl font-black text-teal-500">{person.name?.charAt(0) || "P"}</div>
              )}
            </div>
            <div className="pt-2 sm:pt-8 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-400">Firm Personnel Profile</span>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none uppercase">{person.name}</h1>
              <p className="text-sm font-bold text-teal-500 uppercase tracking-[0.2em]">{person.position}</p>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-teal-500/40 via-white/10 to-transparent my-10" />

          <div className="prose prose-invert prose-sm max-w-none">
            {person.bio ? (
              <div className="blog-preview-content text-[11px] leading-relaxed text-slate-300 font-medium" dangerouslySetInnerHTML={{ __html: normalizeBio(person.bio) }} />
            ) : (
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">No credentials have been published for this profile yet.</p>
            )}
          </div>

          <div className="pt-10 flex flex-col items-center">
            <div className="w-px h-8 bg-gradient-to-b from-teal-500/50 to-transparent mb-3" />
            <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.8em]">End of Record</p>
          </div>
        </div>
      </div>

      <footer className="bg-[#0f172a] border-t border-white/5 p-6 flex justify-between items-center flex-shrink-0">
        <p className="text-[7px] font-black text-slate-500 uppercase tracking-[0.4em]">Property of Greggory Systems & Strategy Firm © {new Date().getFullYear()}</p>
        <button onClick={() => navigate("/admin/personnel")} className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/10 transition-all">Back to Relay</button>
      </footer>
    </div>
  );
}

export default PersonnelPreview;