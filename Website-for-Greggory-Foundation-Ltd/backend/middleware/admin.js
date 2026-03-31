const jwt = require('jsonwebtoken');
const db = require('../config/database');

const requireAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token, authorization denied' 
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '***REMOVED***');
      
      // Get user from database
      const [users] = await db.query(
        'SELECT * FROM users WHERE id = ?', 
        [decoded.id]
      );
      
      if (users.length === 0) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      const user = users[0];

      // Check if user is admin
      if (user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Admin access required' 
        });
      }

      // Add user from payload
      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Token expired' 
        });
      }
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid' 
      });
    }
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error in admin middleware' 
    });
  }
};

module.exports = requireAdmin;
