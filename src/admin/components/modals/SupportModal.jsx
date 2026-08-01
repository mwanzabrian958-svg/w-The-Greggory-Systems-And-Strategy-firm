import React, { useState } from 'react';
import { X, HelpCircle, Plus, Search, Ticket, MessageCircle, Phone, Mail, Clock, AlertCircle, CheckCircle, User, Calendar, Filter, Archive, Trash2, Reply, Forward, Star, BookOpen, CreditCard, Settings, Shield, Code, ChevronRight } from 'lucide-react';

export function SupportModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('tickets');
  const [selectedTicket, setSelectedTicket] = useState(null);

  const tickets = [
    { id: 'SUP-234', title: 'Login page not loading', priority: 'High', status: 'Open', customer: 'John Doe', created: '2024-05-19', messages: 3 },
    { id: 'SUP-233', title: 'Payment gateway error', priority: 'Critical', status: 'In Progress', customer: 'Jane Smith', created: '2024-05-18', messages: 5 },
    { id: 'SUP-232', title: 'Feature request: Dark mode', priority: 'Medium', status: 'Open', customer: 'Bob Johnson', created: '2024-05-17', messages: 2 },
    { id: 'SUP-231', title: 'Password reset not working', priority: 'High', status: 'Resolved', customer: 'Alice Williams', created: '2024-05-16', messages: 4 },
    { id: 'SUP-230', title: 'General inquiry about services', priority: 'Low', status: 'Closed', customer: 'Charlie Brown', created: '2024-05-15', messages: 1 },
  ];

  if (!isOpen) return null;

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'In Progress': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-300';
      case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Support Center</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-gray-50 border-b px-6 flex gap-1">
          <button onClick={() => setActiveTab('tickets')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'tickets' ? 'bg-white border-b-2 border-orange-600 text-orange-600' : 'text-gray-600 hover:text-gray-900'}`}>Support Tickets</button>
          <button onClick={() => setActiveTab('knowledge')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'knowledge' ? 'bg-white border-b-2 border-orange-600 text-orange-600' : 'text-gray-600 hover:text-gray-900'}`}>Knowledge Base</button>
          <button onClick={() => setActiveTab('faq')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'faq' ? 'bg-white border-b-2 border-orange-600 text-orange-600' : 'text-gray-600 hover:text-gray-900'}`}>FAQ</button>
          <button onClick={() => setActiveTab('contact')} className={`px-4 py-3 font-medium text-sm transition-colors ${activeTab === 'contact' ? 'bg-white border-b-2 border-orange-600 text-orange-600' : 'text-gray-600 hover:text-gray-900'}`}>Contact Methods</button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search tickets..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent" />
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter className="w-4 h-4" /> Filter
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                    <Plus className="w-4 h-4" /> New Ticket
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ticket ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tickets.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-orange-600">{ticket.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{ticket.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{ticket.customer}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{ticket.created}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => setSelectedTicket(ticket)} className="p-1 hover:bg-blue-100 rounded transition-colors">
                              <MessageCircle className="w-4 h-4 text-blue-600" />
                            </button>
                            <button className="p-1 hover:bg-green-100 rounded transition-colors">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>
                            <button className="p-1 hover:bg-purple-100 rounded transition-colors">
                              <Star className="w-4 h-4 text-purple-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Knowledge Base</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  <Plus className="w-4 h-4" /> Add Article
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { title: 'Getting Started', articles: 12, icon: BookOpen, category: 'Onboarding' },
                  { title: 'Account Management', articles: 8, icon: User, category: 'Account' },
                  { title: 'Payment Issues', articles: 15, icon: CreditCard, category: 'Billing' },
                  { title: 'Technical Support', articles: 20, icon: Settings, category: 'Technical' },
                  { title: 'Security', articles: 6, icon: Shield, category: 'Security' },
                  { title: 'API Documentation', articles: 10, icon: Code, category: 'Developers' },
                ].map((category) => {
                  const Icon = category.icon;
                  return (
                    <div key={category.title} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-orange-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{category.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{category.articles} articles</p>
                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">{category.category}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  <Plus className="w-4 h-4" /> Add FAQ
                </button>
              </div>

              {[
                { question: 'How do I reset my password?', answer: 'Go to Settings > Security > Change Password. You can also use the "Forgot Password" link on the login page.' },
                { question: 'What payment methods do you accept?', answer: 'We accept M-Pesa, credit cards (Visa, Mastercard), and bank transfers.' },
                { question: 'How can I contact support?', answer: 'You can reach us via email at support@thegreggorysystemsandstrategyfirm.org, phone at +254 700 000 000, or through the support portal.' },
                { question: 'How do I upgrade my account?', answer: 'Contact our sales team or go to Settings > Billing > Upgrade Plan.' },
              ].map((faq, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{faq.question}</h4>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Contact Methods</h3>
              
              <div className="grid grid-cols-3 gap-4">
                {[
                  { method: 'Email', value: 'support@thegreggorysystemsandstrategyfirm.org', icon: Mail, available: '24/7' },
                  { method: 'Phone', value: '+254 700 000 000', icon: Phone, available: '8 AM - 6 PM EAT' },
                  { method: 'Live Chat', value: 'Available on website', icon: MessageCircle, available: '24/7' },
                ].map((contact) => {
                  const Icon = contact.icon;
                  return (
                    <div key={contact.method} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-orange-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{contact.method}</h4>
                      <p className="text-sm text-gray-600 mb-3">{contact.value}</p>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Clock className="w-3 h-3" />
                        {contact.available}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">Response Time Expectations</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-gray-900">Critical Issues</span>
                    </div>
                    <span className="text-sm text-gray-600">Within 1 hour</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-gray-900">High Priority</span>
                    </div>
                    <span className="text-sm text-gray-600">Within 4 hours</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-gray-900">Normal Priority</span>
                    </div>
                    <span className="text-sm text-gray-600">Within 24 hours</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900">Low Priority</span>
                    </div>
                    <span className="text-sm text-gray-600">Within 48 hours</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}