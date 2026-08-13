const db = require('../config/database');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleAuth = async (req, res) => {
  try {
    const { token, isSignUp } = req.body;
    
    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    const [user] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);

    let userId;
    if (user.length === 0 && isSignUp) {
      // Create new user with default role 'user'
      const [result] = await db.promise().query(
        'INSERT INTO users (email, name, profile_image, auth_provider, is_email_verified, primary_role) VALUES (?, ?, ?, "google", 1, "user")',
        [email, name, picture]
      );
      userId = result.insertId;
    } else if (user.length > 0) {
      // Existing user
      userId = user[0].id;
      // Update last login
      await db.promise().query('UPDATE users SET last_login = NOW() WHERE id = ?', [userId]);
    } else {
      return res.status(400).json({ error: 'User not found. Please sign up first.' });
    }

    // Generate JWT token
    const authToken = jwt.sign(
      { userId, email },
      process.env.JWT_SECRET || '***REMOVED***',
      { expiresIn: '7d' }
    );

    // Get user data
    const [userData] = await db.promise().query('SELECT * FROM users WHERE id = ?', [userId]);

    res.json({ 
      token: authToken,
      user: {
        id: userData[0].id,
        email: userData[0].email,
        name: userData[0].name,
        role: userData[0].primary_role || 'user',
        profileImage: userData[0].profile_image
      }
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
