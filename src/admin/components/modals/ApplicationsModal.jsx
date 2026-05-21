import React, { useState } from 'react';
import { X, ClipboardList, Plus, Search, Filter, FileText, User, Calendar, Mail, Phone, CheckCircle, XCircle, Clock, Eye, Download, Send, Archive, Star, AlertCircle, Building, MapPin } from 'lucide-react';

export function ApplicationsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [applications, setApplications] = useState([
    { id: 1, name: 'James Kamau', email: 'james.kamau@email.com', phone: '+254 700 123 456', position: 'Senior Developer', department: 'IT', status: 'Pending', date: '2024-05-19', experience: '5 years', location: 'Nairobi', salary: 'KES 150,000', coverLetter: 'Experienced developer seeking new challenges...', resume: 'resume_james_kamau.pdf', rating: 4 },
    { id: 2, name: 'Mary Wanjiku', email: 'mary.wanjiku@email.com', phone: '+254 700 234 567', position: 'Project Manager', department: 'Operations', status: 'Review', date: '2024-05-18', experience: '8 years', location: 'Mombasa', salary: 'KES 180,000', coverLetter: 'Certified PMP with extensive experience...', resume: 'resume_mary_wanjiku.pdf', rating: 5 },
    { id: 3, name: 'Peter Ochieng', email: 'peter.ochieng@email.com', phone: '+254 700 345 678', position: 'UI/UX Designer', department: 'Design', status: 'Interview', date: '2024-05-17', experience: '3 years', location: 'Kisumu', salary: 'KES 120,000', coverLetter: 'Creative designer with strong portfolio...', resume: 'resume_peter_ochieng.pdf', rating: 3 },
    { id: 4, name: 'Grace Njeri', email: 'grace.njeri@email.com', phone: '+254 700 456 789', position: 'Data Analyst', department: 'Analytics', status: 'Accepted', date: '2024-05-16', experience: '4 years', location: 'Nairobi', salary: 'KES 130,000', coverLetter: 'Data-driven professional with SQL expertise...', resume: 'resume_grace_njeri.pdf', rating: 5 },
    { id: 5, name: 'David Kimani', email: 'david.kimani@email.com', phone: '+254 700 567 890', position: 'Marketing Manager', department: 'Marketing', status: 'Rejected', date: '2024-05-15', experience: '6 years', location: 'Eldoret', salary: 'KES 160,000', coverLetter: 'Results-oriented marketing professional...', resume: 'resume_david_kimani.pdf', rating: 2 },
  ]);

  const [selectedApplication, setSelectedApplication] = useState(null);

  if (!isOpen) return null;

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Review': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Interview': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Accepted': return 'bg-green-100 text-green-800 border-green-300';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = {
    'Pending': applications.filter(a => a.status === 'Pending'),
    'Review': applications.filter(a => a.status === 'Review'),
    'Interview': applications.filter(a => a.status === 'Interview'),
    'Accepted': applications.filter(a => a.status === 'Accepted'),
    'Rejected': applications.filter(a => a.status === 'Rejected'),
  };

  const handleStatusChange = (applicationId, newStatus) => {
    setApplications(applications.map(app => 
      app.id === applicationId ? { ...app, status: newStatus } : app
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Applications Management</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="bg-gray-50 border-b px-6 flex gap-1 overflow-x-auto">
          <button onClick={() => setActiveTab('inbox')} className={`px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'inbox' ? 'bg-white border-b-2 border-amber-500 text-amber-600' : 'text-gray-600 hover:text-gray-900'}`}>Inbox</button>
          <button onClick={() => setActiveTab('pipeline')} className={`px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'pipeline' ? 'bg-white border-b-2 border-amber-500 text-amber-600' : 'text-gray-600 hover:text-gray-900'}`}>Pipeline</button>
          <button onClick={() => setActiveTab('interviews')} className={`px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'interviews' ? 'bg-white border-b-2 border-amber-500 text-amber-600' : 'text-gray-600 hover:text-gray-900'}`}>Interviews</button>
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'analytics' ? 'bg-white border-b-2 border-amber-500 text-amber-600' : 'text-gray-600 hover:text-gray-900'}`}>Analytics</button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap ${activeTab === 'settings' ? 'bg-white border-b-2 border-amber-500 text-amber-600' : 'text-gray-600 hover:text-gray-900'}`}>Settings</button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'inbox' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search applications..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                </div>
                <div className="flex gap-2">
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Review">Review</option>
                    <option value="Interview">Interview</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
                    <Plus className="w-4 h-4" /> Post Job
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Applicant</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Position</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Experience</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredApplications.map(application => (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-semibold">
                              {application.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{application.name}</div>
                              <div className="text-sm text-gray-500">{application.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{application.position}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{application.department}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{application.experience}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{application.date}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => setSelectedApplication(application)} className="p-1 hover:bg-blue-100 rounded transition-colors">
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            <button className="p-1 hover:bg-green-100 rounded transition-colors">
                              <Download className="w-4 h-4 text-green-600" />
                            </button>
                            <button className="p-1 hover:bg-purple-100 rounded transition-colors">
                              <Send className="w-4 h-4 text-purple-600" />
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

          {activeTab === 'pipeline' && (
            <div className="grid grid-cols-5 gap-4 h-full">
              {Object.entries(columns).map(([status, statusApps]) => (
                <div key={status} className="bg-gray-100 rounded-xl p-4 min-h-[400px]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">{status}</h3>
                    <span className="text-sm text-gray-500">{statusApps.length}</span>
                  </div>
                  <div className="space-y-3">
                    {statusApps.map(app => (
                      <div key={app.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-semibold">
                            {app.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{app.name}</h4>
                            <p className="text-xs text-gray-500 truncate">{app.position}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < app.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <div className="text-gray-500">{app.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'interviews' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Scheduled Interviews</h3>
              <div className="space-y-4">
                {applications.filter(a => a.status === 'Interview').map(app => (
                  <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xl font-semibold">
                          {app.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{app.name}</h4>
                          <p className="text-sm text-gray-600">{app.position} - {app.department}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {app.email}
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {app.phone}
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Experience</div>
                        <div className="font-medium text-gray-900">{app.experience}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Location</div>
                        <div className="font-medium text-gray-900">{app.location}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Salary Expectation</div>
                        <div className="font-medium text-gray-900">{app.salary}</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        <CheckCircle className="w-4 h-4" /> Accept
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        <Clock className="w-4 h-4" /> Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Application Analytics</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="w-5 h-5" />
                    <span className="text-sm opacity-90">Total Applications</span>
                  </div>
                  <div className="text-2xl font-bold">{applications.length}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm opacity-90">Pending Review</span>
                  </div>
                  <div className="text-2xl font-bold">{applications.filter(a => a.status === 'Pending' || a.status === 'Review').length}</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm opacity-90">Accepted</span>
                  </div>
                  <div className="text-2xl font-bold">{applications.filter(a => a.status === 'Accepted').length}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm opacity-90">Interview Rate</span>
                  </div>
                  <div className="text-2xl font-bold">{Math.round((applications.filter(a => a.status === 'Interview').length / applications.length) * 100)}%</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Application Status Distribution</h4>
                <div className="space-y-3">
                  {Object.entries(columns).map(([status, statusApps]) => (
                    <div key={status} className="flex items-center gap-4">
                      <div className="w-32 text-sm text-gray-600">{status}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div className="bg-amber-500 h-4 rounded-full transition-all" style={{ width: `${(statusApps.length / applications.length) * 100}%` }} />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{statusApps.length}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Application Settings</h3>
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Auto-Reply Emails</h4>
                    <p className="text-sm text-gray-600">Send automatic confirmation emails to applicants</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-amber-500 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Receive email alerts for new applications</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-amber-500 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Application Scoring</h4>
                    <p className="text-sm text-gray-600">Enable AI-powered application scoring</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Resume Parsing</h4>
                    <p className="text-sm text-gray-600">Automatically extract data from uploaded resumes</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-amber-500 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedApplication && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Application Details</h2>
                  <button onClick={() => setSelectedApplication(null)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="flex-1 overflow-auto p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-semibold">
                      {selectedApplication.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{selectedApplication.name}</h3>
                      <p className="text-gray-600">{selectedApplication.position}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {selectedApplication.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {selectedApplication.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">Department</div>
                      <div className="font-medium text-gray-900">{selectedApplication.department}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">Experience</div>
                      <div className="font-medium text-gray-900">{selectedApplication.experience}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">Location</div>
                      <div className="font-medium text-gray-900">{selectedApplication.location}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">Salary Expectation</div>
                      <div className="font-medium text-gray-900">{selectedApplication.salary}</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-2">Cover Letter</div>
                    <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                      {selectedApplication.coverLetter}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      <CheckCircle className="w-4 h-4" /> Accept
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      <Clock className="w-4 h-4" /> Schedule Interview
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
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