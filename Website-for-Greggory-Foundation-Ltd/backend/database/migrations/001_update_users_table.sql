-- Add/modify columns in users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE AFTER id,
ADD COLUMN IF NOT EXISTS first_name VARCHAR(50) AFTER username,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(50) AFTER first_name,
ADD COLUMN IF NOT EXISTS role ENUM('user', 'admin') DEFAULT 'user' AFTER last_name,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE AFTER role,
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255) AFTER is_verified,
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255) AFTER verification_token,
ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME AFTER reset_token,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
MODIFY COLUMN email VARCHAR(100) NOT NULL UNIQUE,
MODIFY COLUMN password_hash VARCHAR(255) NOT NULL;

-- Update existing users to have usernames (using email prefix)
UPDATE users SET username = SUBSTRING_INDEX(email, '@', 1) WHERE username IS NULL;

-- Make username not null after populating
ALTER TABLE users MODIFY COLUMN username VARCHAR(50) NOT NULL;
