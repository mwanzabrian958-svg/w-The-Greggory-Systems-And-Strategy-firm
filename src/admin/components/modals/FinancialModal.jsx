import React, { useState } from 'react';
import { X, Calculator, DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard, Smartphone, FileText, Download, Filter, Plus, Search, ArrowUpRight, ArrowDownRight, CheckCircle, AlertCircle } from 'lucide-react';

export function FinancialModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  const transactions = [
    { id: 1, type: 'income', description: 'Project Payment - Website Redesign', amount: 150000, date: '2024-05-19', category: 'Projects', status: 'completed' },
    { id: 2, type: 'expense', description: 'Office Supplies', amount: 15000, date: '2024-05-18', category: 'Operations', status: 'completed' },
    { id: 3, type: 'income', description: 'Consulting Fee', amount: 45000, date: '2024-05-17', category: 'Services', status: 'completed' },
    { id: 4, type: 'expense', description: 'Software Licenses', amount: 25000, date: '2024-05-16', category: 'Technology', status: 'pending' },
    { id: 5, type: 'income', description: 'Mobile App Development', amount: 200000, date: '2024-05-15', category: 'Projects', status: 'completed' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Financial Management</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-gray-50 border-b px-6 flex gap-1">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'overview' ? 'bg-white border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}>Overview</button>
          <button onClick={() => setActiveTab('transactions')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'transactions' ? 'bg-white border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}>Transactions</button>
          <button onClick={() => setActiveTab('invoices')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'invoices' ? 'bg-white border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}>Invoices</button>
          <button onClick={() => setActiveTab('payments')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'payments' ? 'bg-white border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}>Payment Methods</button>
          <button onClick={() => setActiveTab('reports')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'reports' ? 'bg-white border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-900'}`}>Reports</button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-sm opacity-90">Total Revenue</span>
                  </div>
                  <div className="text-3xl font-bold">KES 4.5M</div>
                  <div className="text-sm opacity-75 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> +23%
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-5 h-5" />
                    <span className="text-sm opacity-90">Total Expenses</span>
                  </div>
                  <div className="text-3xl font-bold">KES 1.8M</div>
                  <div className="text-sm opacity-75 mt-1 flex items-center gap-1">
                    <TrendingDown className="w-4 h-4" /> -8%
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm opacity-90">Net Profit</span>
                  </div>
                  <div className="text-3xl font-bold">KES 2.7M</div>
                  <div className="text-sm opacity-75 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> +15%
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5" />
                    <span className="text-sm opacity-90">Pending</span>
                  </div>
                  <div className="text-3xl font-bold">KES 450K</div>
                  <div className="text-sm opacity-75 mt-1">12 invoices</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4">Revenue by Category</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Projects', amount: 'KES 2.5M', percent: 56, color: 'bg-green-500' },
                      { name: 'Services', amount: 'KES 1.2M', percent: 27, color: 'bg-blue-500' },
                      { name: 'Consulting', amount: 'KES 500K', percent: 11, color: 'bg-purple-500' },
                      { name: 'Other', amount: 'KES 300K', percent: 6, color: 'bg-orange-500' },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div className={`${item.color} h-3 rounded-full`} style={{ width: `${item.percent}%` }} />
                        </div>
                        <div className="w-20 text-sm text-gray-600">{item.amount}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4">Recent Transactions</h4>
                  <div className="space-y-3">
                    {transactions.slice(0, 4).map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{tx.description}</p>
                            <p className="text-xs text-gray-500">{tx.date}</p>
                          </div>
                        </div>
                        <div className={`text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'income' ? '+' : '-'}KES {tx.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search transactions..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4" /> Filter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    <Plus className="w-4 h-4" /> Add Transaction
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{tx.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{tx.category}</td>
                        <td className={`px-4 py-3 font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'income' ? '+' : '-'}KES {tx.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{tx.date}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Plus className="w-4 h-4" /> Create Invoice
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'INV-234', client: 'Acme Corp', amount: 150000, status: 'paid', date: '2024-05-19' },
                  { id: 'INV-233', client: 'Tech Solutions', amount: 200000, status: 'pending', date: '2024-05-18' },
                  { id: 'INV-232', client: 'Global Industries', amount: 45000, status: 'overdue', date: '2024-05-15' },
                ].map((invoice) => (
                  <div key={invoice.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-green-600">{invoice.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{invoice.client}</h4>
                    <p className="text-2xl font-bold text-gray-900 mb-2">KES {invoice.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{invoice.date}</p>
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                        <FileText className="w-4 h-4" /> View
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                        <Download className="w-4 h-4" /> Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'M-Pesa', status: 'Active', icon: Smartphone, transactions: 156 },
                  { name: 'Bank Transfer', status: 'Active', icon: CreditCard, transactions: 89 },
                  { name: 'Credit Card', status: 'Inactive', icon: CreditCard, transactions: 0 },
                  { name: 'Cash', status: 'Active', icon: Wallet, transactions: 34 },
                ].map((method) => {
                  const Icon = method.icon;
                  return (
                    <div key={method.name} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${method.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{method.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${method.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {method.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{method.transactions} transactions</span>
                        <button className="text-green-600 hover:text-green-700 font-medium">Configure</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Financial Reports</h3>
              
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'Profit & Loss', period: 'Monthly', icon: TrendingUp },
                  { name: 'Cash Flow', period: 'Quarterly', icon: DollarSign },
                  { name: 'Balance Sheet', period: 'Yearly', icon: FileText },
                ].map((report) => {
                  const Icon = report.icon;
                  return (
                    <div key={report.name} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{report.name}</h4>
                      <p className="text-sm text-gray-600 mb-4">{report.period}</p>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <Download className="w-4 h-4" /> Generate
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}