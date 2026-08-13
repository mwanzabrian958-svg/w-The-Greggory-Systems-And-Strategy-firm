const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT *
      FROM companies
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.promise().query(
      'SELECT * FROM companies WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, slug, description, website_url, contact_email, contact_phone, address_line1, address_line2, city, state, postal_code, country } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const [result] = await db.promise().query(
      `INSERT INTO companies (name, slug, description, website_url, contact_email, contact_phone, address_line1, address_line2, city, state, postal_code, country, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`,
      [name, slug, description || null, website_url || null, contact_email || null, contact_phone || null, address_line1 || null, address_line2 || null, city || null, state || null, postal_code || null, country || null, req.body.created_by || 1]
    );

    res.status(201).json({ message: 'Company created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Failed to create company' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, website_url, contact_email, contact_phone, address_line1, address_line2, city, state, postal_code, country } = req.body;

    const [result] = await db.promise().query(
      `UPDATE companies
       SET name = ?, slug = ?, description = ?, website_url = ?, contact_email = ?, contact_phone = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, postal_code = ?, country = ?, updated_at = NOW(), updated_by = ?
       WHERE id = ? AND deleted_at IS NULL`,
      [name, slug, description || null, website_url || null, contact_email || null, contact_phone || null, address_line1 || null, address_line2 || null, city || null, state || null, postal_code || null, country || null, req.body.updated_by || 1, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ message: 'Company updated successfully' });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Failed to update company' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.promise().query(
      'UPDATE companies SET deleted_at = NOW(), deleted_by = ? WHERE id = ? AND deleted_at IS NULL',
      [req.body.deleted_by || 1, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Failed to delete company' });
  }
});

module.exports = router;
