# Email Verification Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: Users Created with `email_verified: true` but No Email Sent

**Symptoms:**
- New users can create posts immediately
- No verification banner appears
- No verification email received
- Console shows: `🔍 User is verified: user@example.com email_verified: true`

**Root Cause:**
Backend is auto-verifying users when email settings are not configured.

**Solution:**
1. **Configure Email Settings** (Backend):
   ```bash
   # Add to .env file or environment variables
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   ```

2. **Restart Backend Server** after setting environment variables

3. **Test Email Configuration**:
   ```bash
   cd matchgen-backend
   python test_email_config.py
   ```

### Issue 2: Verification Email Not Received

**Symptoms:**
- User created successfully
- Verification banner appears
- No email in inbox or spam folder

**Solutions:**

1. **Check Email Settings**:
   - Verify `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD` are set
   - Test SMTP connection using the test script

2. **Check Spam Folder**:
   - Look in spam/junk folder
   - Add `noreply@matchgen.com` to safe senders

3. **Gmail Setup** (if using Gmail):
   - Enable 2-Factor Authentication
   - Generate App Password (not regular password)
   - Use App Password as `EMAIL_HOST_PASSWORD`

4. **Check Backend Logs**:
   ```bash
   # Look for these log messages:
   # "Verification email sent to user@example.com"
   # "Email settings not configured. Skipping email send"
   ```

### Issue 3: Verification Link Not Working

**Symptoms:**
- Email received but link doesn't work
- 404 error when clicking verification link
- "Invalid or expired token" message

**Solutions:**

1. **Check Frontend URL**:
   ```python
   # In settings.py, ensure FRONTEND_URL is correct:
   FRONTEND_URL = "https://your-frontend-domain.com"
   ```

2. **Check Token Expiration**:
   - Tokens expire after 24 hours
   - Use "Resend Email" to get new token

3. **Check URL Routing**:
   - Ensure `/verify-email` route exists in frontend
   - Check that `EmailVerification.jsx` component is properly routed

### Issue 4: Verification Banner Not Appearing

**Symptoms:**
- User should see verification banner but doesn't
- Can create posts without verification

**Solutions:**

1. **Check User Data**:
   ```javascript
   // In browser console, check user object:
   console.log('User data:', user);
   console.log('Email verified:', user?.email_verified);
   ```

2. **Check API Response**:
   - Verify `/api/users/me/` returns `email_verified: false`
   - Check network tab for API calls

3. **Check Component Rendering**:
   - Ensure `EmailVerificationBanner` is imported and used
   - Check that `user` prop is passed correctly

### Issue 5: "Resend Email" Not Working

**Symptoms:**
- Clicking "Resend Email" shows error
- No new email received

**Solutions:**

1. **Check Backend Endpoint**:
   - Verify `/api/users/resend-verification/` exists
   - Check backend logs for errors

2. **Check Authentication**:
   - Ensure user is logged in
   - Check that `accessToken` is valid

3. **Check Rate Limiting**:
   - Backend may limit resend requests
   - Wait a few minutes before trying again

## Debugging Steps

### 1. Check Backend Configuration
```bash
cd matchgen-backend
python test_email_config.py
```

### 2. Check Frontend User State
```javascript
// In browser console:
console.log('Current user:', localStorage.getItem('accessToken'));
// Check network tab for /api/users/me/ response
```

### 3. Check Email Settings
```python
# In Django shell:
from django.conf import settings
print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
print(f"EMAIL_HOST_PASSWORD: {'*' * len(settings.EMAIL_HOST_PASSWORD) if settings.EMAIL_HOST_PASSWORD else 'NOT SET'}")
```

### 4. Test Email Sending
```python
# In Django shell:
from django.core.mail import send_mail
send_mail(
    'Test Email',
    'This is a test email.',
    'noreply@matchgen.com',
    ['your-email@example.com'],
    fail_silently=False,
)
```

## Environment Variables Checklist

### Backend (.env file):
```bash
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@matchgen.com

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env file):
```bash
# API Configuration
VITE_API_BASE_URL=https://your-backend-domain.com/api/
```

## Testing the Complete Flow

1. **Create New Account**:
   - Go to signup page
   - Create account with new email
   - Should see verification step

2. **Check Email**:
   - Look for verification email
   - Check spam folder if not in inbox

3. **Verify Email**:
   - Click verification link
   - Should redirect to verification success page

4. **Test Post Creation**:
   - Go to post generator
   - Should be able to create posts
   - No verification banner should appear

## Common Error Messages

### "Email settings not configured"
- **Solution**: Set `EMAIL_HOST_USER` and `EMAIL_HOST_PASSWORD`

### "Invalid or expired token"
- **Solution**: Use "Resend Email" to get new token

### "User already verified"
- **Solution**: Check if user was auto-verified due to missing email settings

### "Failed to send verification email"
- **Solution**: Check email provider credentials and SMTP settings

## Support

If issues persist:
1. Check backend logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test email configuration using the provided test script
4. Check frontend console for JavaScript errors
5. Verify API endpoints are working correctly
