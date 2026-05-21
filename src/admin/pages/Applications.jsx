import React, { useState, useEffect } from "react";
import { ClipboardList, CheckCircle, XCircle, Clock, Search, Filter, Eye, MessageSquare, Download, Calendar, User, FileText, AlertCircle, MoreVertical, ChevronLeft, ChevronRight, Star, Flag, FolderOpen } from "lucide-react";
import { API_BASE_URL } from "../../services/api";

const API_URL = import.meta.env.VITE_API_URL || API_BASE_URL;

export function Applications({ user }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("gf_admin_session")?.token;
      const response = await fetch(`${API_URL}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || data || []);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      // Mock data for demo
      setApplications([
        {
          id: 1,
          applicantName: "Community Health Initiative",
          type: "Grant Request",
          status: "pending",
          submittedDate: "2024-02-15",
          priority: "high",
          amount: 75000,
          description: "Funding request for community health awareness program",
          documents: ["proposal.pdf", "budget.xlsx"],
          reviewer: "Unassigned",
          notes: ""
        },
        {
          id: 2,
          applicantName: "Youth Empowerment Project",
          type: "Partnership",
          status: "under-review",
          submittedDate: "2024-02-14",
          priority: "medium",
          amount: 0,
          description: "Partnership proposal for youth skills development program",
          documents: ["partnership_agreement.pdf"],
          reviewer: "Alice Johnson",
          notes: "Initial review completed, awaiting final approval"
        },
        {
          id: 3,
          applicantName: "Education For All",
          type: "Event Permit",
          status: "approved",
          submittedDate: "2024-02-10",
          priority: "low",
          amount: 5000,
          description: "Event permit request for educational conference",
          documents: ["event_plan.pdf", "venue_contract.pdf"],
          reviewer: "Bob Smith",
          notes: "Approved with conditions"
        },
        {
          id: 4,
          applicantName: "Green Earth Initiative",
          type: "Grant Request",
          status: "changes-requested",
          submittedDate: "2024-02-08",
          priority: "high",
          amount: 120000,
          description: "Environmental conservation project funding request",
          documents: ["project_proposal.pdf", "environmental_assessment.pdf"],
          reviewer: "Carol Davis",
          notes: "Additional budget justification required"
        },
        {
          id: 5,
          applicantName: "Tech Skills Academy",
          type: "Partnership",
          status: "rejected",
          submittedDate: "2024-02-05",
          priority: "medium",
          amount: 0,
          description: "Technology training partnership proposal",
          documents: ["partnership_details.pdf"],
          reviewer: "David Wilson",
          notes: "Does not align with current strategic priorities"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "under-review": return "bg-blue-100 text-blue-700 border-blue-300";
      case "approved": return "bg-green-100 text-green-700 border-green-300";
      case "changes-requested": return "bg-orange-100 text-orange-700 border-orange-300";
      case "rejected": return "bg-red-100 text-red-700 border-red-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-300";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "low": return "bg-green-100 text-green-700 border-green-300";
      default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4" />;
      case "under-review": return <Eye className="h-4 w-4" />;
      case "approved": return <CheckCircle className="h-4 w-4" />;
      case "changes-requested": return <AlertCircle className="h-4 w-4" />;
      case "rejected": return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.applicantName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.type?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    const matchesType = typeFilter === "all" || app.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const token = sessionStorage.getItem("gf_admin_session")?.token;
      const response = await fetch(`${API_URL}/applications/${applicationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        await fetchApplications();
      }
    } catch (error) {
      console.error("Error updating application status:", error);
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === "pending").length,
    underReview: applications.filter(a => a.status === "under-review").length,
    approved: applications.filter(a => a.status === "approved").length,
    rejected: applications.filter(a => a.status === "rejected").length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Applications</h1>
          <p className="text-slate-600 mt-1">Review and manage grant requests, partnerships, and permits</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
            <ClipboardList className="h-4 w-4" />
            New Application
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 rounded-xl p-3">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-yellow-100 rounded-xl p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Under Review</p>
              <p className="text-2xl font-bold text-blue-600">{stats.underReview}</p>
            </div>
            <div className="bg-blue-100 rounded-xl p-3">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="bg-green-100 rounded-xl p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="bg-red-100 rounded-xl p-3">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under-review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="changes-requested">Changes Requested</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              <option value="all">All Types</option>
              <option value="Grant Request">Grant Request</option>
              <option value="Partnership">Partnership</option>
              <option value="Event Permit">Event Permit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-600">No applications found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Application</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Reviewer</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredApplications.map(application => (
                <tr key={application.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{application.applicantName}</p>
                      <p className="text-sm text-slate-600 truncate max-w-xs">{application.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{application.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(application.status)}
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(application.status)}`}>
                        {application.status.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(application.priority)}`}>
                      {application.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {application.amount > 0 ? (
                      <span className="font-semibold text-slate-900">${application.amount.toLocaleString()}</span>
                    ) : (
                      <span className="text-slate-600">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{new Date(application.submittedDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-slate-600">{application.reviewer}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setSelectedApplication(application); setShowDetailModal(true); }}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="h-4 w-4 text-slate-600" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <MessageSquare className="h-4 w-4 text-slate-600" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <MoreVertical className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Application Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedApplication.applicantName}</h2>
                  <p className="text-slate-600 mt-1">{selectedApplication.type}</p>
                </div>
                <button
                  onClick={() => { setShowDetailModal(false); setSelectedApplication(null); }}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <XCircle className="h-6 w-6 text-slate-600" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Description</h3>
                <p className="text-slate-600">{selectedApplication.description}</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <p className="font-semibold text-slate-900 capitalize">{selectedApplication.status.replace("-", " ")}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-600 mb-1">Priority</p>
                  <p className="font-semibold text-slate-900 capitalize">{selectedApplication.priority}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-600 mb-1">Amount</p>
                  <p className="font-semibold text-green-600">${selectedApplication.amount?.toLocaleString() || "N/A"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-600 mb-1">Submitted</p>
                  <p className="font-semibold text-slate-900">{new Date(selectedApplication.submittedDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Documents</h3>
                <div className="space-y-2">
                  {selectedApplication.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <FolderOpen className="h-5 w-5 text-blue-600" />
                        <span className="text-slate-900">{doc}</span>
                      </div>
                      <button className="p-2 rounded-lg hover:bg-slate-200 transition-colors">
                        <Download className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {selectedApplication.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Reviewer Notes</h3>
                  <p className="text-slate-600 bg-slate-50 rounded-xl p-4">{selectedApplication.notes}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleStatusUpdate(selectedApplication.id, "approved")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedApplication.id, "changes-requested")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                >
                  <AlertCircle className="h-4 w-4" />
                  Request Changes
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedApplication.id, "rejected")}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}