# Police Division Field - UI Location Guide

## Registration Form Structure

When you visit: `http://localhost:5173/registration`

### Form Sections:
1. Initial Step (Register/Login selection)
2. Prerequisites (Document checklist)
3. **Details Step** ← Police Division is here
4. Payment

---

## Details Step - Spa Information Section

The form is organized as follows:

```
┌─────────────────────────────────────────────────────────────┐
│ PERSONAL INFORMATION                                         │
│ ├─ First Name          ├─ Last Name                          │
│ ├─ Email               ├─ Telephone                          │
│ ├─ Cell Phone          ├─ NIC Number                         │
│ ├─ NIC Front Photo     ├─ NIC Back Photo                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SPA INFORMATION                                              │
│ ├─ Spa Name                                                  │
│ │                                                            │
│ ├─ Spa Address                                               │
│ │  ├─ Address Line 1  ├─ Address Line 2 (Optional)         │
│ │  ├─ Province/State  ├─ Postal Code                       │
│ │  └─ Police Division ← NEW FIELD HERE!                    │
│ │                                                            │
│ ├─ Spa Telephone      ├─ Spa BR Number                      │
│ ├─ BR Attachment      ├─ Form 1 Certificate                 │
│ ├─ Spa Banner Photo   ├─ Facility Photos                    │
│ └─ Professional Certs ├─ Other Document                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Police Division Field Details

### Location
- **Section**: Spa Information
- **Subsection**: Spa Address
- **Position**: Below "Province/State" and "Postal Code", on a new row
- **Layout**: Takes left half of the row (responsive grid)

### Field Properties
```javascript
Field Name: policeDivision
Label: "Police Division *"
Placeholder: "e.g., Colombo, Kandy, Galle"
Type: text
Required: Yes
Validation: Name validation (letters, spaces, hyphens)
```

### Visual Example

```
┌──────────────────────────────────┬──────────────────────────────────┐
│ Province/State *                 │ Postal Code *                    │
│ ┌──────────────────────────────┐ │ ┌──────────────────────────────┐ │
│ │ e.g., Western, Central...    │ │ │ 10100                        │ │
│ └──────────────────────────────┘ │ └──────────────────────────────┘ │
│                                  │ 5 digit postal code              │
└──────────────────────────────────┴──────────────────────────────────┘
┌──────────────────────────────────┬──────────────────────────────────┐
│ Police Division *                │                                  │
│ ┌──────────────────────────────┐ │                                  │
│ │ e.g., Colombo, Kandy, Galle  │ │                                  │
│ └──────────────────────────────┘ │                                  │
└──────────────────────────────────┴──────────────────────────────────┘
```

---

## Validation Behavior

### On Focus Out (blur)
- Field is validated when user leaves the field
- Error message appears if invalid

### Valid Input Examples
✅ Colombo
✅ Mount Lavinia
✅ Galle Fort
✅ Kandy Central

### Invalid Input Examples
❌ (empty) - Required field
❌ 123456 - No numbers allowed
❌ Col@mbo - No special characters (except space and hyphen)

### Error Message Format
```
┌──────────────────────────────────┐
│ Police Division *                │
│ ┌──────────────────────────────┐ │
│ │                              │ │ ← Red border if error
│ └──────────────────────────────┘ │
│ ⚠️ Please enter a valid Police   │ ← Error message
│    Division                      │
└──────────────────────────────────┘
```

---

## Data Flow

### Frontend → Backend → Database

```
User Input: "Colombo"
     ↓
Frontend State: policeDivision: "Colombo"
     ↓
Form Submit: FormData.append('policeDivision', 'Colombo')
     ↓
Backend Receives: req.body.policeDivision = "Colombo"
     ↓
Database INSERT: police_division = "Colombo"
     ↓
Database Column: police_division VARCHAR(100)
```

---

## Testing Checklist

### Frontend Testing
- [ ] Field appears in the form
- [ ] Field has red asterisk (required indicator)
- [ ] Placeholder text shows correctly
- [ ] Field accepts valid input
- [ ] Field rejects invalid input
- [ ] Error message appears on invalid input
- [ ] Error message clears on valid input
- [ ] Field value persists during form navigation

### Backend Testing
- [ ] Value is received in req.body
- [ ] Value is passed to database query
- [ ] Database accepts the value
- [ ] Value is stored correctly

### Database Testing
```sql
-- After registration, verify data
SELECT id, name, police_division 
FROM spas 
WHERE police_division IS NOT NULL 
ORDER BY id DESC 
LIMIT 1;
```

Expected Result:
```
+----+------------------+-----------------+
| id | name             | police_division |
+----+------------------+-----------------+
|  X | Test Spa Name    | Colombo         |
+----+------------------+-----------------+
```

---

## Common Examples of Police Divisions in Sri Lanka

- Colombo
- Gampaha
- Kalutara
- Kandy
- Matale
- Nuwara Eliya
- Galle
- Matara
- Hambantota
- Jaffna
- Kilinochchi
- Mannar
- Vavuniya
- Mullaitivu
- Batticaloa
- Ampara
- Trincomalee
- Kurunegala
- Puttalam
- Anuradhapura
- Polonnaruwa
- Badulla
- Monaragala
- Ratnapura
- Kegalle

---

## Implementation Status: ✅ COMPLETE

All components are implemented and tested:
- ✅ UI Field
- ✅ State Management
- ✅ Validation
- ✅ Backend Processing
- ✅ Database Storage
- ✅ Error Handling
