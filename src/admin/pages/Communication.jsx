import React, { useEffect, useState } from "react";
import { MessageSquare, Mail, Phone, Send, Plus, Search, Clock } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../utils/permissions";

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

export function Communication({ user }) {
  const { can } = usePermissions(user);
  const [activeTab, setActiveTab] = useState("messages");
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackPriority, setFeedbackPriority] = useState("medium");
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        if (data.success) {
          setClients(data.users || []);
          if (data.users?.length) {
            setSelectedClientId(String(data.users[0].id));
          }
        }
      } catch (error) {
        console.error("Failed to load clients", error);
      }
    };

    loadClients();
  }, []);

  const handleSendFeedback = async (event) => {
    event.preventDefault();
    if (!selectedClientId || !feedbackMessage.trim()) {
      setFeedbackStatus({ type: "error", message: "Select a client and write a message before sending." });
      return;
    }

    setIsSending(true);
    setFeedbackStatus(null);

    try {
      const response = await fetch("/api/users/client-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedClientId,
          title: feedbackTitle.trim() || "Direct feedback from company admin",
          message: feedbackMessage.trim(),
          priority: feedbackPriority,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send feedback");
      }

      setFeedbackStatus({ type: "success", message: "Feedback posted to the client portal." });
      setFeedbackTitle("");
      setFeedbackMessage("");
      setFeedbackPriority("medium");
    } catch (error) {
      setFeedbackStatus({ type: "error", message: error.message || "Unable to send feedback right now." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Channel Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Unread Messages</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">12</p>
            </div>
            <MessageSquare className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Email Pending</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">5</p>
            </div>
            <Mail className="h-10 w-10 text-amber-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Active Conversations</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">8</p>
            </div>
            <Phone className="h-10 w-10 text-green-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Main Communication Panel */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("messages")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
              activeTab === "messages"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
              activeTab === "announcements"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Announcements
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
              activeTab === "broadcast"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Broadcast
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "messages" && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                  <Search className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {MESSAGES.map((msg) => (
                  <div key={msg.id} className={`rounded-3xl p-4 border transition ${msg.unread ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{msg.sender}</h4>
                        <p className="mt-1 text-sm text-slate-600">{msg.message}</p>
                      </div>
                      {msg.unread && <div className="h-3 w-3 rounded-full bg-blue-600" />}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span className="rounded-full bg-white px-3 py-1">{msg.channel}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "announcements" && (
            <div className="space-y-4">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                New Announcement
              </button>

              <div className="space-y-3">
                {ANNOUNCEMENTS.map((announcement) => (
                  <div key={announcement.id} className="rounded-3xl bg-slate-50 p-4 border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">{announcement.title}</h4>
                      <p className="text-sm text-slate-500">{announcement.date}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      announcement.priority === "high" ? "bg-red-100 text-red-700" :
                      announcement.priority === "medium" ? "bg-amber-100 text-amber-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {announcement.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "broadcast" && (
            <form onSubmit={handleSendFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Client</label>
                <select
                  value={selectedClientId}
                  onChange={(event) => setSelectedClientId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.display_name || `${client.first_name || ""} ${client.last_name || ""}`.trim() || client.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Feedback Title</label>
                <input
                  type="text"
                  value={feedbackTitle}
                  onChange={(event) => setFeedbackTitle(event.target.value)}
                  placeholder="Project milestone update"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Message for Client Portal</label>
                <textarea
                  rows="6"
                  value={feedbackMessage}
                  onChange={(event) => setFeedbackMessage(event.target.value)}
                  placeholder="Write a direct update that will appear in the client portal message stream..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Priority</label>
                <select
                  value={feedbackPriority}
                  onChange={(event) => setFeedbackPriority(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              {feedbackStatus ? (
                <div className={`rounded-2xl border px-4 py-3 text-sm ${feedbackStatus.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                  {feedbackStatus.message}
                </div>
              ) : null}
              <div className="flex gap-3">
                <button type="submit" disabled={isSending} className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-70">
                  <Send className="h-4 w-4" />
                  {isSending ? "Sending..." : "Send to Client Portal"}
                </button>
                <button type="button" onClick={() => { setFeedbackTitle(""); setFeedbackMessage(""); setFeedbackPriority("medium"); setFeedbackStatus(null); }} className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                  Clear
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
