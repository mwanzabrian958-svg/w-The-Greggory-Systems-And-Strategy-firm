import React, { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, Plus, BarChart3 } from "lucide-react";
import { usePermissions } from "../hooks/usePermissions";
import { PERMISSIONS } from "../utils/permissions";

const FINANCIAL_OVERVIEW = [
  { label: "Total Revenue", value: "$124,500", change: "+12.5%", icon: TrendingUp, color: "bg-green-100 text-green-700" },
  { label: "Total Expenses", value: "$78,200", change: "+8.3%", icon: TrendingDown, color: "bg-red-100 text-red-700" },
  { label: "Net Income", value: "$46,300", change: "+18.2%", icon: TrendingUp, color: "bg-blue-100 text-blue-700" },
  { label: "Budget Remaining", value: "$32,450", change: "-5.1%", icon: DollarSign, color: "bg-amber-100 text-amber-700" },
];

const INCOME_SOURCES = [
  { source: "Donations", amount: "$45,200", percentage: 36, color: "bg-emerald-500" },
  { source: "Grants", amount: "$38,500", percentage: 31, color: "bg-blue-500" },
  { source: "Partnerships", amount: "$28,400", percentage: 23, color: "bg-purple-500" },
  { source: "Other", amount: "$12,400", percentage: 10, color: "bg-slate-500" },
];

const RECENT_TRANSACTIONS = [
  { id: 1, description: "Grant from Foundation X", amount: "+$15,000", date: "May 12, 2024", category: "Income", status: "completed" },
  { id: 2, description: "Staff salaries", amount: "-$28,500", date: "May 10, 2024", category: "Expense", status: "completed" },
  { id: 3, description: "Program supplies", amount: "-$3,250", date: "May 8, 2024", category: "Expense", status: "completed" },
  { id: 4, description: "Donor contribution", amount: "+$5,000", date: "May 6, 2024", category: "Income", status: "pending" },
];

const BUDGET_ITEMS = [
  { category: "Salaries", budgeted: "$45,000", spent: "$38,500", status: "on-track" },
  { category: "Programs", budgeted: "$35,000", spent: "$24,300", status: "on-track" },
  { category: "Administration", budgeted: "$20,000", spent: "$15,400", status: "on-track" },
  { category: "Equipment", budgeted: "$15,000", spent: "$11,200", status: "on-track" },
];

export function Financial({ user }) {
  const { can } = usePermissions(user);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {FINANCIAL_OVERVIEW.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${metric.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm text-slate-500">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{metric.value}</p>
              <p className="mt-2 text-xs text-emerald-600 font-semibold">{metric.change} vs last month</p>
            </div>
          );
        })}
      </div>

      {/* Main Financial Panel */}
      <div className="rounded-3xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
              activeTab === "overview"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
              activeTab === "transactions"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab("budget")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
              activeTab === "budget"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Budget
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
              activeTab === "invoices"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Invoices
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Cash Flow Chart Placeholder */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Cash Flow</h3>
                <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border border-slate-200 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-slate-300 mx-auto" />
                    <p className="mt-2 text-slate-500 text-sm">Cash flow chart will render here</p>
                  </div>
                </div>
              </div>

              {/* Income Distribution */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Income Distribution</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl border border-slate-200 flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-slate-300 mx-auto" />
                      <p className="mt-2 text-slate-500 text-sm">Pie chart will render here</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {INCOME_SOURCES.map((source) => (
                      <div key={source.source} className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">{source.source}</h4>
                          <span className="text-sm font-semibold text-slate-900">{source.amount}</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={`h-full ${source.color}`} style={{ width: `${source.percentage}%` }} />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{source.percentage}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-4">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                New Transaction
              </button>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-slate-700">
                  <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RECENT_TRANSACTIONS.map((trans) => (
                      <tr key={trans.id} className="border-t border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-4 font-medium text-slate-900">{trans.description}</td>
                        <td className={`px-4 py-4 font-semibold ${trans.amount.startsWith("+") ? "text-emerald-600" : "text-red-600"}`}>
                          {trans.amount}
                        </td>
                        <td className="px-4 py-4">{trans.category}</td>
                        <td className="px-4 py-4 text-slate-500">{trans.date}</td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            trans.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {trans.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "budget" && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-slate-700">
                  <thead className="bg-slate-100 text-left text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Budgeted</th>
                      <th className="px-4 py-3">Spent</th>
                      <th className="px-4 py-3">Progress</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BUDGET_ITEMS.map((item) => (
                      <tr key={item.category} className="border-t border-slate-200 hover:bg-slate-50">
                        <td className="px-4 py-4 font-medium text-slate-900">{item.category}</td>
                        <td className="px-4 py-4">{item.budgeted}</td>
                        <td className="px-4 py-4">{item.spent}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 w-32">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600" style={{ width: "65%" }} />
                            </div>
                            <span className="text-xs font-semibold">65%</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            {item.status.replace("-", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="space-y-4">
              <button className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                New Invoice
              </button>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">INV-001</h4>
                      <p className="text-sm text-slate-500">Kazi Community</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Paid</span>
                  </div>
                  <p className="mt-4 text-lg font-semibold text-slate-900">$8,500</p>
                  <p className="text-xs text-slate-500">Due May 30, 2024</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">INV-002</h4>
                      <p className="text-sm text-slate-500">Green Impact</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span>
                  </div>
                  <p className="mt-4 text-lg font-semibold text-slate-900">$6,200</p>
                  <p className="text-xs text-slate-500">Due June 5, 2024</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
