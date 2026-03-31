const jwt = require('jsonwebtoken');

// JWT Authentication Middleware
const requireAuth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// Admin Authentication Middleware
const requireAdmin = (req, res, next) => {
  const adminKey = process.env.ADMIN_KEY || '';
  const providedKey = req.header('x-admin-key') || '';

  if (!adminKey) {
    return res.status(500).json({ error: 'Admin key not configured on server' });
  }

  if (providedKey !== adminKey) {
    return res.status(403).json({ error: 'Forbidden: invalid admin key' });
  }

  next();
};

module.exports = { requireAuth, requireAdmin };
