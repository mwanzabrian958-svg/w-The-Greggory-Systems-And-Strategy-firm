import React, { useState } from "react";
import { HelpCircle, Plus, Search, Clock, AlertCircle, CheckCircle, MessageCircle } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../utils/permissions";

const SUPPORT_TICKETS = [
  { id: "TKT-001", title: "Dashboard not loading", requester: "David Otieno", status: "open", priority: "high", time: "2 hours ago" },
  { id: "TKT-002", title: "Password reset not working", requester: "Susan Njeri", status: "in_progress", priority: "medium", time: "4 hours ago" },
  { id: "TKT-003", title: "Export function error", requester: "Amaka Wanjiru", status: "resolved", priority: "low", time: "1 day ago" },
];

const KB_ARTICLES = [
  { id: 1, title: "Getting Started with Admin Panel", views: 245, category: "Tutorial" },
  { id: 2, title: "User Management Best Practices", views: 189, category: "Guide" },
  { id: 3, title: "Troubleshooting Common Issues", views: 342, category: "FAQ" },
  { id: 4, title: "API Integration Guide", views: 156, category: "Technical" },
];

export function Support({ user }) {
  const { can } = usePermissions(user);
  const [activeTab, setActiveTab] = useState("tickets");

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-red-100 text-red-700",
      in_progress: "bg-amber-100 text-amber-700",
      resolved: "bg-emerald-100 text-emerald-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-6">
      {/* Support Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Open Tickets</p>
              <p className="mt-2 text-3xl font-semibold text-red-600">24</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">In Progress</p>
              <p className="mt-2 text-3xl font-semibold text-amber-600">8</p>
            </div>
            <Clock className="h-10 w-10 text-amber-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Avg Response Time</p>
              <p className="mt-2 text-3xl font-semibold text-blue-600">2.3h</p>
            </div>
            <MessageCircle className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Support Panel */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
              activeTab === "tickets"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Support Tickets
          </button>
          <button
            onClick={() => setActiveTab("knowledge")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
              activeTab === "knowledge"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
              activeTab === "faq"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            FAQ
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "tickets" && (
            <div className="space-y-4">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Create Ticket
              </button>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-slate-700">
                  <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Ticket</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Requester</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SUPPORT_TICKETS.map((ticket) => (
                      <tr key={ticket.id} className="border-t border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-4 font-medium text-blue-600">{ticket.id}</td>
                        <td className="px-4 py-4 text-slate-900 font-medium">{ticket.title}</td>
                        <td className="px-4 py-4">{ticket.requester}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            ticket.priority === "high" ? "bg-red-100 text-red-700" :
                            ticket.priority === "medium" ? "bg-amber-100 text-amber-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-500">{ticket.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "knowledge" && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search knowledge base..."
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                  <Search className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                {KB_ARTICLES.map((article) => (
                  <div key={article.id} className="rounded-3xl bg-slate-50 p-4 border border-slate-200 hover:border-blue-200 transition cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{article.title}</h4>
                        <p className="text-sm text-slate-500 mt-1">{article.category}</p>
                      </div>
                      <span className="text-xs text-slate-500">{article.views} views</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "faq" && (
            <div className="space-y-3">
              {[
                { q: "How do I reset my password?", a: "Navigate to login, click 'Forgot Password', and follow the email instructions." },
                { q: "How can I manage user permissions?", a: "Go to Settings > User Roles to configure role-based permissions." },
                { q: "Where are my backups stored?", a: "Automated backups are stored in the cloud and can be accessed from Settings > Backups." },
              ].map((item, idx) => (
                <div key={idx} className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-900">{item.q}</h4>
                  <p className="text-sm text-slate-600 mt-2">{item.a}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
