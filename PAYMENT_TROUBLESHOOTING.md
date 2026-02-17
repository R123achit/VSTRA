# Payment Troubleshooting Guide

## Issue: "Failed to initiate payment"

This error occurs when Razorpay cannot create a payment order. Here are the common causes and solutions:

---

## ✅ Solution 1: Verify Environment Variables in Vercel

Make sure these variables are set correctly in Vercel:

### Required Variables:
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_RhsoGqDNrYz5Ms
RAZORPAY_KEY_SECRET=uSHxZqtPkZD1pJtutWqRgxAd
```

### How to Check:
1. Go to Vercel Dashboard
2. Your Project → **Settings** → **Environment Variables**
3. Verify both variables exist
4. Make sure there are no extra spaces or quotes

---

## ✅ Solution 2: Check Razorpay Account Status

### Verify Your Razorpay Account:
1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Check if your account is **activated**
3. Verify the API keys are correct

### Get Your API Keys:
1. Go to **Settings** → **API Keys**
2. Copy **Key ID** (starts with `rzp_live_` or `rzp_test_`)
3. Copy **Key Secret**
4. Update in Vercel if different

---

## ✅ Solution 3: Test Mode vs Live Mode

### If Using Test Mode:
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_test_secret
```

### If Using Live Mode:
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_RhsoGqDNrYz5Ms
RAZORPAY_KEY_SECRET=uSHxZqtPkZD1pJtutWqRgxAd
```

**Note:** Live mode requires KYC verification on Razorpay!

---

## ✅ Solution 4: Redeploy After Adding Variables

After adding/updating environment variables:

1. Go to Vercel Dashboard
2. Your Project → **Deployments**
3. Click **"Redeploy"** on the latest deployment
4. Or push a new commit to trigger auto-deploy

---

## ✅ Solution 5: Check Vercel Logs

To see the exact error:

1. Go to Vercel Dashboard
2. Your Project → **Deployments**
3. Click on the latest deployment
4. Click **"Functions"** tab
5. Find `/api/payment/create-order`
6. Check the logs for error messages

---

## 🔍 Common Error Messages

### Error: "Payment system not configured"
**Cause:** Razorpay credentials are missing or incorrect
**Solution:** Add/update `NEXT_PUBLIC_RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Vercel

### Error: "Authentication failed"
**Cause:** Invalid API keys
**Solution:** Verify keys in Razorpay Dashboard and update in Vercel

### Error: "Account not activated"
**Cause:** Razorpay account needs KYC verification
**Solution:** Complete KYC in Razorpay Dashboard or use test mode

---

## 🧪 Test Payment Flow

### Using Test Mode:

1. **Update to Test Keys:**
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=your_test_secret
   ```

2. **Test Card Details:**
   - Card Number: `4111 1111 1111 1111`
   - CVV: Any 3 digits
   - Expiry: Any future date
   - Name: Any name

3. **Test UPI:**
   - UPI ID: `success@razorpay`

---

## 📋 Checklist

Before testing payment, verify:

- [ ] Razorpay account is created
- [ ] API keys are generated
- [ ] Both environment variables are set in Vercel
- [ ] Variables have correct names (no typos)
- [ ] No extra spaces or quotes in values
- [ ] Redeployed after adding variables
- [ ] Using correct mode (test/live)
- [ ] If live mode: KYC is completed

---

## 🚀 Quick Fix Commands

### Check if variables are set (locally):
```bash
echo $NEXT_PUBLIC_RAZORPAY_KEY_ID
echo $RAZORPAY_KEY_SECRET
```

### Redeploy to Vercel:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

## 💡 Pro Tips

1. **Start with Test Mode:** Always test with test keys first
2. **Check Browser Console:** Open DevTools → Console for client-side errors
3. **Check Vercel Logs:** For server-side errors
4. **Verify Amount:** Make sure cart total is > 0
5. **Check Authentication:** User must be logged in

---

## 📞 Still Having Issues?

### Check These:
1. Browser console errors (F12 → Console)
2. Vercel function logs
3. Razorpay dashboard for failed transactions
4. Network tab (F12 → Network) for API call failures

### Contact Support:
- Razorpay Support: https://razorpay.com/support/
- Check Razorpay Status: https://status.razorpay.com/

---

## ✅ Success Indicators

Payment is working when you see:
- ✅ Razorpay payment modal opens
- ✅ Can select payment method
- ✅ Test payment succeeds
- ✅ Order is created in database
- ✅ Success modal appears
- ✅ Order appears in "My Orders"

---

**Last Updated:** After fixing Razorpay initialization with proper error handling
