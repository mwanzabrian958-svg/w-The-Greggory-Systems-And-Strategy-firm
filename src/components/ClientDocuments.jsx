import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Eye, 
  Mail, 
  Calendar, 
  User, 
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Share2,
  Printer
} from 'lucide-react'

const ClientDocuments = ({ 
  invoices, 
  quotes, 
  mpesaTransactions, 
  projects, 
  users,
  onGenerateDocument,
  onSendDocument,
  onRefresh 
}) => {
  const [activeTab, setActiveTab] = useState('invoices')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterClient, setFilterClient] = useState('all')
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendForm, setSendForm] = useState({
    email: '',
    subject: '',
    message: ''
  })

  const tabs = [
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'receipts', label: 'Payment Receipts', icon: CheckCircle },
    { id: 'statements', label: 'Account Statements', icon: DollarSign }
  ]

  // Filter documents based on search and filters
  const getFilteredDocuments = () => {
    let documents = []
    
    if (activeTab === 'invoices') {
      documents = invoices || []
    } else if (activeTab === 'quotes') {
      documents = quotes || []
    } else if (activeTab === 'receipts') {
      documents = mpesaTransactions?.filter(tx => tx.status === 'completed') || []
    } else if (activeTab === 'statements') {
      // Generate account statements from accounting entries
      documents = []
    }

    // Apply filters
    if (searchTerm) {
      documents = documents.filter(doc => 
        (doc.invoice_number || doc.quote_number || doc.transaction_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.client_name || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== 'all') {
      documents = documents.filter(doc => doc.status === filterStatus)
    }

    if (filterClient !== 'all') {
      documents = documents.filter(doc => doc.client_id === parseInt(filterClient))
    }

    return documents
  }

  const handleSendDocument = (document) => {
    setSelectedDocument(document)
    setSendForm({
      email: document.client_email || '',
      subject: `Your ${activeTab === 'invoices' ? 'Invoice' : 'Quote'} - ${document.invoice_number || document.quote_number}`,
      message: `Dear ${document.client_name},\n\nPlease find attached your ${activeTab === 'invoices' ? 'invoice' : 'quote'}.\n\nThank you for your business.`
    })
    setShowSendModal(true)
  }

  const handleSendEmail = async () => {
    if (!selectedDocument || !sendForm.email) return
    
    try {
      // Call the send document API
      const response = await fetch('/api/documents/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDocument.id,
          documentType: activeTab,
          email: sendForm.email,
          subject: sendForm.subject,
          message: sendForm.message
        })
      })

      if (response.ok) {
        alert('Document sent successfully!')
        setShowSendModal(false)
        onRefresh()
      } else {
        alert('Failed to send document')
      }
    } catch (error) {
      console.error('Error sending document:', error)
      alert('Error sending document')
    }
  }

  const handleGeneratePDF = async (document) => {
    try {
      const response = await fetch(`/api/documents/generate/${activeTab}/${document.id}`, {
        method: 'POST'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${activeTab}-${document.invoice_number || document.quote_number || document.transaction_id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to generate PDF')
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
      case 'accepted':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'sent':
      case 'viewed':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
      case 'expired':
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDocumentIcon = (type) => {
    switch (type) {
      case 'invoices':
        return FileText
      case 'quotes':
        return FileText
      case 'receipts':
        return CheckCircle
      case 'statements':
        return DollarSign
      default:
        return FileText
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Client Document Management</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onGenerateDocument(activeTab)}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Generate Document
            </button>
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Clock className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Clients</option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredDocuments().map((document) => (
                <tr key={document.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {document.invoice_number || document.quote_number || document.transaction_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <p className="font-medium">{document.client_name}</p>
                        <p className="text-xs text-gray-500">{document.client_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    KES {parseFloat(document.total_amount_kes || document.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {document.issue_date || document.transaction_date || document.created_at}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                      {document.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedDocument(document)
                          setShowDocumentModal(true)
                        }}
                        className="text-teal-600 hover:text-teal-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleGeneratePDF(document)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Generate PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSendDocument(document)}
                        className="text-green-600 hover:text-green-800"
                        title="Send Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-600 hover:text-gray-800"
                        title="Print"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        className="text-purple-600 hover:text-purple-800"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {getFilteredDocuments().length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No documents found</p>
              <button
                onClick={() => onGenerateDocument(activeTab)}
                className="mt-4 text-teal-600 hover:text-teal-800 font-medium"
              >
                Generate your first document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Document Details Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-screen overflow-y-auto m-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {activeTab === 'invoices' ? 'Invoice' : activeTab === 'quotes' ? 'Quote' : 'Document'} Details
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Document Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Document Number</p>
                      <p className="font-medium">
                        {selectedDocument.invoice_number || selectedDocument.quote_number || selectedDocument.transaction_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Client Name</p>
                      <p className="font-medium">{selectedDocument.client_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedDocument.client_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{selectedDocument.client_phone}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Financial Details</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-medium text-lg">
                        KES {parseFloat(selectedDocument.total_amount_kes || selectedDocument.amount || 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedDocument.status)}`}>
                        {selectedDocument.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Issue Date</p>
                      <p className="font-medium">
                        {selectedDocument.issue_date || selectedDocument.transaction_date || selectedDocument.created_at}
                      </p>
                    </div>
                    {selectedDocument.due_date && (
                      <div>
                        <p className="text-sm text-gray-500">Due Date</p>
                        <p className="font-medium">{selectedDocument.due_date}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedDocument.description && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedDocument.description}</p>
                </div>
              )}
              
              {selectedDocument.notes && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-gray-600">{selectedDocument.notes}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowDocumentModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleGeneratePDF(selectedDocument)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Document Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto m-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Send Document</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedDocument?.invoice_number || selectedDocument?.quote_number || selectedDocument?.transaction_id}
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                <input
                  type="email"
                  value={sendForm.email}
                  onChange={(e) => setSendForm({...sendForm, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="client@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={sendForm.subject}
                  onChange={(e) => setSendForm({...sendForm, subject: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Email subject"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={sendForm.message}
                  onChange={(e) => setSendForm({...sendForm, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={4}
                  placeholder="Email message"
                />
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowSendModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientDocuments
