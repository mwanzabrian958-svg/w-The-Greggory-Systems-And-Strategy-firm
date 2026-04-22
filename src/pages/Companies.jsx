import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Users, 
  Star,
  Briefcase,
  Home,
  Filter,
  Search,
  Calendar
} from 'lucide-react'

const Companies = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    industry: 'all',
    location: '',
    search: ''
  })

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API call
      const mockCompanies = [
        {
          id: 1,
          name: 'Greggory Properties',
          slug: 'greggory-properties',
          description: 'Premium real estate and property management services offering residential and commercial properties across Kenya. Specializing in modern apartments, luxury villas, and commercial spaces.',
          logo_url: '/brand-header.png/sja.PNG',
          website_url: 'https://greggoryproperties.com',
          contact_email: 'info@greggoryproperties.com',
          contact_phone: '+254799789956',
          address_line1: 'Rafiki Plaza, Kabarak Road',
          address_line2: '',
          city: 'Nairobi',
          state: 'Nairobi County',
          postal_code: '00100',
          country: 'Kenya',
          is_active: true,
          property_count: 15,
          rating: 4.8,
          established_year: 2020,
          services: ['Property Sales', 'Property Management', 'Real Estate Consulting', 'Property Valuation'],
          industry: 'Real Estate'
        },
        {
          id: 2,
          name: 'Greggory Construction',
          slug: 'greggory-construction',
          description: 'Leading construction company specializing in residential, commercial, and infrastructure projects. Committed to quality, safety, and timely delivery.',
          logo_url: '/brand-header.png/sja.PNG',
          website_url: 'https://greggoryconstruction.com',
          contact_email: 'projects@greggoryconstruction.com',
          contact_phone: '+254711123456',
          address_line1: 'Industrial Area, Phase II',
          address_line2: '',
          city: 'Nairobi',
          state: 'Nairobi County',
          postal_code: '00200',
          country: 'Kenya',
          is_active: true,
          project_count: 25,
          rating: 4.6,
          established_year: 2018,
          services: ['Building Construction', 'Infrastructure Development', 'Project Management', 'Architectural Design'],
          industry: 'Construction'
        },
        {
          id: 3,
          name: 'Greggory Consulting',
          slug: 'greggory-consulting',
          description: 'Strategic business consulting firm helping organizations achieve their goals through innovative solutions and expert guidance.',
          logo_url: '/brand-header.png/sja.PNG',
          website_url: 'https://greggoryconsulting.com',
          contact_email: 'consult@greggoryconsulting.com',
          contact_phone: '+254722987654',
          address_line1: 'Westlands Business Center',
          address_line2: '3rd Floor, Wing A',
          city: 'Nairobi',
          state: 'Nairobi County',
          postal_code: '00600',
          country: 'Kenya',
          is_active: true,
          client_count: 50,
          rating: 4.9,
          established_year: 2019,
          services: ['Business Strategy', 'Management Consulting', 'Financial Advisory', 'Digital Transformation'],
          industry: 'Consulting'
        }
      ]
      setCompanies(mockCompanies)
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company => {
    const matchesIndustry = filters.industry === 'all' || company.industry === filters.industry
    const matchesLocation = !filters.location || 
      company.city.toLowerCase().includes(filters.location.toLowerCase()) ||
      company.country.toLowerCase().includes(filters.location.toLowerCase())
    const matchesSearch = !filters.search || 
      company.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      company.description.toLowerCase().includes(filters.search.toLowerCase())
    
    return matchesIndustry && matchesLocation && matchesSearch
  })

  const getIndustryIcon = (industry) => {
    switch (industry) {
      case 'Real Estate': return <Home className="w-6 h-6" />
      case 'Construction': return <Building className="w-6 h-6" />
      case 'Consulting': return <Briefcase className="w-6 h-6" />
      default: return <Building className="w-6 h-6" />
    }
  }

  const getIndustryColor = (industry) => {
    switch (industry) {
      case 'Real Estate': return 'bg-blue-100 text-blue-600'
      case 'Construction': return 'bg-orange-100 text-orange-600'
      case 'Consulting': return 'bg-purple-100 text-purple-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading companies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Building className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Subsidiaries</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Discover our diverse portfolio of subsidiaries delivering excellence across multiple industries
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Industry Filter */}
            <div>
              <select
                value={filters.industry}
                onChange={(e) => setFilters({...filters, industry: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Industries</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Construction">Construction</option>
                <option value="Consulting">Consulting</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <input
                type="text"
                placeholder="Location..."
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Company Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${getIndustryColor(company.industry)}`}>
                        {getIndustryIcon(company.industry)}
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">{company.industry}</span>
                        <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{company.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-3">{company.description}</p>
                </div>

                {/* Company Stats */}
                <div className="p-6 border-b bg-gray-50">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-teal-600">
                        {company.property_count || company.project_count || company.client_count || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        {company.property_count ? 'Properties' : company.project_count ? 'Projects' : 'Clients'}
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {new Date().getFullYear() - company.established_year}+
                      </div>
                      <div className="text-xs text-gray-500">Years</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {company.services.length}
                      </div>
                      <div className="text-xs text-gray-500">Services</div>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="p-6 border-b">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {company.services.map((service, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {company.address_line1}, {company.city}, {company.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{company.contact_phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{company.contact_email}</span>
                    </div>
                    {company.website_url && (
                      <div className="flex items-center gap-3 text-sm">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a
                          href={company.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:text-teal-700"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-gray-50 border-t">
                  <div className="flex gap-3">
                    <Link
                      to={`/companies/${company.slug}`}
                      className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors text-center text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <button className="flex-1 border border-teal-600 text-teal-600 py-2 px-4 rounded-lg hover:bg-teal-50 transition-colors text-sm font-medium">
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Partner With Us</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our network of successful companies and unlock new opportunities for growth and collaboration
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-teal-600 py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
              Become a Partner
            </button>
            <button className="border border-white text-white py-3 px-6 rounded-lg hover:bg-white hover:text-teal-600 transition-colors font-semibold">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Companies
