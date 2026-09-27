-- Check the structure of the users table
SHOW CREATE TABLE users;

-- Check what columns exist in the users table
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'the_greggory_systems_and_strategy_firm_db_main' 
AND TABLE_NAME = 'users';

-- View existing users (if any)
SELECT * FROM users LIMIT 5;

-- Example INSERT statement (users has first_name/last_name, NOT a `name` column)
-- INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, created_at)
-- VALUES (
--   'test@example.com',
--   '<bcrypt hash>',        -- see below, never a raw or fast hash
--   'Test',
--   'User',
--   'user',
--   1,
--   NOW()
-- );

-- How password_hash is produced: bcrypt, in the application, e.g.
--   const bcrypt = require('bcryptjs');
--   const hash = await bcrypt.hash('your_password_here', 12);
-- Do NOT hash in SQL. MD5/SHA2 are unsuitable for passwords (fast, unsalted)
-- and the backend compares with bcrypt, so a hash made any other way will
-- simply fail to verify.
