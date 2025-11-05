# NIC Validation Implementation - Complete

## Overview
Added NIC duplicate validation to prevent therapists from registering with the same NIC number, except for resigned therapists who can re-register.

## Changes Made

### 1. Backend API Route (`backend/routes/newAdminSPARoutes.js`)

#### New Endpoint: Check NIC Exists
- **Route**: `POST /api/admin-spa-new/check-nic`
- **Purpose**: Check if NIC already exists in database
- **Request Body**: `{ nic: string }`
- **Response**:
  ```json
  {
    "success": true,
    "exists": boolean,
    "status": "pending|approved|rejected|terminated|resign|resigned",
    "message": "Descriptive message"
  }
  ```
- **Logic**:
  - Searches for NIC in `therapists` table (both `nic` and `nic_number` columns)
  - If NIC exists with status `resign` or `resigned`: allows registration (returns `exists: false`)
  - If NIC exists with any other status: blocks registration (returns `exists: true`)
  - If NIC not found: allows registration

#### Updated Endpoint: Add Therapist
- **Route**: `POST /api/admin-spa-new/add-therapist`
- **Enhancement**: Added NIC duplication check before insertion
- **Validation Flow**:
  1. Check if NIC already exists
  2. If exists and status is NOT `resign`/`resigned`: return error
  3. If exists and status IS `resign`/`resigned`: allow registration
  4. If not exists: allow registration

### 2. Frontend Component (`frontend/src/pages/AdminSPA/AdminSPA.jsx`)

#### New Function: `checkNICExists`
```javascript
const checkNICExists = async (nicValue) => {
    // Validates NIC format first
    // Calls /api/admin-spa-new/check-nic
    // Shows error if NIC is already registered
    // Shows SweetAlert if duplicate detected
}
```

#### Updated NIC Input Field
- Added `onBlur` event to trigger validation
- Shows real-time error message below input
- Displays SweetAlert with detailed message

#### Validation Behavior
1. User enters NIC and moves to next field (blur event)
2. System checks if NIC exists in database
3. If exists and not resigned: shows error and prevents form submission
4. If exists and resigned: allows registration (no error)
5. If not exists: allows registration

## Database Columns Used
- `therapists.nic` - Primary NIC field
- `therapists.nic_number` - Secondary NIC field
- `therapists.status` - Current status of therapist

## Status Values
- `pending` - ❌ Cannot duplicate
- `approved` - ❌ Cannot duplicate
- `rejected` - ❌ Cannot duplicate
- `terminated` - ❌ Cannot duplicate
- `resign` or `resigned` - ✅ CAN re-register (allowed)

## User Experience

### Scenario 1: New NIC (Not in Database)
1. User enters NIC
2. User clicks next field
3. ✅ No error shown
4. User can continue registration

### Scenario 2: Existing NIC (Active Therapist)
1. User enters NIC that exists with status `approved`
2. User clicks next field
3. ❌ Error message appears: "NIC is already registered with status: approved. Cannot duplicate."
4. 🚫 SweetAlert popup: "This NIC is already registered in the system with status: approved"
5. User cannot proceed until changing NIC

### Scenario 3: Existing NIC (Resigned Therapist)
1. User enters NIC that exists with status `resigned`
2. User clicks next field
3. ✅ No error shown (resigned therapists can re-register)
4. User can continue registration

## Testing Checklist
- [ ] Test with new NIC (should allow)
- [ ] Test with NIC of approved therapist (should block)
- [ ] Test with NIC of pending therapist (should block)
- [ ] Test with NIC of rejected therapist (should block)
- [ ] Test with NIC of terminated therapist (should block)
- [ ] Test with NIC of resigned therapist (should allow)
- [ ] Test with invalid NIC format (should show format error)
- [ ] Test backend validation when frontend is bypassed
- [ ] Test with both old NIC format (902541234V) and new format (200254123456)

## API Endpoints Summary
```
POST /api/admin-spa-new/check-nic
Body: { nic: "902541234V" }
Response: { success: true, exists: false, message: "..." }

POST /api/admin-spa-new/add-therapist
Body: FormData with firstName, lastName, birthday, nic, phone, files...
Response: { success: true, therapist_id: 123, ... }
```

## Files Modified
1. `backend/routes/newAdminSPARoutes.js` - Added check-nic route and validation
2. `frontend/src/pages/AdminSPA/AdminSPA.jsx` - Added checkNICExists function and onBlur event

## Security Notes
- ✅ Both frontend and backend validation implemented
- ✅ Cannot bypass validation by editing frontend
- ✅ Database query checks both `nic` and `nic_number` columns
- ✅ Case-insensitive NIC matching (V/v, X/x)

## Implementation Date
November 5, 2025

## Status
✅ **COMPLETE** - Ready for testing
