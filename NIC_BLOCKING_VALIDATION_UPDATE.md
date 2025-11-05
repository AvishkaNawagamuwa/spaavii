# NIC Validation - Blocking Next Button Update

## Enhancement Made

### Problem
User could potentially click "Next" button before NIC validation completed, allowing them to proceed even with duplicate NIC.

### Solution
Added **blocking validation** that prevents progression to Step 2 until NIC is verified as unique (or resigned).

---

## Changes Made

### 1. Added State Variable
```javascript
const [checkingNIC, setCheckingNIC] = useState(false);
```

### 2. Updated `nextStep()` Function
```javascript
const nextStep = async () => {
    // Validate form fields first
    if (!validateStep(currentStep)) {
        return;
    }

    // BLOCKING NIC CHECK on Step 1
    if (currentStep === 1 && formData.nic.trim()) {
        setCheckingNIC(true);
        const nicCheckPassed = await checkNICBeforeNext(formData.nic);
        setCheckingNIC(false);
        
        if (!nicCheckPassed) {
            return; // ❌ BLOCKED - Cannot proceed
        }
    }

    // ✅ All validations passed - proceed to next step
    if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
    }
};
```

### 3. Created `checkNICBeforeNext()` Function
```javascript
const checkNICBeforeNext = async (nicValue) => {
    // Calls API to check NIC
    // Returns true if NIC is available
    // Returns false if NIC is duplicated
    // Shows error popup if blocked
}
```

### 4. Updated Next Button UI
```javascript
<button 
    onClick={nextStep} 
    disabled={checkingNIC}
    className={checkingNIC ? 'bg-gray-400' : 'bg-[#0A1428]'}
>
    {checkingNIC ? (
        <>
            <spinner /> Validating NIC...
        </>
    ) : (
        <>
            Next →
        </>
    )}
</button>
```

---

## User Experience Flow

### ✅ Valid NIC (Not in Database)
```
1. User fills form on Step 1
2. User clicks "Next" button
3. Button shows: "Validating NIC..." (disabled)
4. ✅ NIC verified as available
5. Button returns to normal
6. User proceeds to Step 2
```

### ✅ Valid NIC (Resigned Therapist)
```
1. User fills form with NIC of resigned therapist
2. User clicks "Next" button  
3. Button shows: "Validating NIC..." (disabled)
4. ✅ System allows re-registration
5. Button returns to normal
6. User proceeds to Step 2
```

### ❌ Duplicate NIC (Active/Pending/Rejected/Terminated)
```
1. User fills form with existing NIC
2. User clicks "Next" button
3. Button shows: "Validating NIC..." (disabled)
4. ❌ NIC found with status: approved
5. Error popup appears:
   "Cannot Proceed - This NIC is already 
    registered with status: approved"
6. Red error message under NIC field
7. User stays on Step 1
8. Button returns to normal
9. User must change NIC to proceed
```

---

## Validation Layers

### Layer 1: Field Validation (Instant)
- First name, last name, birthday, phone validation
- NIC format validation (902541234V or 200254123456)

### Layer 2: NIC Duplication Check (onBlur)
- Triggered when user leaves NIC field
- Shows warning immediately
- Non-blocking (just warning)

### Layer 3: NIC Duplication Check (Next Button) ⭐ **NEW**
- Triggered when user clicks "Next"
- **BLOCKING** - prevents progression
- Shows loading spinner
- Must pass to proceed

### Layer 4: Backend Validation (Submit)
- Final check on server
- Prevents any bypass attempts

---

## Visual States

### Normal State (Step 1)
```
┌────────────────────────────────────────┐
│ [Previous]    Step 1 of 3    [Next →] │
│  (disabled)                   (active) │
└────────────────────────────────────────┘
```

### Checking NIC State
```
┌────────────────────────────────────────┐
│ [Previous]    Step 1 of 3    [🔄 Validating NIC...] │
│  (disabled)                   (disabled, gray)        │
└────────────────────────────────────────┘
```

### Error State (Duplicate NIC)
```
┌───────────────────────────────────────────┐
│  ❌ Cannot Proceed                        │
│                                           │
│  This NIC is already registered with      │
│  status: approved. Please use a           │
│  different NIC or contact administrator.  │
│                                           │
│              [ OK ]                       │
└───────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ NIC Number                              │
│ ┌────────────────────────────────────┐ │
│ │ 902541234V                   ❌    │ │ ← Red border
│ └────────────────────────────────────┘ │
│ ⚠️ NIC is already registered with      │
│    status: approved. Cannot duplicate. │
└────────────────────────────────────────┘

User must change NIC to proceed
```

---

## Benefits

✅ **Cannot bypass** - User physically blocked from proceeding  
✅ **Clear feedback** - Loading spinner shows validation in progress  
✅ **User-friendly** - Error message explains what to do  
✅ **Double validation** - Both onBlur AND Next button check  
✅ **Performance** - Only checks when necessary (Step 1 Next)  

---

## Testing Scenarios

### Test 1: Valid NIC
- Enter new NIC (not in DB)
- Click Next
- Should show "Validating NIC..." briefly
- Should proceed to Step 2

### Test 2: Duplicate NIC  
- Enter existing NIC (status: approved)
- Click Next
- Should show "Validating NIC..." briefly
- Should show error popup
- Should stay on Step 1
- Button should return to normal
- User should see error under NIC field

### Test 3: Resigned Therapist NIC
- Enter NIC with status: resigned
- Click Next
- Should show "Validating NIC..." briefly
- Should proceed to Step 2

### Test 4: Network Error
- Disconnect internet
- Click Next
- Should handle gracefully
- Should allow progression (backend will catch)

---

## Files Modified
- `frontend/src/pages/AdminSPA/AdminSPA.jsx`
  - Added `checkingNIC` state
  - Updated `nextStep()` to be async with NIC check
  - Created `checkNICBeforeNext()` function
  - Updated Next button UI with loading state

---

## Implementation Date
November 5, 2025

## Status
✅ **COMPLETE** - Next button now blocks until NIC is validated
