import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Download, 
  Calendar, 
  User, 
  DollarSign,
  Mail,
  Phone,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Building,
  CreditCard,
  Receipt,
  FileDown
} from 'lucide-react'

const ClientPortal = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('documents')
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [showDocumentModal, setShowDocumentModal] = useState(false)

  const tabs = [
    { id: 'documents', label: 'My Documents', icon: FileText },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'quotes', label: 'Quotes', icon: FileText },
    { id: 'receipts', label: 'Payment Receipts', icon: Receipt },
    { id: 'profile', label: 'My Profile', icon: User }
  ]

  useEffect(() => {
    if (user) {
      loadDocuments()
    }
  }, [user])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/documents/client/${user.id}`)
      const data = await response.json()
      
      if (data.success) {
        setDocuments(data.documents || [])
      } else {
        console.error('Failed to load documents:', data.message)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredDocuments = () => {
    let filtered = documents

    if (searchTerm) {
      filtered = filtered.filter(doc => 
        (doc.invoice_number || doc.quote_number || doc.transaction_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType)
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  const handleDownloadDocument = async (document) => {
    try {
      const response = await fetch(`/api/documents/generate/${document.type}/${document.id}`, {
        method: 'POST'
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${document.type}-${document.invoice_number || document.quote_number || document.transaction_id}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to download document')
      }
    } catch (error) {
      console.error('Error downloading document:', error)
      alert('Error downloading document')
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
      case 'invoice':
        return FileText
      case 'quote':
        return FileText
      case 'receipt':
        return Receipt
      default:
        return FileText
    }
  }

  const getDocumentTypeLabel = (type) => {
    switch (type) {
      case 'invoice':
        return 'Invoice'
      case 'quote':
        return 'Quote'
      case 'receipt':
        return 'Payment Receipt'
      default:
        return 'Document'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-teal-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Greggory Foundation Client Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {user.profile_photo_blob ? (
                  <img 
                    src={`data:image/jpeg;base64,${user.profile_photo_blob}`}
                    alt={user.display_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-medium">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">{user.display_name}</span>
              </div>
              <button
                onClick={onLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <Clock className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.first_name}!
          </h2>
          <p className="text-gray-600">
            Access your invoices, quotes, and payment receipts all in one place.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
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

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <p className="text-gray-900">{user.first_name} {user.last_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                      <p className="text-gray-900">{user.display_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <p className="text-gray-900 capitalize">{user.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'documents' || activeTab === 'invoices' || activeTab === 'quotes' || activeTab === 'receipts') && (
              <div className="space-y-6">
                {/* Filters */}
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
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">All Documents</option>
                    <option value="invoice">Invoices</option>
                    <option value="quote">Quotes</option>
                    <option value="receipt">Receipts</option>
                  </select>
                </div>

                {/* Documents List */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Document Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Document #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
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
                      {getFilteredDocuments().map((document) => {
                        const Icon = getDocumentIcon(document.type)
                        return (
                          <tr key={document.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Icon className="w-4 h-4 text-gray-400 mr-2" />
                                <span className="text-sm font-medium text-gray-900">
                                  {getDocumentTypeLabel(document.type)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {document.invoice_number || document.quote_number || document.transaction_id}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                              {document.description || 'No description'}
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
                                  onClick={() => handleDownloadDocument(document)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Download PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {getFilteredDocuments().length === 0 && (
                    <div className="text-center py-12">
                      <FileDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No documents found</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {filterType !== 'all' ? 'Try changing the filter' : 'Your documents will appear here once they are generated'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Document Details Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-screen overflow-y-auto m-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {getDocumentTypeLabel(selectedDocument.type)} Details
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
                      <p className="text-sm text-gray-500">Document Type</p>
                      <p className="font-medium">{getDocumentTypeLabel(selectedDocument.type)}</p>
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
                    {selectedDocument.payment_method && (
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-medium">{selectedDocument.payment_method}</p>
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
                onClick={() => handleDownloadDocument(selectedDocument)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientPortal
