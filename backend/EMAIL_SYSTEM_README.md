# 📧 SPA Registration Email System

This document explains the automated email system that sends login credentials to spa owners after registration.

## 🔧 Configuration

The email system is configured to use Gmail with the following credentials:
- **Email:** `lankaspaassociation25@gmail.com`
- **App Password:** `nzfz wobs clfj abvz`

These credentials are stored in the `.env` file:
```env
EMAIL_USER=lankaspaassociation25@gmail.com
EMAIL_PASS=nzfz wobs clfj abvz
```

## 🚀 How It Works

### 1. **After Registration Submission**
When a spa owner completes registration through `/api/enhanced-registration/submit`:
- Random username and password are generated
- Registration data is saved to database
- **Automated email is sent** with login credentials
- Console shows credential details for backup

### 2. **After AdminLSA Approval/Rejection**
When AdminLSA approves or rejects a spa through `/api/admin-lsa-enhanced/spas/:id/approve` or `reject`:
- Status update email is automatically sent
- Email includes current login credentials
- Approval emails welcome users to the system
- Rejection emails explain the reason

## 📨 Email Types

### Registration Email
- **Subject:** "SPA Registration Successful - LSA Portal Access"
- **Contains:** Username, password, reference number, login link
- **Sent:** Immediately after successful registration

### Approval Email  
- **Subject:** "Spa Registration Approved - LSA Portal"
- **Contains:** Welcome message, login credentials, next steps
- **Sent:** When AdminLSA approves the spa

### Rejection Email
- **Subject:** "Spa Registration Rejected - LSA Portal"
- **Contains:** Rejection reason, resubmission instructions
- **Sent:** When AdminLSA rejects the spa

## 🔍 Testing

### Test Email System
```bash
node test-email-system.js
```

This will:
1. Test email server connection
2. Send test registration email
3. Send test approval email  
4. Send test rejection email

### Check Server Logs
When the server starts, you'll see:
```
📧 Email service ready: lankaspaassociation25@gmail.com
```

## 📁 File Structure

```
backend/
├── .env                           # Email credentials
├── utils/emailService.js          # Email service functions
├── routes/
│   ├── enhancedRegistrationRoutes.js  # Registration + email
│   └── enhancedAdminLSARoutes.js      # Approval/rejection + email
├── test-email-system.js           # Email testing script
└── server.js                      # Server startup with email check
```

## 🔧 Email Service Functions

### `sendRegistrationEmail()`
Sends welcome email with login credentials after registration
```javascript
const result = await sendRegistrationEmail(
    email, ownerName, spaName, username, password, referenceNumber
);
```

### `sendStatusUpdateEmail()`
Sends status update email when spa is approved/rejected
```javascript
const result = await sendStatusUpdateEmail(
    email, ownerName, spaName, status, username, password, reason
);
```

### `testEmailConnection()`
Tests if email server connection is working
```javascript
const isConnected = await testEmailConnection();
```

## 🎯 Integration Points

### Registration Flow
1. User submits registration form
2. **System generates username/password**
3. **Email sent automatically** ✅
4. User receives email with credentials
5. User can login to portal

### AdminLSA Flow
1. AdminLSA reviews registration
2. Clicks approve/reject
3. **Status email sent automatically** ✅
4. User notified of decision via email

## 💡 Features

- ✅ **Automatic email sending** after registration
- ✅ **Professional HTML email templates**
- ✅ **Secure credential generation**
- ✅ **Error handling** - continues if email fails
- ✅ **Email status logging** in console
- ✅ **Test script** for verification
- ✅ **Server startup email check**

## 🔒 Security Notes

- App password is used instead of regular Gmail password
- Credentials are logged to console as backup
- Email failure doesn't stop registration process
- Passwords are randomly generated (12 characters)
- Email templates are HTML-sanitized

## 🐛 Troubleshooting

### Email Not Sending
1. Check `.env` file exists with correct credentials
2. Verify Gmail app password is active
3. Check server logs for error messages
4. Run `node test-email-system.js` to diagnose

### Wrong Credentials in Email
- Credentials are generated during registration
- Same credentials used for approval/rejection emails
- If lost, user can contact support for password reset

The email system is now fully integrated and will automatically send professional emails to spa owners at registration and status updates! 🎉