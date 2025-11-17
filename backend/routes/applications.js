const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Create new application
router.post('/', (req, res) => {
  const { property_id, room_number, agent_name, total_cost, applicants } = req.body;
  
  // Start transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error('Transaction error:', err);
      return res.status(500).json({ error: 'Failed to start transaction' });
    }
    
    // Insert application
    const appQuery = `
      INSERT INTO applications (property_id, room_number, agent_name, total_cost, status_id)
      VALUES (?, ?, ?, ?, 1)
    `;
    
    db.query(appQuery, [property_id, room_number, agent_name, total_cost], (err, result) => {
      if (err) {
        return db.rollback(() => {
          console.error('Error inserting application:', err);
          res.status(500).json({ error: 'Failed to create application' });
        });
      }
      
      const applicationId = result.insertId;
      
      // Insert applicants
      if (applicants && applicants.length > 0) {
        const applicantPromises = applicants.map(applicant => {
          return new Promise((resolve, reject) => {
            const applicantQuery = `
              INSERT INTO applicants (application_id, full_name, id_number, phone_number, email, 
                                     employer_name, employer_address, employer_phone, monthly_income)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            db.query(applicantQuery, [
              applicationId,
              applicant.full_name,
              applicant.id_number,
              applicant.phone_number,
              applicant.email,
              applicant.employer_name,
              applicant.employer_address,
              applicant.employer_phone,
              applicant.monthly_income
            ], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        });
        
        Promise.all(applicantPromises)
          .then(() => {
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  console.error('Commit error:', err);
                  res.status(500).json({ error: 'Failed to commit application' });
                });
              }
              
              res.status(201).json({ 
                message: 'Application created successfully', 
                application_id: applicationId 
              });
            });
          })
          .catch((err) => {
            db.rollback(() => {
              console.error('Error inserting applicants:', err);
              res.status(500).json({ error: 'Failed to add applicants' });
            });
          });
      } else {
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              console.error('Commit error:', err);
              res.status(500).json({ error: 'Failed to commit application' });
            });
          }
          
          res.status(201).json({ 
            message: 'Application created successfully', 
            application_id: applicationId 
          });
        });
      }
    });
  });
});

// Get application by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  // Get application details
  const appQuery = `
    SELECT a.*, p.name as property_name, p.building, p.location, p.price, p.security_deposit,
           c.name as company_name, as_.name as status_name
    FROM applications a
    JOIN properties p ON a.property_id = p.id
    JOIN companies c ON p.company_id = c.id
    JOIN app_status_enum as_ ON a.status_id = as_.id
    WHERE a.id = ?
  `;
  
  db.query(appQuery, [id], (err, appResults) => {
    if (err) {
      console.error('Error fetching application:', err);
      return res.status(500).json({ error: 'Failed to fetch application' });
    }
    
    if (appResults.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const application = appResults[0];
    
    // Get applicants for this application
    const applicantQuery = `
      SELECT * FROM applicants WHERE application_id = ? ORDER BY id
    `;
    
    db.query(applicantQuery, [id], (err, applicantResults) => {
      if (err) {
        console.error('Error fetching applicants:', err);
        return res.status(500).json({ error: 'Failed to fetch applicants' });
      }
      
      application.applicants = applicantResults;
      res.json(application);
    });
  });
});

// Get all applications (with filters)
router.get('/', (req, res) => {
  const { status, company_id, limit = 50, offset = 0 } = req.query;
  
  let query = `
    SELECT a.*, p.name as property_name, p.building, p.location,
           c.name as company_name, as_.name as status_name
    FROM applications a
    JOIN properties p ON a.property_id = p.id
    JOIN companies c ON p.company_id = c.id
    JOIN app_status_enum as_ ON a.status_id = as_.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (status) {
    query += ' AND a.status_id = ?';
    params.push(status);
  }
  
  if (company_id) {
    query += ' AND p.company_id = ?';
    params.push(company_id);
  }
  
  query += ' ORDER BY a.application_date DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error fetching applications:', err);
      return res.status(500).json({ error: 'Failed to fetch applications' });
    }
    
    res.json(results);
  });
});

// Update application status
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status_id } = req.body;
  
  const query = 'UPDATE applications SET status_id = ?, updated_at = NOW() WHERE id = ?';
  
  db.query(query, [status_id, id], (err, result) => {
    if (err) {
      console.error('Error updating application status:', err);
      return res.status(500).json({ error: 'Failed to update status' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json({ message: 'Application status updated successfully' });
  });
});

module.exports = router;
