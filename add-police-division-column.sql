-- Add police_division column to spas table
-- Run this migration script to add the police division field

USE lsa_spa_management;

-- Check if column exists before adding
SET @col_exists = (
    SELECT COUNT(*) 
    FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = 'lsa_spa_management' 
    AND TABLE_NAME = 'spas' 
    AND COLUMN_NAME = 'police_division'
);

-- Add the police_division column if it doesn't exist
SET @query = IF(
    @col_exists = 0,
    'ALTER TABLE spas ADD COLUMN police_division VARCHAR(100) AFTER address',
    'SELECT "Column police_division already exists" AS message'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the change
DESCRIBE spas;

SELECT 'Police Division column added/verified successfully!' AS status;
