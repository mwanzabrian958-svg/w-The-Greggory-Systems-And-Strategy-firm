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

module.exports = requireAdmin;
