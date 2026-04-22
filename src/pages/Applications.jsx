import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FileText, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Search,
  Filter,
  AlertCircle,
  Home
} from 'lucide-react'

const Applications = () => {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    propertyType: 'all',
    dateRange: 'all',
    search: ''
  })
  const [selectedApplication, setSelectedApplication] = useState(null)

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API call
      const mockApplications = [
        {
          id: 1,
          property_id: 1,
          property_title: 'Modern 2-Bedroom Apartment',
          property_type: 'apartment',
          user_id: 1,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone_number: '+254712345678',
          employment_status: 'Employed',
          monthly_income: 85000,
          current_address: '123 Current Street, Nairobi',
          move_in_date: '2024-02-01',
          lease_duration_months: 12,
          additional_info: 'Looking for a quiet neighborhood with good security.',
          status: 'pending',
          application_date: '2024-01-15T10:30:00',
          reviewed_at: null,
          reviewed_by: null,
          property_price: 45000,
          property_location: 'Nairobi',
          property_bedrooms: 2,
          documents: ['id_copy', 'payslip', 'employment_letter']
        },
        {
          id: 2,
          property_id: 2,
          property_title: 'Luxury 3-Bedroom Villa',
          property_type: 'villa',
          user_id: 2,
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@example.com',
          phone_number: '+254723456789',
          employment_status: 'Self-employed',
          monthly_income: 150000,
          current_address: '456 Business Avenue, Nairobi',
          move_in_date: '2024-03-01',
          lease_duration_months: 24,
          additional_info: 'Business owner looking for family home with office space.',
          status: 'approved',
          application_date: '2024-01-10T14:20:00',
          reviewed_at: '2024-01-12T09:15:00',
          reviewed_by: 'Admin',
          property_price: 85000,
          property_location: 'Kikuyu',
          property_bedrooms: 3,
          documents: ['id_copy', 'tax_returns', 'business_license']
        },
        {
          id: 3,
          property_id: 3,
          property_title: 'Cozy 1-Bedroom Studio',
          property_type: 'apartment',
          user_id: 3,
          first_name: 'Mike',
          last_name: 'Johnson',
          email: 'mike.johnson@example.com',
          phone_number: '+254734567890',
          employment_status: 'Student',
          monthly_income: 25000,
          current_address: '789 Student Hostel, Nairobi',
          move_in_date: '2024-02-15',
          lease_duration_months: 6,
          additional_info: 'University student looking for affordable accommodation near campus.',
          status: 'rejected',
          application_date: '2024-01-05T16:45:00',
          reviewed_at: '2024-01-07T11:30:00',
          reviewed_by: 'Admin',
          property_price: 25000,
          property_location: 'Thika',
          property_bedrooms: 1,
          documents: ['id_copy', 'student_id', 'guarantor_letter']
        }
      ]
      setApplications(mockApplications)
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filters.status === 'all' || app.status === filters.status
    const matchesPropertyType = filters.propertyType === 'all' || app.property_type === filters.propertyType
    const matchesSearch = !filters.search || 
      `${app.first_name} ${app.last_name}`.toLowerCase().includes(filters.search.toLowerCase()) ||
      app.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      app.property_title.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesStatus && matchesPropertyType && matchesSearch
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'withdrawn': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'withdrawn': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      // Update application status - replace with actual API call
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus, reviewed_at: new Date().toISOString() }
            : app
        )
      )
    } catch (error) {
      console.error('Error updating application status:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Applications</h1>
              <p className="text-gray-600 mt-1">Manage and review rental applications</p>
            </div>
            <button
              onClick={() => navigate('/application-form')}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              New Application
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            {/* Property Type Filter */}
            <div>
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Property Types</option>
                <option value="apartment">Apartments</option>
                <option value="house">Houses</option>
                <option value="villa">Villas</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Application Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.first_name} {application.last_name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <span>{application.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <span>{application.phone_number}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Applied: {formatDate(application.application_date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="Download">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Property</div>
                      <div className="font-medium text-gray-900">{application.property_title}</div>
                      <div className="text-sm text-gray-600">{application.property_location}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Monthly Rent</div>
                      <div className="font-medium text-gray-900">{formatCurrency(application.property_price)}</div>
                      <div className="text-sm text-gray-600">{application.property_bedrooms} Bedrooms</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Lease Terms</div>
                      <div className="font-medium text-gray-900">{application.lease_duration_months} months</div>
                      <div className="text-sm text-gray-600">Move in: {new Date(application.move_in_date).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Applicant Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Employment Status</div>
                      <div className="font-medium text-gray-900">{application.employment_status}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Monthly Income</div>
                      <div className="font-medium text-gray-900">{formatCurrency(application.monthly_income)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Current Address</div>
                      <div className="font-medium text-gray-900 text-sm">{application.current_address}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  {application.status === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'approved')}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Approve Application
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(application.id, 'rejected')}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Reject Application
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Applicant Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Applicant Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Full Name</label>
                    <p className="font-medium">{selectedApplication.first_name} {selectedApplication.last_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="font-medium">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Phone</label>
                    <p className="font-medium">{selectedApplication.phone_number}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Current Address</label>
                    <p className="font-medium">{selectedApplication.current_address}</p>
                  </div>
                </div>
              </div>

              {/* Employment Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Employment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Employment Status</label>
                    <p className="font-medium">{selectedApplication.employment_status}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Monthly Income</label>
                    <p className="font-medium">{formatCurrency(selectedApplication.monthly_income)}</p>
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Property Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Property</label>
                    <p className="font-medium">{selectedApplication.property_title}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Monthly Rent</label>
                    <p className="font-medium">{formatCurrency(selectedApplication.property_price)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Lease Duration</label>
                    <p className="font-medium">{selectedApplication.lease_duration_months} months</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Move-in Date</label>
                    <p className="font-medium">{new Date(selectedApplication.move_in_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {selectedApplication.additional_info && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Information</h3>
                  <p className="text-gray-700">{selectedApplication.additional_info}</p>
                </div>
              )}

              {/* Documents */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Submitted Documents</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.documents.map((doc, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {doc.replace('_', ' ').charAt(0).toUpperCase() + doc.replace('_', ' ').slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              {selectedApplication.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedApplication.id, 'approved')
                      setSelectedApplication(null)
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Approve Application
                  </button>
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedApplication.id, 'rejected')
                      setSelectedApplication(null)
                    }}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Reject Application
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedApplication(null)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Applications
