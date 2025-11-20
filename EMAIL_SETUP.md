# Email Configuration Setup Guide

## 📧 Email Features

Your VSTRA store now sends automatic emails for:
1. ✅ **Order Confirmation** - When customer places an order
2. 📦 **Order Status Updates** - When admin changes order status (Processing, Shipped, Delivered)

## 🔧 Setup Instructions

### Step 1: Get Gmail App Password

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Enable **2-Step Verification** (if not already enabled)
4. Scroll down to **App passwords**
5. Click **App passwords**
6. Select **Mail** and **Other (Custom name)**
7. Enter "VSTRA Store" as the name
8. Click **Generate**
9. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 2: Update .env.local

Open your `.env.local` file and update these values:

```env
# Email Configuration (Gmail)
EMAIL_USER=your_actual_email@gmail.com
EMAIL_PASSWORD=your_16_character_app_password
EMAIL_FROM=VSTRA <noreply@vstra.com>
```

**Example:**
```env
EMAIL_USER=rachitkesarwani570@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=VSTRA <noreply@vstra.com>
```

### Step 3: Restart Server

```bash
npm run dev
```

## 📨 Email Templates

### Order Confirmation Email
Sent automatically when:
- Customer completes payment via Razorpay
- Order is successfully created

Includes:
- Order ID
- Order items with quantities and prices
- Total amount
- Shipping address
- Order status
- Beautiful branded design

### Order Status Update Email
Sent automatically when:
- Admin changes order status from dashboard

Includes:
- New status (Processing, Shipped, Delivered, Cancelled)
- Order ID
- Link to view order details

## 🎨 Email Design Features

- ✅ Professional branded design
- ✅ Mobile responsive
- ✅ Clear order details
- ✅ Status badges with colors
- ✅ Direct links to order page
- ✅ Contact information

## 🧪 Testing

1. Place a test order
2. Check the email inbox of the registered user
3. You should receive a beautiful order confirmation email

## 🔒 Security Notes

- Never commit your `.env.local` file to Git
- Use App Passwords, not your actual Gmail password
- App passwords are more secure and can be revoked anytime
- Each app password is unique to one application

## 🚨 Troubleshooting

### Email not sending?

1. **Check credentials**: Make sure EMAIL_USER and EMAIL_PASSWORD are correct
2. **Check 2-Step Verification**: Must be enabled for App Passwords
3. **Check console logs**: Look for email errors in terminal
4. **Gmail security**: Check if Gmail blocked the login attempt
5. **Firewall**: Ensure port 587 (SMTP) is not blocked

### Common Errors

**"Invalid login"**
- Double-check your app password
- Make sure you're using app password, not regular password

**"Connection timeout"**
- Check your internet connection
- Verify firewall settings

**"Authentication failed"**
- Regenerate app password
- Update .env.local with new password

## 📧 Using Other Email Services

### Using SendGrid, Mailgun, or other services:

Update `lib/email.js` transporter configuration:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
})
```

## 🎯 Next Steps

Once emails are working:
1. Customize email templates in `lib/email.js`
2. Add your logo to emails
3. Update contact email addresses
4. Test all email scenarios

---

**Need Help?** Check the console logs for detailed error messages!
