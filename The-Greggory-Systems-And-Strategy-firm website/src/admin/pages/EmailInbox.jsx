import React, { useState, useEffect } from "react";
import { apiCall } from "../../services/api";
import { Mail, MessageSquare, RefreshCw, Send, Clock } from "lucide-react";

export function EmailInbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => { fetchMessages(); }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/api/contact-forms");
      const items = Array.isArray(data) ? data : (data.contacts || data.data || []);
      setMessages(items);
    } catch (e) { console.error("Failed to fetch messages:", e); }
    finally { setLoading(false); }
  };

  const filtered = tab === "all" ? messages : messages.filter(m => m.status === tab);

  if (loading) return (
    <div className="flex items-center justify-center py-40">
      <RefreshCw className="animate-spin text-teal-600 w-8 h-8" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Messages</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Contact form submissions</p>
        </div>
        <button onClick={fetchMessages} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><RefreshCw size={14} /></button>
      </div>

      <div className="flex gap-1 border-b border-slate-100">
        {["all", "new", "read", "archived"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-[8px] font-black uppercase tracking-widest border-b-2 transition-all ${
              tab === t ? "border-teal-600 text-teal-600" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}>{t}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center">
          <Mail size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No messages</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(m => (
            <div key={m.id} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4 hover:bg-slate-50">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.status === "new" ? "bg-teal-50 text-teal-600" : "bg-slate-100 text-slate-400"}`}>
                <Mail size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-slate-900 truncate">{m.name || m.email || "Unknown"}</p>
                <p className="text-[7px] text-slate-500 truncate">{m.message || m.subject || "No message"}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[6px] text-slate-400">{m.created_at ? new Date(m.created_at).toLocaleDateString() : ""}</p>
                <span className={`text-[5px] font-black uppercase px-1.5 py-0.5 rounded-full ${
                  m.status === "new" ? "bg-teal-50 text-teal-600" :
                  m.status === "read" ? "bg-slate-100 text-slate-500" : "bg-amber-50 text-amber-600"
                }`}>{m.status || "new"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
