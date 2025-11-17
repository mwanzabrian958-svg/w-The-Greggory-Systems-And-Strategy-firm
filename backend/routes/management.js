const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get management info by company
router.get('/:companyId', (req, res) => {
  const { companyId } = req.params;
  
  const query = `
    SELECT * FROM management_info 
    WHERE company_id = ?
    ORDER BY updated_at DESC 
    LIMIT 1
  `;
  
  db.query(query, [companyId], (err, results) => {
    if (err) {
      console.error('Error fetching management info:', err);
      return res.status(500).json({ error: 'Failed to fetch management info' });
    }
    
    if (results.length === 0) {
      // Return default values if no management info exists
      return res.json({
        station_manager: 'Not specified',
        service_area: 'Not specified',
        base_location: 'Not specified'
      });
    }
    
    res.json(results[0]);
  });
});

// Update management info (protected route - would need authentication middleware)
router.put('/:companyId', (req, res) => {
  const { companyId } = req.params;
  const { station_manager, service_area, base_location, updated_by } = req.body;
  
  const query = `
    INSERT INTO management_info (company_id, station_manager, service_area, base_location, updated_by)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    station_manager = VALUES(station_manager),
    service_area = VALUES(service_area),
    base_location = VALUES(base_location),
    updated_by = VALUES(updated_by),
    updated_at = NOW()
  `;
  
  db.query(query, [companyId, station_manager, service_area, base_location, updated_by], (err, result) => {
    if (err) {
      console.error('Error updating management info:', err);
      return res.status(500).json({ error: 'Failed to update management info' });
    }
    
    res.json({ message: 'Management info updated successfully' });
  });
});

module.exports = router;
