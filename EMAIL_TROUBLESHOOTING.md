# Email Troubleshooting Guide

## Issue: Users Not Receiving Order Confirmation Emails

### Quick Fix Checklist

1. **Verify Email Configuration in `.env.local`**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password-here
   EMAIL_FROM=VSTRA<your-email@gmail.com>
   ```

2. **Gmail App Password Setup** (REQUIRED for Gmail)
   
   Gmail no longer accepts regular passwords for third-party apps. You MUST use an App Password:
   
   **Steps to Generate Gmail App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Sign in to your Google Account
   - Select "Mail" as the app
   - Select "Other" as the device and name it "VSTRA"
   - Click "Generate"
   - Copy the 16-character password (remove spaces)
   - Paste it in `.env.local` as `EMAIL_PASSWORD`

3. **Enable 2-Step Verification** (Required for App Passwords)
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification" if not already enabled
   - Then you can create App Passwords

### Testing Email Configuration

1. **Check Server Logs**
   ```bash
   npm run dev
   ```
   Look for these messages:
   - ✅ Email configuration found
   - ✅ Email server is ready to send messages

2. **Test Order Creation**
   - Place a test order
   - Check terminal for:
     - `📧 Attempting to send email to: user@example.com`
     - `✅ Order confirmation email sent successfully`
     - `✅ Message ID: <message-id>`

3. **Common Error Messages**
   
   **Error: "Invalid login"**
   - You're using your regular Gmail password instead of App Password
   - Solution: Generate and use an App Password
   
   **Error: "Username and Password not accepted"**
   - 2-Step Verification not enabled
   - Solution: Enable 2-Step Verification first
   
   **Error: "No token provided"**
   - Email configuration missing from .env.local
   - Solution: Add EMAIL_USER and EMAIL_PASSWORD

### Email Sending Flow

1. **Order Confirmation Email**
   - Sent immediately when order is created
   - Triggered in: `pages/api/orders/index.js`
   - Function: `sendOrderConfirmationEmail()`

2. **Order Status Update Email**
   - Sent when admin updates order status
   - Triggered in: `pages/api/admin/orders/[id].js`
   - Function: `sendOrderStatusEmail()`

### Alternative Email Providers

If Gmail doesn't work, you can use other providers:

**SendGrid:**
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-api-key
EMAIL_FROM=noreply@yourdomain.com
```

**Mailgun:**
```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=your-api-key
MAILGUN_DOMAIN=your-domain.com
EMAIL_FROM=noreply@yourdomain.com
```

**AWS SES:**
```env
EMAIL_SERVICE=ses
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
EMAIL_FROM=noreply@yourdomain.com
```

### Debugging Steps

1. **Check if email is in spam folder**
   - Gmail might mark automated emails as spam
   - Check user's spam/junk folder

2. **Verify email address is correct**
   - Check user's email in database
   - Ensure no typos in email address

3. **Check server logs for errors**
   ```bash
   # Look for these in terminal
   ❌ Email transporter verification failed
   ❌ Failed to send email
   ❌ Email sending error
   ```

4. **Test email manually**
   Create a test API endpoint:
   ```javascript
   // pages/api/test-email.js
   import { sendOrderConfirmationEmail } from '../../lib/email'
   
   export default async function handler(req, res) {
     const testOrder = {
       _id: 'TEST123',
       orderItems: [{ name: 'Test Product', quantity: 1, price: 100 }],
       totalPrice: 100,
       createdAt: new Date()
     }
     
     const result = await sendOrderConfirmationEmail(
       testOrder,
       'your-test-email@gmail.com',
       'Test User'
     )
     
     res.json(result)
   }
   ```

### Production Considerations

1. **Use Environment Variables**
   - Never commit `.env.local` to Git
   - Set environment variables in your hosting platform (Vercel, Netlify, etc.)

2. **Email Rate Limits**
   - Gmail: 500 emails/day for free accounts
   - Consider using a dedicated email service for production

3. **Email Deliverability**
   - Use a custom domain for better deliverability
   - Set up SPF, DKIM, and DMARC records
   - Use a professional email service (SendGrid, Mailgun, AWS SES)

### Current Configuration Status

✅ Email service configured in `lib/email.js`
✅ Order confirmation emails implemented
✅ Order status update emails implemented
✅ Error handling and logging added
✅ Immediate email sending (not deferred)

### Need Help?

If emails still aren't working:
1. Check the terminal logs for specific error messages
2. Verify your Gmail App Password is correct
3. Test with a different email address
4. Consider using a dedicated email service like SendGrid
