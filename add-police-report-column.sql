-- Add police_report_path column to therapists table
-- This column will store the path to the police report file (PDF, JPG, PNG)
ALTER TABLE therapists 
ADD COLUMN police_report_path VARCHAR(500) AFTER therapist_image_path;

-- Verify the column was added
DESCRIBE therapists;
