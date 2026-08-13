import React, { useState } from "react";
import { FileText, Download, Calendar, Filter, Plus, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../utils/permissions";

const REPORT_TEMPLATES = [
  { id: 1, title: "Executive Summary", description: "High-level overview of key metrics and achievements.", status: "ready", category: "Executive", lastGenerated: "May 10, 2024" },
  { id: 2, title: "Project Performance Report", description: "Detailed analysis of project status, progress, and deliverables.", status: "scheduled", category: "Projects", lastGenerated: "May 8, 2024" },
  { id: 3, title: "Billing Audit Report", description: "Complete billing statements and variance analysis.", status: "pending", category: "Billing", lastGenerated: "Apr 30, 2024" },
  { id: 4, title: "User Activity Report", description: "Login patterns, feature usage, and engagement metrics.", status: "ready", category: "Analytics", lastGenerated: "May 12, 2024" },
  { id: 5, title: "Compliance Report", description: "Data protection and regulatory compliance status.", status: "ready", category: "Compliance", lastGenerated: "May 1, 2024" },
  { id: 6, title: "Donor Impact Report", description: "Donor contributions and project impact metrics.", status: "ready", category: "Development", lastGenerated: "Apr 25, 2024" },
];

const SCHEDULED_REPORTS = [
  { id: 1, title: "Weekly Dashboard Summary", frequency: "Weekly", sendTo: "admin@greggory.org", nextRun: "May 20, 2024" },
  { id: 2, title: "Monthly Billing Report", frequency: "Monthly", sendTo: "billing@greggory.org", nextRun: "June 1, 2024" },
  { id: 3, title: "Quarterly Performance Review", frequency: "Quarterly", sendTo: "board@greggory.org", nextRun: "June 30, 2024" },
];

export function Reports({ user }) {
  const { can } = usePermissions(user);
  const [activeTab, setActiveTab] = useState("templates");

  const getStatusColor = (status) => {
    const colors = {
      ready: "bg-emerald-100 text-emerald-700",
      scheduled: "bg-blue-100 text-blue-700",
      pending: "bg-amber-100 text-amber-700",
    };
    return colors[status] || "bg-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-6">
      {/* Report Overview Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Total Reports</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">24</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Scheduled</p>
              <p className="mt-2 text-3xl font-semibold text-blue-600">3</p>
            </div>
            <Calendar className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">This Month</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-600">8</p>
            </div>
            <TrendingUp className="h-10 w-10 text-emerald-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Main Report Panel */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("templates")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
              activeTab === "templates"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Report Templates
          </button>
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
              activeTab === "scheduled"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Scheduled Reports
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
              activeTab === "custom"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Custom Builder
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "templates" && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {REPORT_TEMPLATES.map((report) => (
                  <div key={report.id} className="rounded-3xl bg-slate-50 p-5 border border-slate-200 hover:border-blue-200 transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{report.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{report.description}</p>
                        <p className="text-xs text-slate-500 mt-3">Last generated: {report.lastGenerated}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button className="flex-1 rounded-2xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                        Generate
                      </button>
                      <button className="rounded-2xl bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "scheduled" && (
            <div className="space-y-4">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Schedule New Report
              </button>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-slate-700">
                  <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Report Name</th>
                      <th className="px-4 py-3">Frequency</th>
                      <th className="px-4 py-3">Send To</th>
                      <th className="px-4 py-3">Next Run</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SCHEDULED_REPORTS.map((report) => (
                      <tr key={report.id} className="border-t border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-4 font-medium text-slate-900">{report.title}</td>
                        <td className="px-4 py-4">{report.frequency}</td>
                        <td className="px-4 py-4">{report.sendTo}</td>
                        <td className="px-4 py-4 text-slate-500">{report.nextRun}</td>
                        <td className="px-4 py-4">
                          <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "custom" && (
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Report Name</label>
                <input
                  type="text"
                  placeholder="Enter report name..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Select Metrics</label>
                <div className="space-y-2">
                  {["Revenue", "User Activity", "Project Status", "Compliance Score", "Support Tickets", "Billing Health"].map((metric) => (
                    <label key={metric} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100">
                      <input type="checkbox" className="h-4 w-4" />
                      <span className="text-sm font-medium text-slate-700">{metric}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">Report Format</label>
                <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>PDF</option>
                  <option>Excel</option>
                  <option>CSV</option>
                  <option>Email</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700">
                  Generate Report
                </button>
                <button className="rounded-2xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
