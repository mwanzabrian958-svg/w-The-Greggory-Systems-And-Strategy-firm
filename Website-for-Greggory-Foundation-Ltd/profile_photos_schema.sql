-- Greggory Foundation Ltd - Profile Photos Schema Update
-- Created: 2025-03-08
-- Description: SQL to modify users table to store actual profile photos
-- Usage: Run this script to update your existing database structure

USE greggory_auth_platform;

-- =============================================
-- Option 1: Add profile photo columns to users table (Recommended)
-- This allows storing photo data directly in the users table
-- =============================================

-- Add profile photo columns to users table
ALTER TABLE users 
ADD COLUMN profile_photo_data LONGBLOB NULL COMMENT 'Actual profile photo image data',
ADD COLUMN profile_photo_name VARCHAR(255) NULL COMMENT 'Original filename of profile photo',
ADD COLUMN profile_photo_type VARCHAR(100) NULL COMMENT 'MIME type of profile photo (image/jpeg, image/png, etc.)',
ADD COLUMN profile_photo_size BIGINT NULL COMMENT 'Size of profile photo in bytes',
ADD COLUMN profile_photo_uploaded_at TIMESTAMP NULL DEFAULT NULL COMMENT 'When profile photo was uploaded';

-- Add indexes for better performance
ALTER TABLE users 
ADD INDEX idx_profile_photo_uploaded (profile_photo_uploaded_at);

-- =============================================
-- Option 2: Create dedicated profile photos table (Alternative)
-- This creates a separate table just for profile photos
-- =============================================

/*
-- Uncomment this section if you prefer a separate table approach

CREATE TABLE IF NOT EXISTS user_profile_photos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    photo_data LONGBLOB NOT NULL COMMENT 'Actual profile photo image data',
    file_name VARCHAR(255) NOT NULL COMMENT 'Original filename',
    file_type VARCHAR(100) NOT NULL COMMENT 'MIME type (image/jpeg, image/png, etc.)',
    file_size BIGINT NOT NULL COMMENT 'Size in bytes',
    width INT NULL COMMENT 'Image width in pixels',
    height INT NULL COMMENT 'Image height in pixels',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by BIGINT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_profile_user (user_id),
    INDEX idx_user_profile_uploaded (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key relationship to users table
ALTER TABLE users 
ADD COLUMN profile_photo_id BIGINT NULL,
ADD FOREIGN KEY (profile_photo_id) REFERENCES user_profile_photos(id) ON DELETE SET NULL;
*/

-- =============================================
-- Option 3: Hybrid approach (Both storage methods)
-- Keep the existing profile_photo_id for image table reference
-- Add direct photo storage for immediate access
-- =============================================

-- The ALTER TABLE statements above already implement this hybrid approach
-- Users can have either:
-- 1. profile_photo_id pointing to images table (for shared/public images)
-- 2. profile_photo_data with actual photo blob (for private profile photos)

-- =============================================
-- Sample Data Updates (Optional)
-- =============================================

-- Update existing users to have default profile photos (uncomment if needed)
/*
UPDATE users 
SET 
    profile_photo_name = 'default-avatar.jpg',
    profile_photo_type = 'image/jpeg',
    profile_photo_size = 45678,
    profile_photo_uploaded_at = NOW()
WHERE profile_photo_data IS NULL AND profile_photo_id IS NULL;
*/

-- =============================================
-- Verification Queries
-- =============================================

-- Check the updated users table structure
DESCRIBE users;

-- Show users with profile photos
SELECT 
    id, 
    email, 
    first_name, 
    last_name,
    CASE 
        WHEN profile_photo_data IS NOT NULL THEN 'Direct Storage'
        WHEN profile_photo_id IS NOT NULL THEN 'Image Table Reference'
        ELSE 'No Profile Photo'
    END as profile_photo_method,
    profile_photo_name,
    profile_photo_type,
    profile_photo_size,
    profile_photo_uploaded_at
FROM users 
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- =============================================
-- Success Message
-- =============================================

SELECT 'Profile photos schema update completed successfully!' as status;
SELECT 'Users table now supports direct photo storage' as method;
SELECT 'You can store actual photo data in profile_photo_data column' as capability;
