-- Check the structure of the users table
SHOW CREATE TABLE users;

-- Check what columns exist in the users table
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'greggory_foundation_db' 
AND TABLE_NAME = 'users';

-- View existing users (if any)
SELECT * FROM users LIMIT 5;

-- Example INSERT statement (update column names as needed based on the actual table structure)
-- INSERT INTO users (email, password_hash, name, role, is_active, created_at)
-- VALUES (
--   'test@example.com',
--   'hashed_password_here',  -- You'll need to generate this
--   'Test User',
--   'admin',
--   1,
--   NOW()
-- );

-- To generate a password hash in MySQL:
-- SELECT MD5('your_password_here');  -- For MD5 hash (not recommended for production)
-- OR using SHA2 (better):
-- SELECT SHA2('your_password_here', 256);
