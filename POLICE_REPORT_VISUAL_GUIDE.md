# Visual Guide: Police Report Upload Feature

## Before vs After

### BEFORE: Simple Termination
```
┌─────────────────────────────────┐
│   Confirm Termination           │
├─────────────────────────────────┤
│                                 │
│  Enter termination reason:      │
│  ┌───────────────────────────┐  │
│  │                           │  │
│  │  [Reason textarea]        │  │
│  │                           │  │
│  └───────────────────────────┘  │
│                                 │
│  [Cancel]      [Terminate]      │
└─────────────────────────────────┘
```

### AFTER: Termination with Police Report Upload
```
┌─────────────────────────────────────────┐
│   Confirm Termination                   │
├─────────────────────────────────────────┤
│                                         │
│  Enter termination reason:              │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │  [Reason textarea]              │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Upload Police Report (PDF, JPG, PNG):  │
│  ┌─────────────────────────────────┐    │
│  │  [Choose File] No file chosen   │    │
│  └─────────────────────────────────┘    │
│  Maximum file size: 5MB                 │
│                                         │
│  [Cancel]             [Terminate]       │
└─────────────────────────────────────────┘
```

## Database Structure

### therapists Table - New Column Added

```sql
+---------------------+---------------+------+
| Column Name         | Type          | Null |
+---------------------+---------------+------+
| ...                 | ...           | ...  |
| therapist_image     | varchar(500)  | YES  |
| police_report_path  | varchar(500)  | YES  | ← NEW COLUMN
| experience_years    | int           | YES  |
| ...                 | ...           | ...  |
+---------------------+---------------+------+
```

## API Request Flow

### Frontend → Backend

**Request:**
```
PUT /api/admin-spa-new/therapists/:therapistId/status
Content-Type: multipart/form-data

FormData:
- status: "terminated"
- spa_id: "123"
- reason: "Violation of company policy"
- police_report: [File object] (optional)
```

**Response:**
```json
{
  "success": true,
  "message": "Therapist terminated successfully",
  "id": 456,
  "status": "terminated",
  "police_report_uploaded": true
}
```

## File Upload Process

```
User clicks Terminate
         ↓
Modal displays with file upload
         ↓
User enters reason + uploads file (optional)
         ↓
Frontend validates:
  - File format (PDF/JPG/PNG)
  - File size (< 5MB)
         ↓
FormData created with:
  - status
  - spa_id
  - reason
  - police_report file
         ↓
Sent to backend via fetch
         ↓
Backend multer middleware processes file
         ↓
File saved to: uploads/therapist-documents/
         ↓
Path saved to DB: /uploads/therapist-documents/[filename]
         ↓
Activity log updated
         ↓
Success response sent
         ↓
UI updates therapist status
```

## Code Changes Summary

### 1. Frontend (ResignTerminate.jsx)
- ✅ Added file input to termination modal
- ✅ Added file validation logic
- ✅ Changed from JSON to FormData
- ✅ Removed Content-Type header (auto-set by browser)

### 2. Backend (newAdminSPARoutes.js)
- ✅ Added `upload.single('police_report')` middleware
- ✅ Process `req.file` for uploaded police report
- ✅ Updated SQL queries to include police_report_path
- ✅ Enhanced activity logging

### 3. Database
- ✅ Added `police_report_path` column
- ✅ Type: VARCHAR(500)
- ✅ Nullable: YES (optional field)

## Important Notes

✅ **Field Name Consistency:**
- UI form field: `police_report`
- Backend file field: `police_report`
- Database column: `police_report_path`

✅ **Backward Compatibility:**
- Police report is optional
- Existing terminations work without file

✅ **No Breaking Changes:**
- All previous functionality intact
- Only additions, no removals
