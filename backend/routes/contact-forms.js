const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT *
      FROM contact_forms
      ORDER BY created_at DESC
    `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching contact forms:', error);
    res.status(500).json({ error: 'Failed to fetch contact forms' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.promise().query('SELECT * FROM contact_forms WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Contact form not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching contact form:', error);
    res.status(500).json({ error: 'Failed to fetch contact form' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }

    const [result] = await db.promise().query(
      `INSERT INTO contact_forms (name, email, phone, company, subject, message)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone || null, company || null, subject || null, message]
    );

    res.status(201).json({ message: 'Contact form submitted successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating contact form:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.promise().query('DELETE FROM contact_forms WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Contact form not found' });
    }

    res.json({ message: 'Contact form deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact form:', error);
    res.status(500).json({ error: 'Failed to delete contact form' });
  }
});

module.exports = router;
