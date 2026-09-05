import React, { useEffect, useState } from "react";
import { MessageSquare, Mail, Phone, Send, Plus, Search, Clock, RefreshCw, ChevronRight } from "lucide-react";
import { getApiUrl, apiCall } from "../../services/api";

const MESSAGES = [
  { id: 1, sender: "Amaka Wanjiru", message: "Grant applications reviewed and approved.", time: "2 hours ago", channel: "email", unread: false },
  { id: 2, sender: "David Otieno", message: "Website update completed. Ready for deployment.", time: "4 hours ago", channel: "chat", unread: true },
  { id: 3, sender: "Susan Njeri", message: "Volunteer onboarding forms updated.", time: "Yesterday", channel: "email", unread: false },
];

const ANNOUNCEMENTS = [
  { id: 1, title: "Monthly Board Meeting", date: "May 20, 2024", priority: "high" },
  { id: 2, title: "Q2 Financial Results Review", date: "May 25, 2024", priority: "medium" },
  { id: 3, title: "Donor Appreciation Gala", date: "June 1, 2024", priority: "low" },
];

/**
 * Communication Hub - Professional Relay Node
 * Distinct from Blog Management: Handles private client/team relay.
 * Optimized with compact containers and micro-typography.
 */
export function Communication() {
  const [activeTab, setActiveTab] = useState("messages");
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackPriority, setFeedbackPriority] = useState("medium");
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl("/api/users"));
        if (response.ok) {
          const data = await response.json();
          setClients(data.users || []);
          if (data.users?.length) {
            setSelectedClientId(String(data.users[0].id));
          }
        }
      } catch (error) {
        console.error("Failed to load clients", error);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  const handleSendFeedback = async (event) => {
    event.preventDefault();
    if (!selectedClientId || !feedbackMessage.trim()) {
      setFeedbackStatus({ type: "error", message: "Incomplete Telemetry: Select client and message." });
      return;
    }

    setIsSending(true);
    setFeedbackStatus(null);

    try {
      const data = await apiCall("/api/admin/client-feedback", {
        method: "POST",
        body: JSON.stringify({
          userId: selectedClientId,
          title: feedbackTitle.trim() || "Direct relay from command node",
          message: feedbackMessage.trim(),
          priority: feedbackPriority,
        }),
      });
      if (!data.success) throw new Error(data.message || "Relay Failure");

      setFeedbackStatus({ type: "success", message: "Data successfully posted to Client Portal." });
      setFeedbackTitle("");
      setFeedbackMessage("");
    } catch (error) {
      setFeedbackStatus({ type: "error", message: error.message });
    } finally {
      setIsSending(false);
    }
  };

  if (loading && clients.length === 0) return <div className="flex items-center justify-center py-20"><RefreshCw className="animate-spin text-teal-600 w-6 h-6" /></div>;

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Communication Hub</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[7px] mt-0.5">Strategic Client & Team Relay</p>
        </div>
        <div className="flex gap-2">
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5"><div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div> Secure Relay Active</span>
        </div>
      </div>

      {/* Tighter Channel Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Unread Messages", value: "12", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Email Pending", value: "05", icon: Mail, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Active Nodes", value: "08", icon: Phone, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((chan) => (
          <div key={chan.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-md flex items-center justify-between">
            <div>
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{chan.label}</p>
              <p className="text-xl font-black text-slate-900">{chan.value}</p>
            </div>
            <div className={`${chan.bg} p-2.5 rounded-xl ${chan.color}`}><chan.icon size={16} /></div>
          </div>
        ))}
      </div>

      {/* Main Comms Panel */}
      <div className="rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          {["messages", "announcements", "broadcast"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 text-[8px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? "bg-white border-b-2 border-teal-500 text-teal-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === "messages" && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[7px] font-black text-slate-400 uppercase tracking-widest text-center">
                 Secure Relay Stream Active
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {MESSAGES.map((msg) => (
                  <div key={msg.id} className={`p-3 rounded-xl border transition-all cursor-pointer hover:scale-[1.01] ${msg.unread ? "bg-blue-50/50 border-blue-100 shadow-sm" : "bg-white border-slate-50"}`}>
                    <div className="flex items-start justify-between">
                       <div className="min-w-0">
                          <p className="text-[9px] font-black text-slate-900 uppercase">{msg.sender}</p>
                          <p className="text-[8px] text-slate-500 font-medium truncate mt-0.5">{msg.message}</p>
                       </div>
                       {msg.unread && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[6px] font-black uppercase text-slate-400 tracking-widest">
                       <span className="bg-slate-100 px-2 py-0.5 rounded-md">{msg.channel}</span>
                       <span className="flex items-center gap-1"><Clock size={8} /> {msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "announcements" && (
            <div className="space-y-4">
              <button className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"><Plus size={12} /> Global Broadcast</button>
              <div className="space-y-2">
                {ANNOUNCEMENTS.map((a) => (
                  <div key={a.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:bg-white transition-all">
                    <div>
                      <p className="text-[9px] font-black text-slate-900 uppercase">{a.title}</p>
                      <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{a.date}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[6px] font-black uppercase tracking-tighter ${a.priority === "high" ? "bg-rose-50 text-rose-600" : a.priority === "medium" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}>{a.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "broadcast" && (
            <form onSubmit={handleSendFeedback} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Target Client Node</label>
                  <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-[9px] font-bold outline-none focus:ring-1 focus:ring-teal-500">
                    {clients.map(c => <option key={c.id} value={c.id}>{c.display_name || c.email}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Relay Priority</label>
                  <select value={feedbackPriority} onChange={(e) => setFeedbackPriority(e.target.value)} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-[9px] font-bold outline-none">
                    <option value="low">LOW</option><option value="medium">MEDIUM</option><option value="high">HIGH</option><option value="urgent">URGENT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Relay Title</label>
                <input type="text" value={feedbackTitle} onChange={(e) => setFeedbackTitle(e.target.value)} placeholder="Node identification..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-[9px] font-bold outline-none focus:ring-1 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1.5 px-1">Manuscript Body</label>
                <textarea rows="4" value={feedbackMessage} onChange={(e) => setFeedbackMessage(e.target.value)} placeholder="Enter technical update for portal relay..." className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[9px] font-medium text-slate-600 outline-none focus:ring-1 focus:ring-teal-500 resize-none leading-relaxed" />
              </div>

              {feedbackStatus && (
                <div className={`p-2.5 rounded-xl text-[8px] font-bold uppercase tracking-wider text-center ${feedbackStatus.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                  {feedbackStatus.message}
                </div>
              )}

              <button type="submit" disabled={isSending} className="w-full bg-teal-600 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-700 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50">
                {isSending ? <RefreshCw className="animate-spin" size={12} /> : <Send size={12} />} Solidify Relay
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
