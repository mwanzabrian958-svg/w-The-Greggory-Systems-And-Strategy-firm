import React, { useState } from "react";
import { Building2, Users, Briefcase, TrendingUp, Search, Filter, Plus } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../utils/permissions";

const LEAD_PIPELINE = [
  { stage: "New", count: 24, color: "bg-blue-100 text-blue-700" },
  { stage: "Qualified", count: 14, color: "bg-green-100 text-green-700" },
  { stage: "Proposal", count: 8, color: "bg-amber-100 text-amber-700" },
  { stage: "Closed", count: 5, color: "bg-emerald-100 text-emerald-700" },
];

const CLIENTS = [
  { id: 1, name: "Kazi Community", email: "contact@kazi.org", status: "Active", satisfaction: 4.8, projects: 3 },
  { id: 2, name: "Green Impact", email: "hello@greenimpact.org", status: "Active", satisfaction: 4.5, projects: 2 },
  { id: 3, name: "Youth Action", email: "info@youthaction.org", status: "Pending", satisfaction: 4.2, projects: 1 },
  { id: 4, name: "Community First", email: "admin@communityfirst.org", status: "Active", satisfaction: 4.7, projects: 4 },
];

const OPPORTUNITIES = [
  { id: 1, title: "Partnership expansion", client: "Kazi Community", value: "$45,000", stage: "Proposal", daysLeft: 3 },
  { id: 2, title: "Volunteer onboarding platform", client: "Green Impact", value: "$32,000", stage: "Qualified", daysLeft: 7 },
  { id: 3, title: "Annual event coordination", client: "Youth Action", value: "$18,000", stage: "New", daysLeft: 14 },
];

export function CRM({ user }) {
  const { can } = usePermissions(user);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStage, setFilterStage] = useState("all");

  return (
    <div className="space-y-6">
      {/* Lead Pipeline Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {LEAD_PIPELINE.map((lead) => (
          <div key={lead.stage} className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${lead.color}`}>
              <TrendingUp className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm text-slate-500">{lead.stage}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{lead.count}</p>
            <p className="mt-2 text-xs text-slate-500">Active leads</p>
          </div>
        ))}
      </div>

      {/* Client Relationships */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Client Relationships</h3>
            <p className="mt-2 text-sm text-slate-500">Manage client information and satisfaction scores.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            New Client
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-12 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-sm text-slate-700">
            <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Client Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Satisfaction</th>
                <th className="px-4 py-3">Projects</th>
              </tr>
            </thead>
            <tbody>
              {CLIENTS.map((client) => (
                <tr key={client.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-4 font-medium text-slate-900">{client.name}</td>
                  <td className="px-4 py-4">{client.email}</td>
                  <td className="px-4 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${client.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{client.satisfaction}</span>
                      <div className="text-xs text-slate-500">★★★★★</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">{client.projects}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Opportunities */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Sales Opportunities</h3>
            <p className="mt-2 text-sm text-slate-500">Active deals and follow-up timeline.</p>
          </div>
          <button className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {OPPORTUNITIES.map((opp) => (
            <div key={opp.id} className="rounded-3xl bg-slate-50 p-5 border border-slate-200 hover:border-blue-200 transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{opp.title}</h4>
                  <p className="mt-1 text-sm text-slate-500">{opp.client}</p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">{opp.stage}</span>
              </div>
              <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-200">
                <span className="text-lg font-semibold text-slate-900">{opp.value}</span>
                <span className="text-xs text-slate-500">{opp.daysLeft} days</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
