# Police Report Upload Feature - Implementation Summary

## Overview
Added functionality to upload and save police reports (PDF, JPG, PNG) when terminating therapists in the Manage Staff tab of the adminSPA dashboard.

## Changes Made

### 1. Database Changes ✅
**File**: `add-police-report-column-script.js`
- Added `police_report_path` column to the `therapists` table
- Column type: `VARCHAR(500)`
- Position: After `therapist_image` column
- Status: **Successfully executed** ✅

### 2. Frontend Changes ✅
**File**: `frontend/src/pages/AdminSPA/ResignTerminate.jsx`

**Modified Function**: `handleTerminate()`

**Changes**:
- Updated the termination modal to include a file upload input
- Added file validation:
  - Accepted formats: PDF, JPG, JPEG, PNG
  - Maximum file size: 5MB
- Changed from plain reason input to a custom HTML modal with:
  - Textarea for termination reason
  - File input for police report upload
  - Validation for both required reason and optional file
- Updated the API call to use `FormData` instead of JSON to support file uploads
- The file is sent as `police_report` in the form data

**Key Features**:
- Police report upload is **optional** (not required)
- File format validation (PDF, JPG, PNG only)
- File size validation (5MB max)
- User-friendly error messages for invalid files

### 3. Backend Changes ✅
**File**: `backend/routes/newAdminSPARoutes.js`

**Modified Route**: `PUT /therapists/:therapistId/status`

**Changes**:
- Added `upload.single('police_report')` middleware to handle file upload
- Process uploaded file and save path as `/uploads/therapist-documents/[filename]`
- Updated SQL query to include `police_report_path` column when terminating
- Added conditional logic:
  - If file is uploaded: Save the path to the database
  - If no file: Proceed without the path (NULL value)
- Enhanced activity log to indicate when a police report is uploaded
- Return police report upload status in the response

**SQL Query Logic**:
```sql
-- For termination with police report
UPDATE therapists 
SET status = 'terminated', 
    terminate_reason = ?, 
    police_report_path = ?, 
    updated_at = NOW() 
WHERE id = ? AND spa_id = ?

-- For termination without police report
UPDATE therapists 
SET status = 'terminated', 
    terminate_reason = ?, 
    updated_at = NOW() 
WHERE id = ? AND spa_id = ?
```

## Field Name Consistency ✅
As requested, the field names are consistent between UI and database:
- **Frontend form field**: `police_report`
- **Backend receives**: `req.file` (from multer middleware with field name `police_report`)
- **Database column**: `police_report_path`

## File Storage
- **Location**: `uploads/therapist-documents/`
- **Naming**: `police_report-[timestamp]-[random].{ext}`
- **Path saved to DB**: `/uploads/therapist-documents/[filename]`

## Testing Checklist
- [x] Database column added successfully
- [x] Frontend modal displays file upload input
- [x] File validation works (format and size)
- [x] File upload is optional (can terminate without file)
- [x] Backend receives and processes file correctly
- [x] File path is saved to database
- [x] Activity log reflects police report upload

## Notes
- ✅ **No breaking changes** - All existing functionality remains intact
- ✅ **Backward compatible** - Police report is optional
- ✅ **Secure** - File type and size validation implemented
- ✅ **Simple approach** - Minimal changes to existing code

## How to Use
1. Navigate to **Manage Staff** tab in adminSPA dashboard
2. Click **Terminate** button on any active therapist
3. Enter termination reason (required)
4. Optionally upload police report (PDF, JPG, or PNG, max 5MB)
5. Click **Terminate** to submit

The system will save both the reason and the police report (if uploaded) to the `therapists` table in the database.
