import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const HousingAgency = () => {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [propertyFloors, setPropertyFloors] = useState({})
  const [propertyRooms, setPropertyRooms] = useState({})
  const [roomOccupiedStatus, setRoomOccupiedStatus] = useState({}) // Track occupied status by propertyId and room number

  // Sample database lease PDF records - in real app this would come from DB
  const sampleLeasePDFDB = {
    // Property 1 - Lease agreements for specific rooms
    '1-1': { available: true, fileName: 'lease_1_1.pdf', title: 'Modern Apartment - Room 1 Lease Agreement' },
    '1-2': { available: true, fileName: 'lease_1_2.pdf', title: 'Modern Apartment - Room 2 Lease Agreement' },
    '1-3': { available: false, fileName: null, title: null }, // No lease available
    '1-4': { available: true, fileName: 'lease_1_4.pdf', title: 'Modern Apartment - Room 4 Lease Agreement' },
    '1-5': { available: true, fileName: 'lease_1_5.pdf', title: 'Modern Apartment - Room 5 Lease Agreement' },
    '1-6': { available: false, fileName: null, title: null },
    '1-7': { available: true, fileName: 'lease_1_7.pdf', title: 'Modern Apartment - Room 7 Lease Agreement' },
    '1-8': { available: true, fileName: 'lease_1_8.pdf', title: 'Modern Apartment - Room 8 Lease Agreement' },
    '1-9': { available: false, fileName: null, title: null },
    '1-10': { available: true, fileName: 'lease_1_10.pdf', title: 'Modern Apartment - Room 10 Lease Agreement' },
    '1-11': { available: true, fileName: 'lease_1_11.pdf', title: 'Modern Apartment - Room 11 Lease Agreement' },
    '1-12': { available: false, fileName: null, title: null },
    '1-13': { available: true, fileName: 'lease_1_13.pdf', title: 'Modern Apartment - Room 13 Lease Agreement' },
    '1-14': { available: true, fileName: 'lease_1_14.pdf', title: 'Modern Apartment - Room 14 Lease Agreement' },
    '1-15': { available: false, fileName: null, title: null },
    '1-16': { available: true, fileName: 'lease_1_16.pdf', title: 'Modern Apartment - Room 16 Lease Agreement' },
    '1-17': { available: true, fileName: 'lease_1_17.pdf', title: 'Modern Apartment - Room 17 Lease Agreement' },
    '1-18': { available: false, fileName: null, title: null },
    '1-19': { available: true, fileName: 'lease_1_19.pdf', title: 'Modern Apartment - Room 19 Lease Agreement' },
    '1-20': { available: true, fileName: 'lease_1_20.pdf', title: 'Modern Apartment - Room 20 Lease Agreement' },
    
    // Property 2 - Lease agreements
    '2-1': { available: true, fileName: 'lease_2_1.pdf', title: 'Cozy Studio - Room 1 Lease Agreement' },
    '2-2': { available: false, fileName: null, title: null },
    '2-3': { available: true, fileName: 'lease_2_3.pdf', title: 'Cozy Studio - Room 3 Lease Agreement' },
    '2-4': { available: true, fileName: 'lease_2_4.pdf', title: 'Cozy Studio - Room 4 Lease Agreement' },
    '2-5': { available: false, fileName: null, title: null },
    '2-6': { available: true, fileName: 'lease_2_6.pdf', title: 'Cozy Studio - Room 6 Lease Agreement' },
    '2-7': { available: true, fileName: 'lease_2_7.pdf', title: 'Cozy Studio - Room 7 Lease Agreement' },
    '2-8': { available: false, fileName: null, title: null },
    '2-9': { available: true, fileName: 'lease_2_9.pdf', title: 'Cozy Studio - Room 9 Lease Agreement' },
    '2-10': { available: true, fileName: 'lease_2_10.pdf', title: 'Cozy Studio - Room 10 Lease Agreement' },
    '2-11': { available: false, fileName: null, title: null },
    '2-12': { available: true, fileName: 'lease_2_12.pdf', title: 'Cozy Studio - Room 12 Lease Agreement' },
    '2-13': { available: true, fileName: 'lease_2_13.pdf', title: 'Cozy Studio - Room 13 Lease Agreement' },
    '2-14': { available: false, fileName: null, title: null },
    '2-15': { available: true, fileName: 'lease_2_15.pdf', title: 'Cozy Studio - Room 15 Lease Agreement' },
    '2-16': { available: true, fileName: 'lease_2_16.pdf', title: 'Cozy Studio - Room 16 Lease Agreement' },
    '2-17': { available: false, fileName: null, title: null },
    '2-18': { available: true, fileName: 'lease_2_18.pdf', title: 'Cozy Studio - Room 18 Lease Agreement' },
    '2-19': { available: true, fileName: 'lease_2_19.pdf', title: 'Cozy Studio - Room 19 Lease Agreement' },
    '2-20': { available: false, fileName: null, title: null },
    '2-21': { available: true, fileName: 'lease_2_21.pdf', title: 'Cozy Studio - Room 21 Lease Agreement' },
    '2-22': { available: true, fileName: 'lease_2_22.pdf', title: 'Cozy Studio - Room 22 Lease Agreement' },
    '2-23': { available: false, fileName: null, title: null },
    '2-24': { available: true, fileName: 'lease_2_24.pdf', title: 'Cozy Studio - Room 24 Lease Agreement' },
    
    // Property 3 - Lease agreements
    '3-1': { available: true, fileName: 'lease_3_1.pdf', title: 'Single Room - Room 1 Lease Agreement' },
    '3-2': { available: false, fileName: null, title: null },
    '3-3': { available: true, fileName: 'lease_3_3.pdf', title: 'Single Room - Room 3 Lease Agreement' },
    '3-4': { available: true, fileName: 'lease_3_4.pdf', title: 'Single Room - Room 4 Lease Agreement' },
    '3-5': { available: false, fileName: null, title: null },
    '3-6': { available: true, fileName: 'lease_3_6.pdf', title: 'Single Room - Room 6 Lease Agreement' },
    '3-7': { available: false, fileName: null, title: null },
    '3-8': { available: true, fileName: 'lease_3_8.pdf', title: 'Single Room - Room 8 Lease Agreement' },
    '3-9': { available: true, fileName: 'lease_3_9.pdf', title: 'Single Room - Room 9 Lease Agreement' },
    '3-10': { available: false, fileName: null, title: null },
    '3-11': { available: true, fileName: 'lease_3_11.pdf', title: 'Single Room - Room 11 Lease Agreement' },
    '3-12': { available: false, fileName: null, title: null },
    '3-13': { available: true, fileName: 'lease_3_13.pdf', title: 'Single Room - Room 13 Lease Agreement' },
    '3-14': { available: true, fileName: 'lease_3_14.pdf', title: 'Single Room - Room 14 Lease Agreement' },
    '3-15': { available: false, fileName: null, title: null },
    
    // Property 4 - Lease agreements
    '4-1': { available: true, fileName: 'lease_4_1.pdf', title: 'Bedsitter - Room 1 Lease Agreement' },
    '4-2': { available: false, fileName: null, title: null },
    '4-3': { available: true, fileName: 'lease_4_3.pdf', title: 'Bedsitter - Room 3 Lease Agreement' },
    '4-4': { available: true, fileName: 'lease_4_4.pdf', title: 'Bedsitter - Room 4 Lease Agreement' },
    '4-5': { available: false, fileName: null, title: null },
    '4-6': { available: true, fileName: 'lease_4_6.pdf', title: 'Bedsitter - Room 6 Lease Agreement' },
    '4-7': { available: false, fileName: null, title: null },
    '4-8': { available: true, fileName: 'lease_4_8.pdf', title: 'Bedsitter - Room 8 Lease Agreement' },
    '4-9': { available: true, fileName: 'lease_4_9.pdf', title: 'Bedsitter - Room 9 Lease Agreement' },
    '4-10': { available: false, fileName: null, title: null },
    '4-11': { available: true, fileName: 'lease_4_11.pdf', title: 'Bedsitter - Room 11 Lease Agreement' },
    '4-12': { available: false, fileName: null, title: null },
    '4-13': { available: true, fileName: 'lease_4_13.pdf', title: 'Bedsitter - Room 13 Lease Agreement' },
    '4-14': { available: false, fileName: null, title: null },
    '4-15': { available: true, fileName: 'lease_4_15.pdf', title: 'Bedsitter - Room 15 Lease Agreement' },
    '4-16': { available: true, fileName: 'lease_4_16.pdf', title: 'Bedsitter - Room 16 Lease Agreement' },
    '4-17': { available: false, fileName: null, title: null },
    '4-18': { available: true, fileName: 'lease_4_18.pdf', title: 'Bedsitter - Room 18 Lease Agreement' },
    
    // Property 5 - Lease agreements
    '5-1': { available: true, fileName: 'lease_5_1.pdf', title: 'One Bedroom Deluxe - Room 1 Lease Agreement' },
    '5-2': { available: false, fileName: null, title: null },
    '5-3': { available: true, fileName: 'lease_5_3.pdf', title: 'One Bedroom Deluxe - Room 3 Lease Agreement' },
    '5-4': { available: true, fileName: 'lease_5_4.pdf', title: 'One Bedroom Deluxe - Room 4 Lease Agreement' },
    '5-5': { available: false, fileName: null, title: null },
    '5-6': { available: true, fileName: 'lease_5_6.pdf', title: 'One Bedroom Deluxe - Room 6 Lease Agreement' },
    '5-7': { available: false, fileName: null, title: null },
    '5-8': { available: true, fileName: 'lease_5_8.pdf', title: 'One Bedroom Deluxe - Room 8 Lease Agreement' },
    '5-9': { available: true, fileName: 'lease_5_9.pdf', title: 'One Bedroom Deluxe - Room 9 Lease Agreement' },
    '5-10': { available: false, fileName: null, title: null },
    '5-11': { available: true, fileName: 'lease_5_11.pdf', title: 'One Bedroom Deluxe - Room 11 Lease Agreement' },
    '5-12': { available: true, fileName: 'lease_5_12.pdf', title: 'One Bedroom Deluxe - Room 12 Lease Agreement' },
    
    // Property 6 - Lease agreements
    '6-1': { available: true, fileName: 'lease_6_1.pdf', title: '2 Bedroom House - Room 1 Lease Agreement' },
    '6-2': { available: false, fileName: null, title: null },
    '6-3': { available: true, fileName: 'lease_6_3.pdf', title: '2 Bedroom House - Room 3 Lease Agreement' },
    '6-4': { available: false, fileName: null, title: null },
    '6-5': { available: true, fileName: 'lease_6_5.pdf', title: '2 Bedroom House - Room 5 Lease Agreement' },
    '6-6': { available: false, fileName: null, title: null },
    '6-7': { available: true, fileName: 'lease_6_7.pdf', title: '2 Bedroom House - Room 7 Lease Agreement' },
    '6-8': { available: false, fileName: null, title: null },
    '6-9': { available: true, fileName: 'lease_6_9.pdf', title: '2 Bedroom House - Room 9 Lease Agreement' },
    
    // Property 7 - Lease agreements
    '7-1': { available: true, fileName: 'lease_7_1.pdf', title: '3 Bedroom Apartment - Room 1 Lease Agreement' },
    '7-2': { available: false, fileName: null, title: null },
    '7-3': { available: true, fileName: 'lease_7_3.pdf', title: '3 Bedroom Apartment - Room 3 Lease Agreement' },
    '7-4': { available: false, fileName: null, title: null },
    '7-5': { available: true, fileName: 'lease_7_5.pdf', title: '3 Bedroom Apartment - Room 5 Lease Agreement' },
    '7-6': { available: false, fileName: null, title: null },
    '7-7': { available: true, fileName: 'lease_7_7.pdf', title: '3 Bedroom Apartment - Room 7 Lease Agreement' },
    '7-8': { available: false, fileName: null, title: null },
    '7-9': { available: true, fileName: 'lease_7_9.pdf', title: '3 Bedroom Apartment - Room 9 Lease Agreement' },
    '7-10': { available: false, fileName: null, title: null },
    '7-11': { available: true, fileName: 'lease_7_11.pdf', title: '3 Bedroom Apartment - Room 11 Lease Agreement' },
    '7-12': { available: false, fileName: null, title: null },
    '7-13': { available: true, fileName: 'lease_7_13.pdf', title: '3 Bedroom Apartment - Room 13 Lease Agreement' },
    '7-14': { available: false, fileName: null, title: null },
    '7-15': { available: true, fileName: 'lease_7_15.pdf', title: '3 Bedroom Apartment - Room 15 Lease Agreement' },
    '7-16': { available: false, fileName: null, title: null },
    '7-17': { available: true, fileName: 'lease_7_17.pdf', title: '3 Bedroom Apartment - Room 17 Lease Agreement' },
    '7-18': { available: false, fileName: null, title: null },
  }

  // Sample database room status records - in real app this would come from DB
  const sampleRoomStatusDB = {
    // Property 1 (Modern Apartment) - Sequential room numbering
    // Ground Floor (0): Rooms 1-10
    '1-1': false,  // Room 1 is available
    '1-2': true,   // Room 2 is occupied
    '1-3': false,  // Room 3 is available
    '1-4': true,   // Room 4 is occupied
    '1-5': false,  // Room 5 is available
    '1-6': false,  // Room 6 is available
    '1-7': true,   // Room 7 is occupied
    '1-8': false,  // Room 8 is available
    '1-9': false,  // Room 9 is available
    '1-10': true,  // Room 10 is occupied
    // Floor 1: Rooms 11-20
    '1-11': false, // Room 11 is available
    '1-12': true,  // Room 12 is occupied
    '1-13': false, // Room 13 is available
    '1-14': false, // Room 14 is available
    '1-15': true,  // Room 15 is occupied
    '1-16': false, // Room 16 is available
    '1-17': true,  // Room 17 is occupied
    '1-18': false, // Room 18 is available
    '1-19': false, // Room 19 is available
    '1-20': true,  // Room 20 is occupied
    // Floor 2: Rooms 21-30
    '1-21': false, // Room 21 is available
    '1-22': true,  // Room 22 is occupied
    '1-23': false, // Room 23 is available
    '1-24': false, // Room 24 is available
    '1-25': true,  // Room 25 is occupied
    '1-26': false, // Room 26 is available
    '1-27': false, // Room 27 is available
    '1-28': true,  // Room 28 is occupied
    '1-29': false, // Room 29 is available
    '1-30': false, // Room 30 is available
    
    // Property 2 (Cozy Studio) - Sequential room numbering
    // Ground Floor (0): Rooms 1-8
    '2-1': false,  // Room 1 is available
    '2-2': true,   // Room 2 is occupied
    '2-3': false,  // Room 3 is available
    '2-4': false,  // Room 4 is available
    '2-5': true,   // Room 5 is occupied
    '2-6': false,  // Room 6 is available
    '2-7': true,   // Room 7 is occupied
    '2-8': false,  // Room 8 is available
    // Floor 1: Rooms 9-16
    '2-9': false,  // Room 9 is available
    '2-10': true,  // Room 10 is occupied
    '2-11': false, // Room 11 is available
    '2-12': false, // Room 12 is available
    '2-13': true,  // Room 13 is occupied
    '2-14': false, // Room 14 is available
    '2-15': true,  // Room 15 is occupied
    '2-16': false, // Room 16 is available
    // Floor 2: Rooms 17-24
    '2-17': false, // Room 17 is available
    '2-18': true,  // Room 18 is occupied
    '2-19': false, // Room 19 is available
    '2-20': false, // Room 20 is available
    '2-21': true,  // Room 21 is occupied
    '2-22': false, // Room 22 is available
    '2-23': false, // Room 23 is available
    '2-24': true,  // Room 24 is occupied
    
    // Property 3 (Single Room) - Sequential room numbering
    // Ground Floor (0): Rooms 1-5
    '3-1': true,   // Room 1 is occupied
    '3-2': false,  // Room 2 is available
    '3-3': false,  // Room 3 is available
    '3-4': true,   // Room 4 is occupied
    '3-5': false,  // Room 5 is available
    // Floor 1: Rooms 6-10
    '3-6': true,   // Room 6 is occupied
    '3-7': false,  // Room 7 is available
    '3-8': false,  // Room 8 is available
    '3-9': true,   // Room 9 is occupied
    '3-10': false, // Room 10 is available
    // Floor 2: Rooms 11-15
    '3-11': false, // Room 11 is available
    '3-12': true,  // Room 12 is occupied
    '3-13': false, // Room 13 is available
    '3-14': false, // Room 14 is available
    '3-15': true,  // Room 15 is occupied
    
    // Property 4 (Bedsitter) - Sequential room numbering
    // Ground Floor (0): Rooms 1-6
    '4-1': false,  // Room 1 is available
    '4-2': true,   // Room 2 is occupied
    '4-3': false,  // Room 3 is available
    '4-4': false,  // Room 4 is available
    '4-5': true,   // Room 5 is occupied
    '4-6': false,  // Room 6 is available
    // Floor 1: Rooms 7-12
    '4-7': false,  // Room 7 is available
    '4-8': false,  // Room 8 is available
    '4-9': true,   // Room 9 is occupied
    '4-10': false, // Room 10 is available
    '4-11': false, // Room 11 is available
    '4-12': true,  // Room 12 is occupied
    // Floor 2: Rooms 13-18
    '4-13': false, // Room 13 is available
    '4-14': true,  // Room 14 is occupied
    '4-15': false, // Room 15 is available
    '4-16': false, // Room 16 is available
    '4-17': true,  // Room 17 is occupied
    '4-18': false, // Room 18 is available
    
    // Property 5 (One Bedroom Deluxe) - Sequential room numbering
    // Ground Floor (0): Rooms 1-4
    '5-1': false,  // Room 1 is available
    '5-2': false,  // Room 2 is available
    '5-3': false,  // Room 3 is available
    '5-4': true,   // Room 4 is occupied
    // Floor 1: Rooms 5-8
    '5-5': false,  // Room 5 is available
    '5-6': false,  // Room 6 is available
    '5-7': false,  // Room 7 is available
    '5-8': true,   // Room 8 is occupied
    // Floor 2: Rooms 9-12
    '5-9': false,  // Room 9 is available
    '5-10': false, // Room 10 is available
    '5-11': false, // Room 11 is available
    '5-12': false, // Room 12 is available
    
    // Property 6 (2 Bedroom House) - Sequential room numbering
    // Ground Floor (0): Rooms 1-3
    '6-1': true,   // Room 1 is occupied
    '6-2': false,  // Room 2 is available
    '6-3': true,   // Room 3 is occupied
    // Floor 1: Rooms 4-6
    '6-4': false,  // Room 4 is available
    '6-5': true,   // Room 5 is occupied
    '6-6': false,  // Room 6 is available
    // Floor 2: Rooms 7-9
    '6-7': true,   // Room 7 is occupied
    '6-8': false,  // Room 8 is available
    '6-9': true,   // Room 9 is occupied
    
    // Property 7 (3 Bedroom Apartment) - Sequential room numbering
    // Ground Floor (0): Rooms 1-6
    '7-1': false,  // Room 1 is available
    '7-2': false,  // Room 2 is available
    '7-3': false,  // Room 3 is available
    '7-4': true,   // Room 4 is occupied
    '7-5': false,  // Room 5 is available
    '7-6': false,  // Room 6 is available
    // Floor 1: Rooms 7-12
    '7-7': false,  // Room 7 is available
    '7-8': false,  // Room 8 is available
    '7-9': false,  // Room 9 is available
    '7-10': false, // Room 10 is available
    '7-11': false, // Room 11 is available
    '7-12': false, // Room 12 is available
    // Floor 2: Rooms 13-18
    '7-13': false, // Room 13 is available
    '7-14': false, // Room 14 is available
    '7-15': false, // Room 15 is available
    '7-16': false, // Room 16 is available
    '7-17': false, // Room 17 is available
    '7-18': false, // Room 18 is available
  }

  // Floor room mapping - defines which rooms exist on each floor
  const floorRoomMapping = {
    // Property 1 - Sequential numbering
    1: {
      0: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // Ground floor: Rooms 1-10
      1: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], // Floor 1: Rooms 11-20
      2: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30], // Floor 2: Rooms 21-30
    },
    // Property 2 - Sequential numbering
    2: {
      0: [1, 2, 3, 4, 5, 6, 7, 8], // Ground floor: Rooms 1-8
      1: [9, 10, 11, 12, 13, 14, 15, 16], // Floor 1: Rooms 9-16
      2: [17, 18, 19, 20, 21, 22, 23, 24], // Floor 2: Rooms 17-24
    },
    // Property 3 - Sequential numbering
    3: {
      0: [1, 2, 3, 4, 5], // Ground floor: Rooms 1-5
      1: [6, 7, 8, 9, 10], // Floor 1: Rooms 6-10
      2: [11, 12, 13, 14, 15], // Floor 2: Rooms 11-15
    },
    // Property 4 - Sequential numbering
    4: {
      0: [1, 2, 3, 4, 5, 6], // Ground floor: Rooms 1-6
      1: [7, 8, 9, 10, 11, 12], // Floor 1: Rooms 7-12
      2: [13, 14, 15, 16, 17, 18], // Floor 2: Rooms 13-18
    },
    // Property 5 - Sequential numbering
    5: {
      0: [1, 2, 3, 4], // Ground floor: Rooms 1-4
      1: [5, 6, 7, 8], // Floor 1: Rooms 5-8
      2: [9, 10, 11, 12], // Floor 2: Rooms 9-12
    },
    // Property 6 - Sequential numbering
    6: {
      0: [1, 2, 3], // Ground floor: Rooms 1-3
      1: [4, 5, 6], // Floor 1: Rooms 4-6
      2: [7, 8, 9], // Floor 2: Rooms 7-9
    },
    // Property 7 - Sequential numbering
    7: {
      0: [1, 2, 3, 4, 5, 6], // Ground floor: Rooms 1-6
      1: [7, 8, 9, 10, 11, 12], // Floor 1: Rooms 7-12
      2: [13, 14, 15, 16, 17, 18], // Floor 2: Rooms 13-18
    },
  }

  // Note: This is placeholder data. Real data will come from database:
  // - Properties table: id, name, type_id, building, location, price, security_deposit, description, image_urls, is_active
  // - Buildings table: id, name, total_floors, location
  // - Units table: id, property_id, floor_number, room_number, is_active
  // - prop_type_enum table: id, name (apartments, single-rooms, bedsitters, 1-bedroom, 2-plus-bedrooms)
  const allProperties = [
    {
      id: 1,
      name: 'Modern Apartment',
      location: 'Baraka Heights, Kangundo Town',
      price: 15000, // From database price column
      deposit: 15000, // From database security_deposit column
      type: 'apartments', // From prop_type_enum.name
      type_id: 1, // Foreign key to prop_type_enum
      bedrooms: 1, // From database bedrooms column
      floor: 0, // Placeholder - will come from units.floor_number
      room_number: '101', // Placeholder - will come from units.room_number
      building: 'Baraka Heights Tower A', // PLACEHOLDER - will be replaced with actual building name from database
      building_id: 1, // Foreign key to buildings table
      total_floors: 0, // Placeholder - will come from buildings.total_floors
      description: 'Modern apartment with all amenities in a prime location.', // From database description
      image: '/baraka-heights-apartment.jpg', // Placeholder - will come from-ish database image_urls
      image_urls: ['/baraka-heights-apartment.jpg'], // From database image_urls JSON column
      tags: ['1 Bedroom', 'Modern'], // From database tags or computed
      status: 'available', // From database status field (available/occupied)
      is_active: true // From database is_active column
    },
    {
      id: 2,
      name: 'Cozy Studio',
      location: 'Tala Plaza, Tala Town',
      price: 8000,
      deposit: 8000,
      type: 'single-rooms',
      type_id: 2,
      bedrooms: 0,
      floor: 0, // Placeholder - will come from units.floor_number
      room_number: '201', // Placeholder - will come from units.room_number
      building: 'Tala Plaza Building B', // PLACEHOLDER - will be replaced with actual building name from database
      building_id: 2, // Foreign key to buildings table
      total_floors: 0, // Placeholder - will come from buildings.total_floors
      description: 'Comfortable studio apartment perfect for individuals.',
      image: '/tala-plaza-studio.jpg',
      image_urls: ['/tala-plaza-studio.jpg'],
      tags: ['Studio', 'Affordable'],
      status: 'available',
      is_active: true
    },
    {
      id: 3,
      name: 'Single Room',
      location: 'Kangundo Town Center',
      price: 5000,
      deposit: 5000,
      type: 'single-rooms',
      type_id: 2,
      bedrooms: 0,
      floor: 0, // Placeholder - will come from units.floor_number
      room_number: '301', // Placeholder - will come from units.room_number
      building: 'Kangundo Center Block C', // PLACEHOLDER - will be replaced with actual building name from database
      building_id: 3, // Foreign key to buildings table
      total_floors: 0, // Placeholder - will come from buildings.total_floors
      description: 'Clean and tidy single room with shared facilities.',
      image: '/kangundo-single-room.jpg',
      image_urls: ['/kangundo-single-room.jpg'],
      tags: ['Single Room', 'Budget'],
      status: 'occupied',
      is_active: true
    },
    {
      id: 4,
      name: 'Bedsitter.Tala Market Complex',
      location: 'Tala Market Area',
      price: 6500,
      deposit: 6500,
      type: 'bedsitters',
      type_id: 3,
      bedrooms: 0,
      floor: 0, // Placeholder - will come from units.floor_number
      room_number: '401', // Placeholder - will come from units.room_number
      building: 'Tala Market Complex', // PLACEHOLDER - will be replaced with actual building name from database
      building_id: 4, // Foreign key to buildings table
      total_floors: 0, // Placeholder - will come from buildings.total_floors
      description: 'Self-contained bedsitter with kitchenette.',
      image: '/tala-bedsitter.jpg',
      image_urls: ['/tala-bedsitter.jpg'],
      tags: ['Bedsitter', 'Self-contained'],
      status: 'available',
      is_active: true
    },
    {
      id: 5,
      name: 'One Bedroom Deluxe',
      location: 'Kangundo Prime',
      price: 12000,
      deposit: 12000,
      type: '1-bedroom',
      type_id: 4,
      bedrooms: 1,
      floor: 0, // Placeholder - will come from units.floor_number
      room_number: '501', // Placeholder - will come from units.room_number
      building: 'Kangundo Prime Tower E', // PLACEHOLDER - will be replaced with actual building name from database
      building_id: 5, // Foreign key to buildings table
      total_floors: 0, // Placeholder - will come from buildings.total_floors
      description: 'Spacious one bedroom with modern amenities.',
      image: '/kangundo-1bedroom-deluxe.jpg',
      image_urls: ['/kangundo-1bedroom-deluxe.jpg'],
      tags: ['1 Bedroom', 'Deluxe'],
      status: 'available',
      is_active: true
    },
    {
      id: 6,
      name: '2 Bedroom House',
      location: 'Kangundo Estates',
      price: 20000,
      deposit: 20000,
      type: '2-plus-bedrooms',
      type_id: 5,
      bedrooms: 2,
      floor: 0, // Placeholder - will come from units.floor_number
      room_number: '601', // Placeholder - will come from units.room_number
      building: 'Kangundo Estate House H', // PLACEHOLDER - will be replaced with actual building name from database
      building_id: 6, // Foreign key to buildings table
      total_floors: 0, // Placeholder - will come from buildings.total_floors
      description: 'Spacious 2 bedroom house with parking space.',
      image: '/kangundo-2bedroom.jpg',
      image_urls: ['/kangundo-2bedroom.jpg'],
      tags: ['2 Bedrooms', 'Spacious'],
      status: 'occupied',
      is_active: true
    },
    {
      id: 7,
      name: '3 Bedroom Apartment',
      location: 'Tala Heights',
      price: 25000,
      deposit: 25000,
      type: '2-plus-bedrooms',
      type_id: 5,
      bedrooms: 3,
      floor: 0, // Placeholder - will come from units.floor_number
      room_number: '701', // Placeholder - will come from units.room_number
      building: 'Tala Heights Tower F', // PLACEHOLDER - will be replaced with actual building name from database
      building_id: 7, // Foreign key to buildings table
      total_floors: 0, // Placeholder - will come from buildings.total_floors
      description: 'Luxurious 3 bedroom apartment with city views.',
      image: '/tala-3bedroom.jpg',
      image_urls: ['/tala-3bedroom.jpg'],
      tags: ['3 Bedrooms', 'Luxury'],
      status: 'available',
      is_active: true
    }
  ]

  // Initialize floor and room numbers when component mounts
  useEffect(() => {
    const initialFloors = {}
    const initialRooms = {}
    const initialRoomStatus = {}
    allProperties.forEach(property => {
      // Start with ground floor (0) for all properties
      const initialFloor = 0
      initialFloors[property.id] = initialFloor
      
      // Get the first room on the ground floor for this property
      const propertyFloorMapping = floorRoomMapping[property.id]
      const groundFloorRooms = propertyFloorMapping ? propertyFloorMapping[initialFloor] : [1]
      const initialRoom = groundFloorRooms[0] || 1
      initialRooms[property.id] = initialRoom
      
      // Check database status for the initial room
      const roomKey = `${property.id}-${initialRoom}`
      initialRoomStatus[property.id] = sampleRoomStatusDB[roomKey] || false
    })
    setPropertyFloors(initialFloors)
    setPropertyRooms(initialRooms)
    setRoomOccupiedStatus(initialRoomStatus)
  }, [])

  // Function to check room status from database
  const checkRoomStatus = (propertyId, roomNumber) => {
    const roomKey = `${propertyId}-${roomNumber}`
    return sampleRoomStatusDB[roomKey] || false
  }

  // Function to check lease availability from database
  const checkLeaseAvailability = (propertyId, roomNumber) => {
    const roomKey = `${propertyId}-${roomNumber}`
    return sampleLeasePDFDB[roomKey] || { available: false, fileName: null, title: null }
  }

  // Function to download lease PDF
  const downloadLeasePDF = (propertyId, roomNumber) => {
    const leaseInfo = checkLeaseAvailability(propertyId, roomNumber)
    
    if (leaseInfo.available && leaseInfo.fileName) {
      // In a real application, this would fetch the PDF from the server
      // For now, we'll simulate the download
      const link = document.createElement('a')
      link.href = `/leases/${leaseInfo.fileName}` // This would be the actual server endpoint
      link.download = leaseInfo.fileName
      link.target = '_blank'
      
      // Simulate PDF download - in real app this would be an actual file
      console.log(`Downloading lease: ${leaseInfo.title}`)
      alert(`Lease Agreement "${leaseInfo.title}" download started! In a real application, this would download the actual PDF file.`)
      
      // For demonstration, we'll create a simple text file
      const content = `Lease Agreement: ${leaseInfo.title}\nProperty ID: ${propertyId}\nRoom: ${roomNumber}\n\nThis is a sample lease agreement document.\nIn a real application, this would be the actual PDF content.`
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    } else {
      alert('No lease agreement available for this room.')
    }
  }

  // Function to get rooms available on a specific floor
  const getRoomsOnFloor = (propertyId, floor) => {
    const propertyFloorMapping = floorRoomMapping[propertyId]
    return propertyFloorMapping ? propertyFloorMapping[floor] || [1] : [1]
  }

  // Functions to adjust floor and room numbers
  const adjustFloor = (propertyId, direction) => {
    setPropertyFloors(prev => {
      const currentFloor = prev[propertyId] || 0
      const propertyFloorMapping = floorRoomMapping[propertyId]
      const availableFloors = propertyFloorMapping ? Object.keys(propertyFloorMapping).map(f => parseInt(f)).sort((a, b) => a - b) : [0]
      
      // Find next valid floor
      let newFloor = currentFloor
      if (direction > 0) {
        // Go up
        const currentIndex = availableFloors.indexOf(currentFloor)
        if (currentIndex < availableFloors.length - 1) {
          newFloor = availableFloors[currentIndex + 1]
        }
      } else {
        // Go down
        const currentIndex = availableFloors.indexOf(currentFloor)
        if (currentIndex > 0) {
          newFloor = availableFloors[currentIndex - 1]
        }
      }
      
      // Update room to first room on new floor
      const roomsOnNewFloor = getRoomsOnFloor(propertyId, newFloor)
      const newRoom = roomsOnNewFloor[0] || 1
      
      // Update room status
      const newStatus = checkRoomStatus(propertyId, newRoom)
      setRoomOccupiedStatus(prevStatus => ({
        ...prevStatus,
        [propertyId]: newStatus
      }))
      
      setPropertyRooms(prevRooms => ({
        ...prevRooms,
        [propertyId]: newRoom
      }))
      
      return {
        ...prev,
        [propertyId]: newFloor
      }
    })
  }

  const adjustRoom = (propertyId, direction) => {
    setPropertyRooms(prev => {
      const currentRoom = prev[propertyId] || 1
      const currentFloor = propertyFloors[propertyId] || 0
      const roomsOnCurrentFloor = getRoomsOnFloor(propertyId, currentFloor)
      
      // Find current room index
      const currentIndex = roomsOnCurrentFloor.indexOf(currentRoom)
      let newIndex = currentIndex
      
      if (direction > 0) {
        // Go to next room
        if (currentIndex < roomsOnCurrentFloor.length - 1) {
          newIndex = currentIndex + 1
        }
      } else {
        // Go to previous room
        if (currentIndex > 0) {
          newIndex = currentIndex - 1
        }
      }
      
      const newRoom = roomsOnCurrentFloor[newIndex] || currentRoom
      
      // Update room status based on new room number from database
      const newStatus = checkRoomStatus(propertyId, newRoom)
      setRoomOccupiedStatus(prevStatus => ({
        ...prevStatus,
        [propertyId]: newStatus
      }))
      
      return {
        ...prev,
        [propertyId]: newRoom
      }
    })
  }

  // Function to get floor display name
  const getFloorDisplayName = (floor) => {
    if (floor === 0) return 'Ground Floor'
    return `Floor ${floor}`
  }

  const filteredProperties = selectedFilter === 'all' 
    ? allProperties 
    : allProperties.filter(property => property.type === selectedFilter)

  // Note: These filter options will be replaced with dynamic data from database
  // The database will provide property types from the prop_type_enum table
  const filterOptions = [
    { key: 'all', label: 'All Properties' },
    // Database will populate: apartments, single-rooms, bedsitters, 1-bedroom, 2-plus-bedrooms
    { key: 'apartments', label: 'Apartments' },
    { key: 'single-rooms', label: 'Single Rooms' },
    { key: 'bedsitters', label: 'Bedsitters' },
    { key: '1-bedroom', label: '1 Bedroom' },
    { key: '2-plus-bedrooms', label: '2+ Bedrooms' }
  ]
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">BARAKA HOUSING AGENCY</h1>
            <p className="text-xl md:text-2xl mb-2">A Subsidiary of The Gregory Foundation Ltd</p>
            <p className="text-lg opacity-90">Professional Property Management Services in Kangundo</p>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">About Us</h2>
            <p className="text-gray-600 mb-4">
              Baraka Housing Agency is a professional property management company based in Kangundo Town. 
              We specialize in providing quality housing solutions with modern amenities and excellent 
              customer service to our valued tenants.
            </p>
            <p className="text-gray-600">
              Our mission is to offer comfortable, affordable, and well-maintained properties that 
              meet the diverse needs of our community while ensuring a seamless rental experience.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-24">Email:</span>
                <span className="text-gray-600">barakahousing@gmail.com</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-24">Phone:</span>
                <span className="text-gray-600">+254 799 789 956</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-24">Location:</span>
                <span className="text-gray-600">Kangundo Town, Machakos County</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-gray-700 w-24">Manager:</span>
                <span className="text-gray-600">MD Damarice</span>
              </div>
            </div>
          </div>
        </div>

        {/* Available Properties */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Available Properties</h2>
          
          {/* Listing Options */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {filterOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setSelectedFilter(option.key)}
                className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                  selectedFilter === option.key
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {/* Lease Download Section */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Lease Agreements</h3>
                <p className="text-gray-600">Download lease agreements for available properties</p>
              </div>
              <div className="flex gap-3">
                {(() => {
                  // Get the first available property with a lease
                  const availableProperty = filteredProperties.find(property => {
                    const currentRoom = propertyRooms[property.id] || 1
                    const leaseInfo = checkLeaseAvailability(property.id, currentRoom)
                    return leaseInfo.available
                  })
                  
                  if (availableProperty) {
                    const currentRoom = propertyRooms[availableProperty.id] || 1
                    const leaseInfo = checkLeaseAvailability(availableProperty.id, currentRoom)
                    return (
                      <button
                        onClick={() => downloadLeasePDF(availableProperty.id, currentRoom)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Sample Lease
                      </button>
                    )
                  } else {
                    return (
                      <button
                        disabled
                        className="bg-gray-300 text-gray-500 px-6 py-3 rounded-lg font-medium cursor-not-allowed flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        No Leases Available
                      </button>
                    )
                  }
                })()}
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => {
              const currentRoom = propertyRooms[property.id]
              const isOccupied = roomOccupiedStatus[property.id] || false
              return (
              <div key={property.id} className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${isOccupied ? 'border-2 border-red-500' : ''}`}>
                <div className="relative h-48 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${property.image}')` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{property.name}</h3>
                    <p className="text-sm opacity-90">{property.location}</p>
                  </div>
                  {isOccupied && (
                    <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full font-bold">
                      OCCUPIED
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Monthly Rent</span>
                        <div className="bg-white px-3 py-1 rounded border border-gray-300">
                          <span className="text-lg font-bold text-gray-800">KES {property.price.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Security Deposit</span>
                        <div className="bg-white px-3 py-1 rounded border border-gray-300">
                          <span className="text-lg font-bold text-gray-800">KES {property.deposit.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-teal-50 rounded-lg p-4 border-2 border-teal-300">
                      <div className="flex justify-between items-center">
                        <span className="text-teal-700 font-semibold">Total Amount</span>
                        <div className="bg-white px-3 py-1 rounded border border-teal-300">
                          <span className="text-xl font-bold text-teal-800">KES {(property.price + property.deposit).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <span className="text-blue-600 text-sm font-medium">{getFloorDisplayName(propertyFloors[property.id] || 0)}</span>
                      <div className="flex items-center justify-between mt-1">
                        <button
                          onClick={() => adjustFloor(property.id, -1)}
                          className="bg-white px-2 py-1 rounded border border-blue-300 hover:bg-blue-100 transition-colors"
                          disabled={propertyFloors[property.id] <= 0}
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="bg-white px-3 py-1 rounded border border-blue-300 mx-1">
                          <p className="text-lg font-bold text-blue-800 text-center">{propertyFloors[property.id] || 0}</p>
                        </div>
                        <button
                          onClick={() => adjustFloor(property.id, 1)}
                          className="bg-white px-2 py-1 rounded border border-blue-300 hover:bg-blue-100 transition-colors"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <span className="text-blue-600 text-sm font-medium">Room #{property.id}</span>
                      <div className="flex items-center justify-between mt-1">
                        <button
                          onClick={() => adjustRoom(property.id, -1)}
                          className="bg-white px-2 py-1 rounded border border-blue-300 hover:bg-blue-100 transition-colors"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="bg-white px-3 py-1 rounded border border-blue-300 mx-1">
                          <p className="text-lg font-bold text-blue-800 text-center">{propertyRooms[property.id] || 1}</p>
                        </div>
                        <button
                          onClick={() => adjustRoom(property.id, 1)}
                          className="bg-white px-2 py-1 rounded border border-blue-300 hover:bg-blue-100 transition-colors"
                        >
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{property.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {property.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      isOccupied 
                        ? 'bg-red-600 text-white' 
                        : 'bg-green-600 text-white'
                    }`}>
                      {isOccupied ? 'Occupied' : 'Available'}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                      Room {currentRoom}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${
                        isOccupied ? 'text-red-600' : 'text-green-600'
                      }`}>
                        Room {currentRoom} Status
                      </span>
                      <div className={`px-3 py-1 rounded border font-bold ${
                        isOccupied
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-green-100 text-green-800 border-green-300'
                      }`}>
                        {isOccupied ? 'OCCUPIED' : 'AVAILABLE'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              )
            })}
          </div>
        </div>

        {/* Service Area */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Service Area</h2>
          <p className="text-gray-600">
            We proudly serve the following areas: Kangundo, Tala, and surrounding regions. 
            Our local expertise ensures we can provide the best housing solutions tailored to each community's needs.
          </p>
        </div>

        {/* Service Actions */}
        <div className="text-center">
          <p className="text-gray-700 mb-4">Need help with any of our services?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-lg">
              Contact Us
            </button>
            <Link 
              to="/housing-management/login" 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
            >
              Management Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HousingAgency