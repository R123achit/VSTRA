# Razorpay Payment Integration Setup

## Step 1: Install Razorpay Package

```bash
npm install razorpay
```

## Step 2: Add Your Razorpay Credentials

Open `.env.local` and replace the placeholder values with your actual Razorpay credentials:

```env
# Razorpay Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_actual_live_key_id
RAZORPAY_KEY_SECRET=your_actual_live_key_secret
```

**Important:** 
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - This is your Razorpay Key ID (starts with `rzp_live_`)
- `RAZORPAY_KEY_SECRET` - This is your Razorpay Key Secret (keep this private!)

## Step 3: Restart Your Development Server

After adding the credentials, restart your Next.js server:

```bash
npm run dev
```

## How It Works

### 1. **Create Payment Order**
When user clicks "Proceed to Payment", the system:
- Creates a Razorpay order via `/api/payment/create-order`
- Returns order ID and amount

### 2. **Open Razorpay Checkout**
- Razorpay modal opens with payment options
- User can pay via UPI, Cards, Net Banking, Wallets, etc.

### 3. **Payment Verification**
After successful payment:
- Payment signature is verified via `/api/payment/verify`
- Order is saved to database with payment details
- Cart is cleared and user is redirected to orders page

## Testing

### Test Mode (for development)
If you want to test first, use test credentials:
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_test_secret
```

### Test Cards
- **Success**: 4111 1111 1111 1111
- **Failure**: 4111 1111 1111 1234
- CVV: Any 3 digits
- Expiry: Any future date

### Test UPI
- **Success**: success@razorpay
- **Failure**: failure@razorpay

## Features Implemented

✅ Razorpay Checkout Integration
✅ Payment Verification with Signature
✅ Order Creation after Successful Payment
✅ Support for all Razorpay payment methods (UPI, Cards, Net Banking, Wallets)
✅ Secure payment handling
✅ Error handling and user feedback
✅ Mobile responsive checkout

## Security

- Payment verification uses HMAC SHA256 signature
- API keys are stored in environment variables
- Token-based authentication for API calls
- Razorpay Key Secret never exposed to frontend

## Support

For Razorpay integration issues:
- Visit: https://razorpay.com/docs/
- Dashboard: https://dashboard.razorpay.com/

## Currency

Currently set to **INR (Indian Rupees)**. All prices are displayed with ₹ symbol.
