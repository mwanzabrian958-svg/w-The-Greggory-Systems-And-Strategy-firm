const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all properties
router.get('/', (req, res) => {
  const query = `
    SELECT p.*, c.name as company_name, pt.name as type_name
    FROM properties p
    JOIN companies c ON p.company_id = c.id
    JOIN prop_type_enum pt ON p.type_id = pt.id
    WHERE p.is_active = true
    ORDER BY p.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching properties:', err);
      return res.status(500).json({ error: 'Failed to fetch properties' });
    }
    
    // Parse JSON fields
    const properties = results.map(property => ({
      ...property,
      tags: property.tags ? JSON.parse(property.tags) : [],
      image_urls: property.image_urls ? JSON.parse(property.image_urls) : []
    }));
    
    res.json(properties);
  });
});

// Get properties by company
router.get('/company/:companyId', (req, res) => {
  const { companyId } = req.params;
  const query = `
    SELECT p.*, c.name as company_name, pt.name as type_name
    FROM properties p
    JOIN companies c ON p.company_id = c.id
    JOIN prop_type_enum pt ON p.type_id = pt.id
    WHERE p.company_id = ? AND p.is_active = true
    ORDER BY p.created_at DESC
  `;
  
  db.query(query, [companyId], (err, results) => {
    if (err) {
      console.error('Error fetching company properties:', err);
      return res.status(500).json({ error: 'Failed to fetch properties' });
    }
    
    const properties = results.map(property => ({
      ...property,
      tags: property.tags ? JSON.parse(property.tags) : [],
      image_urls: property.image_urls ? JSON.parse(property.image_urls) : []
    }));
    
    res.json(properties);
  });
});

// Get property by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT p.*, c.name as company_name, pt.name as type_name
    FROM properties p
    JOIN companies c ON p.company_id = c.id
    JOIN prop_type_enum pt ON p.type_id = pt.id
    WHERE p.id = ? AND p.is_active = true
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching property:', err);
      return res.status(500).json({ error: 'Failed to fetch property' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    
    const property = results[0];
    property.tags = property.tags ? JSON.parse(property.tags) : [];
    property.image_urls = property.image_urls ? JSON.parse(property.image_urls) : [];
    
    res.json(property);
  });
});

// Get property statistics for a company
router.get('/stats/:companyId', (req, res) => {
  const { companyId } = req.params;
  
  const query = `
    SELECT 
      COUNT(*) as total_properties,
      COUNT(DISTINCT building) as unique_buildings,
      COUNT(DISTINCT location) as unique_locations,
      95 as occupancy_rate
    FROM properties 
    WHERE company_id = ? AND is_active = true
  `;
  
  db.query(query, [companyId], (err, results) => {
    if (err) {
      console.error('Error fetching property stats:', err);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }
    
    res.json(results[0]);
  });
});

// Get property features for a specific room
router.get('/:propertyId/features/:roomNumber', (req, res) => {
  const { propertyId, roomNumber } = req.params;
  const query = `
    SELECT * FROM property_features 
    WHERE property_id = ? AND room_number = ?
    ORDER BY created_at DESC
  `;
  
  db.query(query, [propertyId, roomNumber], (err, results) => {
    if (err) {
      console.error('Error fetching property features:', err);
      return res.status(500).json({ error: 'Failed to fetch features' });
    }
    
    res.json(results);
  });
});

module.exports = router;
