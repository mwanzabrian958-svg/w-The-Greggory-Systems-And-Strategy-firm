const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Create a connection pool for the main database
const mainDb = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mysql', // Connect to mysql to list databases
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test main database connection
app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await mainDb.query('SELECT 1 as test');
    res.json({ success: true, message: 'Database connection successful', data: rows });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ success: false, message: 'Database connection failed', error: error.message });
  }
});

// List all databases
app.get('/api/databases', async (req, res) => {
  try {
    const [rows] = await mainDb.query(
      `SELECT schema_name as name 
       FROM information_schema.schemata 
       WHERE schema_name NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys', 'phpmyadmin')`
    );
    res.json({ success: true, databases: rows });
  } catch (error) {
    console.error('Error fetching databases:', error);
    res.status(500).json({ success: false, message: 'Error fetching databases', error: error.message });
  }
});

// Dynamic database connection middleware
app.use('/api/db/:database', async (req, res, next) => {
  const { database } = req.params;
  
  // Skip if it's the databases endpoint
  if (req.path.includes('/databases')) return next();
  
  try {
    // Create a new connection for the requested database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: database
    });
    
    // Attach the connection to the request
    req.db = connection;
    
    // Close the connection when response is sent
    res.on('finish', () => {
      connection.end().catch(console.error);
    });
    
    next();
  } catch (error) {
    console.error(`Error connecting to database ${database}:`, error);
    res.status(500).json({ 
      success: false, 
      message: `Failed to connect to database: ${database}`,
      error: error.message 
    });
  }
});

// Get tables from a specific database
app.get('/api/db/:database/tables', async (req, res) => {
  try {
    const [tables] = await req.db.query('SHOW TABLES');
    res.json({ success: true, tables });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ success: false, message: 'Error fetching tables', error: error.message });
  }
});

// Get table data
app.get('/api/db/:database/table/:table', async (req, res) => {
  const { database, table } = req.params;
  const { limit = 100, offset = 0 } = req.query;
  
  try {
    // Get table structure
    const [columns] = await req.db.query(`DESCRIBE ${table}`);
    
    // Get table data with pagination
    const [rows] = await req.db.query(
      `SELECT * FROM ${table} LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );
    
    // Get total count for pagination
    const [[{ total }]] = await req.db.query(
      `SELECT COUNT(*) as total FROM ${table}`
    );
    
    res.json({
      success: true,
      database,
      table,
      columns,
      data: rows,
      pagination: {
        total: parseInt(total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error(`Error fetching data from ${database}.${table}:`, error);
    res.status(500).json({
      success: false,
      message: `Error fetching data from ${table}`,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Serve dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// 404 handler
app.use((req, res) => {
  if (req.accepts('html')) {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  } else if (req.accepts('json')) {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found',
      path: req.path
    });
  } else {
    res.status(404).send('Not found');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Connected to MySQL server at ${process.env.DB_HOST || 'localhost'}`);
  console.log(`Access the API at http://localhost:${PORT}/api`);
});
