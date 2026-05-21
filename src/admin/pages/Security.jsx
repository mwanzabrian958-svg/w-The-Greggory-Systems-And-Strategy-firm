import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle, Lock, Key, Eye, Activity, Download, Clock } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../utils/permissions";

const SECURITY_CHECKLIST = [
  { id: 1, item: "Two-factor authentication enabled", status: "complete", severity: "high" },
  { id: 2, item: "SSL certificate valid and renewed", status: "complete", severity: "high" },
  { id: 3, item: "Database encrypted at rest", status: "complete", severity: "high" },
  { id: 4, item: "Regular backup schedule configured", status: "complete", severity: "high" },
  { id: 5, item: "API rate limiting enabled", status: "complete", severity: "medium" },
  { id: 6, item: "Audit logging configured", status: "warning", severity: "medium" },
  { id: 7, item: "Intrusion detection system active", status: "pending", severity: "medium" },
];

const RECENT_ACTIVITY = [
  { id: 1, action: "Admin login", user: "Amaka Wanjiru", time: "Today, 10:30 AM", status: "success" },
  { id: 2, action: "Configuration change", user: "David Otieno", time: "Today, 09:15 AM", status: "success" },
  { id: 3, action: "Failed login attempt", user: "Unknown", time: "Today, 08:00 AM", status: "alert" },
  { id: 4, action: "Database backup", user: "System", time: "Yesterday, 2:00 AM", status: "success" },
];

const COMPLIANCE_ITEMS = [
  { name: "GDPR", status: "Compliant", lastAudit: "Apr 15, 2024" },
  { name: "Data Protection", status: "Compliant", lastAudit: "Apr 10, 2024" },
  { name: "Access Control", status: "Compliant", lastAudit: "Mar 30, 2024" },
];

export function Security({ user }) {
  const { can } = usePermissions(user);

  return (
    <div className="space-y-6">
      {/* Security Score */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Overall Security Score</h3>
            <p className="mt-2 text-sm text-slate-600">System health and compliance status.</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold text-emerald-600">8.9</p>
            <p className="text-sm text-emerald-700 mt-1">Secure ✓</p>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { label: "Access Control", score: 95, color: "bg-emerald-100 text-emerald-700" },
            { label: "Encryption", score: 98, color: "bg-emerald-100 text-emerald-700" },
            { label: "Logging", score: 85, color: "bg-amber-100 text-amber-700" },
            { label: "Compliance", score: 92, color: "bg-emerald-100 text-emerald-700" },
          ].map((item, idx) => (
            <div key={idx} className={`rounded-2xl p-4 ${item.color}`}>
              <p className="text-xs font-semibold">{item.label}</p>
              <p className="mt-2 text-2xl font-bold">{item.score}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Security Checklist */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900">Security Checklist</h3>
        <p className="mt-2 text-sm text-slate-600">Required security measures and their status.</p>

        <div className="mt-6 space-y-3">
          {SECURITY_CHECKLIST.map((item) => (
            <div key={item.id} className="rounded-3xl bg-slate-50 p-4 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                {item.status === "complete" && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                {item.status === "warning" && <AlertTriangle className="h-5 w-5 text-amber-600" />}
                {item.status === "pending" && <Clock className="h-5 w-5 text-slate-400" />}
                <p className="text-sm font-medium text-slate-900">{item.item}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
                item.status === "complete" ? "bg-emerald-100 text-emerald-700" :
                item.status === "warning" ? "bg-amber-100 text-amber-700" :
                "bg-slate-100 text-slate-700"
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
          <div className="mt-6 space-y-3">
            {RECENT_ACTIVITY.map((activity) => (
              <div key={activity.id} className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900">{activity.action}</h4>
                    <p className="text-sm text-slate-500">{activity.user}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    activity.status === "success" ? "bg-emerald-100 text-emerald-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {activity.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Status */}
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Compliance Status</h3>
          <div className="mt-6 space-y-4">
            {COMPLIANCE_ITEMS.map((item, idx) => (
              <div key={idx} className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{item.name}</h4>
                    <p className="text-sm text-slate-500">Last audit: {item.lastAudit}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Access Management */}
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Access Management</h3>
            <p className="mt-2 text-sm text-slate-600">Manage user permissions and API keys.</p>
          </div>
          <button className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Manage Roles
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <button className="rounded-3xl bg-slate-50 p-4 border border-slate-200 hover:border-blue-200 transition text-left">
            <Lock className="h-5 w-5 text-blue-600 mb-3" />
            <h4 className="font-semibold text-slate-900">Password Policy</h4>
            <p className="text-sm text-slate-600 mt-1">Configure minimum requirements and rotation.</p>
          </button>
          <button className="rounded-3xl bg-slate-50 p-4 border border-slate-200 hover:border-blue-200 transition text-left">
            <Key className="h-5 w-5 text-blue-600 mb-3" />
            <h4 className="font-semibold text-slate-900">API Keys</h4>
            <p className="text-sm text-slate-600 mt-1">View and manage active API credentials.</p>
          </button>
          <button className="rounded-3xl bg-slate-50 p-4 border border-slate-200 hover:border-blue-200 transition text-left">
            <Eye className="h-5 w-5 text-blue-600 mb-3" />
            <h4 className="font-semibold text-slate-900">Login Activity</h4>
            <p className="text-sm text-slate-600 mt-1">Review and monitor user access logs.</p>
          </button>
          <button className="rounded-3xl bg-slate-50 p-4 border border-slate-200 hover:border-blue-200 transition text-left">
            <Activity className="h-5 w-5 text-blue-600 mb-3" />
            <h4 className="font-semibold text-slate-900">Audit Trail</h4>
            <p className="text-sm text-slate-600 mt-1">Detailed log of all system changes.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
