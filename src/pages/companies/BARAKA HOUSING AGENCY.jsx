import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import { propertiesAPI, managementAPI } from '../services/api';

export default function HousingAgency() {
  const title = 'BARAKA HOUSING AGENCY — Greggory Properties';
  const metaDescription = 'BARAKA HOUSING AGENCY is Greggory Properties\' property management company in Kangundo, serving Kangundo, Tala, and surrounding areas.';

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null); // For feature dropdown
  const [propertyRooms, setPropertyRooms] = useState({}); // Individual room states for each property
  const [buildingSearch, setBuildingSearch] = useState(''); // Search for buildings
  const [contactInfo, setContactInfo] = useState({
    stationManager: 'MD Damarice',
    serviceArea: 'Kangundo, Tala, and surrounding areas',
    baseLocation: 'Kangundo'
  });

  // API states
  const [allProperties, setAllProperties] = useState([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    uniqueBuildings: 0,
    uniqueLocations: 0,
    occupancyRate: 95
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Temporarily use mock data instead of API calls
        const mockProperties = [
          { id: 1, type_name: 'apartments', name: '2-Bedroom Apartment', building: 'Baraka Heights', location: 'Kangundo', price: 25000, tags: ['Spacious', 'Balcony'], image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e1?w=400&h=300&fit=crop' },
          { id: 2, type_name: 'apartments', name: '1-Bedroom Apartment', building: 'Greggory Court', location: 'Kangundo-Tala Rd', price: 15000, tags: ['Modern', 'Parking'], image: 'https://images.unsplash.com/photo-1522708323590-d57dbb4a0700?w=400&h=300&fit=crop' },
          { id: 3, type_name: 'single-rooms', name: 'Single Room', building: 'Tala Plaza', location: 'Tala Market', price: 4000, tags: ['Shared', 'Kitchen'], image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop' },
          { id: 4, type_name: 'bedsitters', name: 'Bedsitter', building: 'Baraka Heights', location: 'Kangundo', price: 8000, tags: ['Self-contained', 'Kitchenette'], image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop' },
          { id: 5, type_name: '1-bedroom', name: '1 Bedroom House', building: 'Greggory Court', location: 'Kangundo-Tala Rd', price: 15000, tags: ['Spacious', 'Parking'], image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop' },
          { id: 6, type_name: '2-plus-bedrooms', name: '2 Bedroom House', building: 'Greggory Court', location: 'Kangundo-Tala Rd', price: 25000, tags: ['Family', 'Garden'], image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop' },
        ];
        
        setAllProperties(mockProperties);
        setStats({
          totalProperties: mockProperties.length,
          uniqueBuildings: [...new Set(mockProperties.map(p => p.building))].length,
          uniqueLocations: [...new Set(mockProperties.map(p => p.location))].length,
          occupancyRate: 95
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Categories
  const goToPreviousRoom = (propertyId) => {
    setPropertyRooms(prev => ({
      ...prev,
      [propertyId]: Math.max(1, (prev[propertyId] || 1) - 1)
    }));
  };

  const goToNextRoom = (propertyId) => {
    setPropertyRooms(prev => ({
      ...prev,
      [propertyId]: Math.min(20, (prev[propertyId] || 1) + 1)
    }));
  };

  const getCurrentRoom = (propertyId) => {
    return propertyRooms[propertyId] || 1;
  };

  // Form handling functions
  const openApplicationForm = (property) => {
    const formUrl = `/application-form?propertyId=${property.id}&roomId=${getCurrentRoom(property.id)}`;
    window.open(formUrl, '_blank');
  };

  useEffect(() => {
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = metaDescription;
    return () => {
      // optionally restore previous title (no-op here)
    }
  }, []);

  const categories = [
    { id: 'all', name: 'All Properties' },
    { id: 'apartments', name: 'Apartments' },
    { id: 'single-rooms', name: 'Single Rooms' },
    { id: 'bedsitters', name: 'Bedsitters' },
    { id: '1-bedroom', name: '1 Bedroom' },
    { id: '2-plus-bedrooms', name: '2+ Bedrooms' }
  ];

  const filteredProperties = allProperties.filter(property => {
    const matchesCategory = selectedCategory === 'all' || property.type_name === selectedCategory;
    const matchesBuilding = buildingSearch === '' || property.building.toLowerCase().includes(buildingSearch.toLowerCase());
    return matchesCategory && matchesBuilding;
  });

  const getCategoryIcon = (type) => {
    const icons = {
      'apartments': 'text-blue-600',
      'single-rooms': 'text-green-600', 
      'bedsitters': 'text-purple-600',
      '1-bedroom': 'text-orange-600',
      '2-plus-bedrooms': 'text-red-600'
    };
    return icons[type] || 'text-gray-600';
  };

  const getCategoryBg = (type) => {
    const backgrounds = {
      'apartments': 'bg-blue-100',
      'single-rooms': 'bg-green-100',
      'bedsitters': 'bg-purple-100', 
      '1-bedroom': 'bg-orange-100',
      '2-plus-bedrooms': 'bg-red-100'
    };
    return backgrounds[type] || 'bg-gray-100';
  };

  const getCategoryLabel = (type) => {
    const labels = {
      'apartments': 'Apartments',
      'single-rooms': 'Single Rooms',
      'bedsitters': 'Bedsitters',
      '1-bedroom': '1 Bedroom', 
      '2-plus-bedrooms': '2+ Bedrooms'
    };
    return labels[type] || type;
  };

  const services = [
    {
      id: 'rental',
      title: 'Property Rental',
      icon: '🏠',
      description: 'Find your perfect rental property',
      details: [
        'Wide selection of apartments, rooms, and houses',
        'Flexible lease terms',
        'Affordable monthly rates',
        'Properties in Kangundo, Tala, and surrounding areas'
      ],
      color: 'blue'
    },
    {
      id: 'management',
      title: 'Property Management',
      icon: '🔑',
      description: 'Comprehensive property management services',
      details: [
        'Tenant screening and selection',
        'Rent collection and financial reporting',
        'Property maintenance coordination',
        'Legal compliance and documentation'
      ],
      color: 'green'
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      icon: '🔧',
      description: 'Property maintenance',
      details: [
        '24/7 emergency repairs',
        'Regular property inspections',
        'Preventive maintenance programs',
        'Licensed and insured contractors'
      ],
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-teal-600/10"></div>
        <div className="relative max-w-6xl mx-auto py-20 px-4">
          <div className="text-center mb-12">
            <Link to="/" className="inline-block mb-8">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-gray-200/50 transform hover:scale-105 transition-transform duration-300">
                <h2 className="text-3xl font-bold text-navy-900 text-center mb-3">BARAKA HOUSING AGENCY</h2>
                <p className="text-green-600 font-bold text-2xl text-center">Property Management Excellence</p>
              </div>
            </Link>
          </div>
          
          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100">
            <div className="text-center mb-8">
              <img 
                src="/brand-header.png/sam.PNG" 
                alt="BARAKA HOUSING AGENCY" 
                className="h-24 mx-auto mb-4 rounded"
              />
              <h2 className="text-2xl font-bold text-navy-900 mb-4">BARAKA HOUSING AGENCY</h2>
              <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
                Your trusted partner for exceptional property management solutions in Kangundo, Tala, and surrounding areas. We deliver excellence in residential and commercial property services with unmatched dedication and professionalism.
              </p>
            </div>
            
            {/* Our Services Section */}
            <section className="mb-16">
              <h3 className="text-2xl font-bold text-navy-900 mb-8 text-center">Our Services</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                    className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl ${
                      selectedService === service.id ? 'ring-2 ring-teal-500 transform scale-105' : ''
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${
                      service.color === 'blue' ? 'bg-blue-100' :
                      service.color === 'green' ? 'bg-green-100' :
                      'bg-purple-100'
                    }`}>
                      <span className="text-2xl">{service.icon}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 text-center">{service.title}</h3>
                    <p className="text-sm text-gray-600 text-center mb-4">{service.description}</p>
                    
                    {/* Expandable Details */}
                    <div className={`overflow-hidden transition-all duration-300 ${
                      selectedService === service.id ? 'max-h-64' : 'max-h-0'
                    }`}>
                      <div className="border-t pt-4 mt-4">
                        <h4 className="font-semibold text-gray-800 mb-3 text-sm">What we offer:</h4>
                        <ul className="space-y-2">
                          {service.details.map((detail, index) => (
                            <li key={index} className="flex items-start text-sm text-gray-700">
                              <span className="text-teal-500 mr-2 mt-1">✓</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                        <button className="mt-4 w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium">
                          Learn More
                        </button>
                      </div>
                    </div>
                    
                    {/* Click hint when not expanded */}
                    {selectedService !== service.id && (
                      <p className="text-xs text-gray-500 text-center mt-4 italic">Click to learn more</p>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Service Actions */}
              <div className="mt-8 text-center">
                <p className="text-gray-700 mb-4">Need help with any of our services?</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <button className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-lg">
                    Contact Us
                  </button>
                </div>
              </div>
            </section>
            
            {/* Property Catalogue Section */}
            <section className="mb-16">
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Right Side - Content */}
                <div className="lg:w-full">
                  <h3 className="text-2xl font-bold text-navy-900 mb-8 text-center flex items-center justify-center gap-2">
                  <img 
                    src="/brand-header.png/sam.PNG" 
                    alt="Property Catalogue" 
                    className="h-8 rounded"
                  />
                  Property Catalogue
                </h3>
                  
                  {/* Property Type Filters */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                          selectedCategory === category.id
                            ? 'bg-teal-600 text-white shadow-lg transform scale-105'
                            : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col items-center mb-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Available Properties</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Showing <span className="font-bold text-navy-900">{filteredProperties.length}</span> properties
                        {selectedCategory !== 'all' && (
                          <span> in <span className="font-bold text-navy-900">{getCategoryLabel(selectedCategory)}</span></span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={buildingSearch}
                          onChange={(e) => setBuildingSearch(e.target.value)}
                          placeholder="Search building name..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm w-64"
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
                      </div>
                    </div>
                  </div>

              {/* Filtered Properties Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-4 text-gray-600">Loading properties...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-600">{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <div
                    key={property.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className={`h-2 ${getCategoryBg(property.type_name)}`}></div>
                    <div className="p-6">
                      {/* Building Photo */}
                      <div className="mb-4">
                        <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden group cursor-pointer">
                          {property.image ? (
                            <img 
                              src={property.image} 
                              alt={property.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center">
                              <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              <span className="text-gray-400 text-sm">Add Photo</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-200 flex items-center justify-center">
                            <button className="opacity-0 group-hover:opacity-100 bg-teal-600 text-white px-3 py-1 rounded text-sm transition-opacity duration-200">
                              {property.image ? 'Change Photo' : 'Add Photo'}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Property Information */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-1">Property Name</h4>
                          <p className="text-sm text-gray-600">Building Name</p>
                        </div>
                        
                        <div className="flex items-center text-gray-700">
                          <span className="text-sm mr-2">📍</span>
                          <span className="text-sm">Location Address</span>
                        </div>
                        
                        <div className="flex items-center text-gray-700">
                          <span className="text-sm mr-2">🏢</span>
                          <span className="text-sm">Floor: 1st Floor</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-700">
                            <span className="text-sm mr-2">🔢</span>
                            <span className="text-sm">Room: {getCurrentRoom(property.id)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => goToPreviousRoom(property.id)}
                              disabled={getCurrentRoom(property.id) === 1}
                              className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                              title="Previous Room"
                            >
                              <span className="text-gray-500 hover:text-gray-700">◀</span>
                            </button>
                            <div className="px-3 py-1 bg-gray-100 rounded border border-gray-300 min-w-[3rem] text-center">
                              <span className="text-sm font-medium text-gray-800">{getCurrentRoom(property.id)}</span>
                            </div>
                            <button 
                              onClick={() => goToNextRoom(property.id)}
                              disabled={getCurrentRoom(property.id) === 20}
                              className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                              title="Next Room"
                            >
                              <span className="text-gray-500 hover:text-gray-700">▶</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-teal-600">
                            <span className="text-sm mr-1">💰</span>
                            <span className="font-bold">KES 0,000/month</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <button 
                            onClick={() => setSelectedFeature(selectedFeature === 'feature1' ? null : 'feature1')}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-teal-100 hover:text-teal-700 transition-colors cursor-pointer"
                          >
                            Feature 1
                          </button>
                        </div>
                        
                        {/* Feature Dropdown - Room Specific Information */}
                        <div className={`overflow-hidden transition-all duration-300 ${
                          selectedFeature ? 'max-h-64' : 'max-h-0'
                        }`}>
                          <div className="border-t pt-3 mt-3">
                            <h4 className="font-semibold text-gray-800 mb-3 text-sm">Room {getCurrentRoom(property.id)} - {property.building} Details:</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-gray-100 rounded-lg p-2">
                                <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center mb-1">
                                  <span className="text-gray-400 text-xs">Room {getCurrentRoom(property.id)} View</span>
                                </div>
                                <p className="text-xs text-gray-600 text-center">Room {getCurrentRoom(property.id)} - {property.location}</p>
                              </div>
                              <div className="bg-gray-100 rounded-lg p-2">
                                <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center mb-1">
                                  <span className="text-gray-400 text-xs">{property.building}</span>
                                </div>
                                <p className="text-xs text-gray-600 text-center">{property.building} - Floor {Math.ceil(getCurrentRoom(property.id) / 10)}</p>
                              </div>
                              <div className="bg-gray-100 rounded-lg p-2">
                                <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center mb-1">
                                  <span className="text-gray-400 text-xs">Room {getCurrentRoom(property.id)} Interior</span>
                                </div>
                                <p className="text-xs text-gray-600 text-center">Interior - Room {getCurrentRoom(property.id)}</p>
                              </div>
                              <div className="bg-gray-100 rounded-lg p-2">
                                <div className="w-full h-20 bg-gray-200 rounded flex items-center justify-center mb-1">
                                  <span className="text-gray-400 text-xs">Amenities {getCurrentRoom(property.id)}</span>
                                </div>
                                <p className="text-xs text-gray-600 text-center">Room {getCurrentRoom(property.id)} Features</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => openApplicationForm(property)}
                        className="mt-4 w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors duration-200 font-medium"
                      >
                        View application form
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              )}

              {/* No Results Message */}
              {filteredProperties.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-700 text-lg">No properties found in this category.</p>
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className="mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    View All Properties
                  </button>
                </div>
              )}

              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-lg p-6 text-white mt-8">
                <div className="grid md:grid-cols-4 gap-6 text-center">
                  <div>
                    <p className="text-3xl font-bold mb-1">{stats.totalProperties}</p>
                    <p className="text-sm opacity-90">Total Properties</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold mb-1">{stats.uniqueBuildings}</p>
                    <p className="text-sm opacity-90">Buildings</p>
                  </div>
                      <div>
                    <p className="text-3xl font-bold mb-1">{stats.uniqueLocations}</p>
                    <p className="text-sm opacity-90">Locations</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold mb-1">{stats.occupancyRate}%</p>
                    <p className="text-sm opacity-90">Occupancy Rate</p>
                  </div>
                </div>
              </div>
                </div>
              </div>
            </section>
            
            {/* Contact Section */}
            <div className="bg-gradient-to-r from-navy-50 to-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Management Information</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Station Manager</p>
                    <p className="text-gray-600">{contactInfo.stationManager}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Service Area</p>
                    <p className="text-gray-600">{contactInfo.serviceArea}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Base Location</p>
                    <p className="text-gray-600">{contactInfo.baseLocation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
