import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  Home, 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  DollarSign, 
  Filter,
  Search,
  Star,
  Calendar,
  Phone,
  Mail
} from 'lucide-react'

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    propertyType: searchParams.get('type') || 'all',
    status: searchParams.get('status') || 'available',
    location: searchParams.get('location') || '',
    priceRange: searchParams.get('price') || 'all',
    bedrooms: searchParams.get('bedrooms') || 'all'
  })
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')

  useEffect(() => {
    loadProperties()
    loadCompanies()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.propertyType !== 'all') params.set('type', filters.propertyType)
    if (filters.status !== 'available') params.set('status', filters.status)
    if (filters.location) params.set('location', filters.location)
    if (filters.priceRange !== 'all') params.set('price', filters.priceRange)
    if (filters.bedrooms !== 'all') params.set('bedrooms', filters.bedrooms)
    if (searchTerm) params.set('search', searchTerm)
    setSearchParams(params)
  }, [filters, searchTerm])

  const loadProperties = async () => {
    setLoading(true)
    try {
      // Mock data - replace with actual API call
      const mockProperties = [
        {
          id: 1,
          title: 'Modern 2-Bedroom Apartment',
          description: 'Spacious and modern apartment in the heart of the city with amazing amenities.',
          property_type: 'apartment',
          status: 'available',
          bedrooms: 2,
          bathrooms: 2,
          square_meters: 85,
          price_per_month: 45000,
          location_address: '123 Main Street',
          location_city: 'Nairobi',
          location_country: 'Kenya',
          is_featured: true,
          company_name: 'Greggory Properties',
          company_logo: '/brand-header.png/sja.PNG',
          created_at: '2024-01-15'
        },
        {
          id: 2,
          title: 'Luxury 3-Bedroom Villa',
          description: 'Beautiful villa with private garden and swimming pool in exclusive neighborhood.',
          property_type: 'villa',
          status: 'available',
          bedrooms: 3,
          bathrooms: 3,
          square_meters: 200,
          price_per_month: 85000,
          location_address: '456 Elite Avenue',
          location_city: 'Kikuyu',
          location_country: 'Kenya',
          is_featured: true,
          company_name: 'Greggory Properties',
          company_logo: '/brand-header.png/sja.PNG',
          created_at: '2024-01-10'
        },
        {
          id: 3,
          title: 'Cozy 1-Bedroom Studio',
          description: 'Perfect for singles or couples, fully furnished with modern appliances.',
          property_type: 'apartment',
          status: 'rented',
          bedrooms: 1,
          bathrooms: 1,
          square_meters: 45,
          price_per_month: 25000,
          location_address: '789 Compact Lane',
          location_city: 'Thika',
          location_country: 'Kenya',
          is_featured: false,
          company_name: 'Greggory Properties',
          company_logo: '/brand-header.png/sja.PNG',
          created_at: '2024-01-05'
        }
      ]
      setProperties(mockProperties)
    } catch (error) {
      console.error('Error loading properties:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCompanies = async () => {
    try {
      // Mock data - replace with actual API call
      const mockCompanies = [
        { id: 1, name: 'Greggory Properties', slug: 'greggory-properties' }
      ]
      setCompanies(mockCompanies)
    } catch (error) {
      console.error('Error loading companies:', error)
    }
  }

  const filteredProperties = properties.filter(property => {
    const matchesType = filters.propertyType === 'all' || property.property_type === filters.propertyType
    const matchesStatus = filters.status === 'all' || property.status === filters.status
    const matchesLocation = !filters.location || 
      property.location_city.toLowerCase().includes(filters.location.toLowerCase()) ||
      property.location_address.toLowerCase().includes(filters.location.toLowerCase())
    const matchesSearch = !searchTerm || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBedrooms = filters.bedrooms === 'all' || property.bedrooms.toString() === filters.bedrooms
    
    return matchesType && matchesStatus && matchesLocation && matchesSearch && matchesBedrooms
  })

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'rented': return 'bg-red-100 text-red-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'unavailable': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPropertyTypeIcon = (type) => {
    switch (type) {
      case 'apartment': return <Home className="w-5 h-5" />
      case 'house': return <Home className="w-5 h-5" />
      case 'villa': return <Home className="w-5 h-5" />
      default: return <Home className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Property Listings</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find your perfect home from our curated selection of premium properties
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Property Type */}
            <div>
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="apartment">Apartments</option>
                <option value="house">Houses</option>
                <option value="villa">Villas</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
                <option value="office">Office</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="rented">Rented</option>
                <option value="maintenance">Maintenance</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            {/* Bedrooms */}
            <div>
              <select
                value={filters.bedrooms}
                onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">Any Beds</option>
                <option value="1">1 Bed</option>
                <option value="2">2 Beds</option>
                <option value="3">3 Beds</option>
                <option value="4">4+ Beds</option>
              </select>
            </div>

            {/* Location */}
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

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Property Image */}
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={property.company_logo || '/brand-header.png/sja.PNG'}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/brand-header.png/sja.PNG'
                    }}
                  />
                  {property.is_featured && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(property.status)}`}>
                      {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPropertyTypeIcon(property.property_type)}
                      <span className="text-sm text-gray-500 capitalize">{property.property_type}</span>
                    </div>
                    <div className="text-2xl font-bold text-teal-600">
                      {formatPrice(property.price_per_month)}
                      <span className="text-sm text-gray-500 font-normal">/month</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{property.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{property.location_city}, {property.location_country}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
                    <div className="flex items-center justify-center gap-1">
                      <Bed className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Bath className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Square className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{property.square_meters}m²</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium">
                      View Details
                    </button>
                    <button className="flex-1 border border-teal-600 text-teal-600 py-2 px-4 rounded-lg hover:bg-teal-50 transition-colors text-sm font-medium">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Properties
