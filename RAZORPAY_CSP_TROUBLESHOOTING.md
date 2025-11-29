# 🔧 Razorpay CSP Blocking - Advanced Troubleshooting

## Current Fix Applied

### 1. ✅ Updated CSP with Wildcards
- Changed from specific domains to `https://*.razorpay.com` wildcards
- This allows all Razorpay subdomains to load

### 2. ✅ More Permissive CSP for Checkout Page
- Checkout and order confirmation pages now have more permissive CSP
- Added explicit `https://checkout.razorpay.com` in addition to wildcards
- Added `data:` and `blob:` to frame-src for additional compatibility

### 3. ✅ Removed X-Frame-Options
- Removed `X-Frame-Options: DENY` which was blocking iframes

## If Still Blocked - Additional Steps

### Step 1: Check Browser Console
Open browser DevTools (F12) and check:
1. **Console tab** - Look for CSP violation errors
2. **Network tab** - Check if Razorpay resources are loading (status 200)
3. **Security tab** - Check for blocked resources

### Step 2: Check Specific CSP Errors
Look for errors like:
```
Refused to frame 'https://checkout.razorpay.com' because it violates the following Content Security Policy directive: "frame-src ..."
```

This will tell you exactly which directive is blocking.

### Step 3: Temporary Test - Disable CSP for Checkout
If needed, you can temporarily disable CSP for checkout page to test:

```typescript
// In middleware.ts - TEMPORARY TEST ONLY
if (isCheckoutPage) {
  // Don't set CSP header at all for testing
  // response.headers.set('Content-Security-Policy', csp);
} else {
  // ... normal CSP
}
```

**⚠️ WARNING**: Only use this for testing! Re-enable CSP after confirming Razorpay works.

### Step 4: Check Browser Extensions
- **Ad blockers** (uBlock Origin, AdBlock Plus) may block payment iframes
- **Privacy extensions** (Privacy Badger, Ghostery) may block third-party scripts
- **Disable all extensions** and test again

### Step 5: Check Network/Firewall
- Corporate firewalls may block payment gateways
- VPNs may interfere with CSP
- Try from different network

### Step 6: Browser-Specific Issues
- **Chrome**: Check chrome://policy/ for enterprise policies
- **Firefox**: Check about:config for security.csp settings
- **Safari**: Check if Intelligent Tracking Prevention is blocking

## Alternative: Use Razorpay Popup Mode

If iframe continues to be blocked, you can configure Razorpay to open in a popup instead:

```typescript
// In app/checkout/page.tsx
const options = {
  key: razorpayKeyId,
  amount: razorpayData.order.amount,
  currency: razorpayData.order.currency,
  name: '3Layered',
  description: `Order ${orderNumber}`,
  order_id: razorpayData.order.id,
  modal: {
    ondismiss: function() {
      setProcessingPayment(false);
    },
    // Try popup mode if iframe is blocked
    escape: false,
    animation: true,
  },
  // Add this to open in popup
  popup: true, // This might help if iframe is blocked
};
```

## Current CSP Configuration

### For Checkout/Order Confirmation Pages:
```
script-src: 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.razorpay.com https://razorpay.com https://checkout.razorpay.com
style-src: 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.razorpay.com https://razorpay.com https://checkout.razorpay.com
frame-src: 'self' https://*.razorpay.com https://razorpay.com https://checkout.razorpay.com data: blob:
connect-src: 'self' https://*.supabase.co https://*.supabase.in https://*.razorpay.com https://razorpay.com https://api.razorpay.com https://checkout.razorpay.com
```

## Debugging Commands

### Check Current CSP Headers
```bash
curl -I https://your-domain.com/checkout | grep -i "content-security-policy"
```

### Test Razorpay Script Loading
Open browser console and run:
```javascript
// Check if Razorpay is loaded
console.log('Razorpay loaded:', typeof window.Razorpay !== 'undefined');

// Check if script tag exists
console.log('Script tag:', document.querySelector('script[src*="razorpay"]'));

// Check for CSP errors
console.log('CSP errors:', performance.getEntriesByType('resource')
  .filter(r => r.name.includes('razorpay') && r.transferSize === 0));
```

## Next Steps

1. **Restart server** after CSP changes
2. **Clear browser cache** completely
3. **Test in incognito mode** (no extensions)
4. **Check browser console** for specific errors
5. **Share the exact error message** from console if still blocked

## Status: CSP Updated with Wildcards

The CSP has been updated to be more permissive for Razorpay. If still blocked, check browser console for specific error messages.

