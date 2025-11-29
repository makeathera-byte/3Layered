# Razorpay Payment Gateway Integration

This document provides instructions for setting up and using the Razorpay payment gateway integration.

## 📋 Prerequisites

1. A Razorpay account (sign up at [razorpay.com](https://razorpay.com))
2. Razorpay API keys (Key ID and Key Secret)

## 🔧 Setup Instructions

### 1. Get Razorpay API Keys

1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Navigate to **Settings** → **API Keys**
3. Generate API keys if you haven't already
4. Copy your **Key ID** and **Key Secret**

### 2. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

**Note**: 
- `RAZORPAY_KEY_ID` and `NEXT_PUBLIC_RAZORPAY_KEY_ID` should be the same value
- Use test keys for development and live keys for production
- Never commit your `.env.local` file to version control

### 3. Database Migration

Run the following SQL migration in your Supabase SQL Editor to add Razorpay fields to the orders table:

```sql
-- Add Razorpay fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON public.orders(razorpay_payment_id);
```

Or use the migration file: `supabase/migrations/009_add_razorpay_fields.sql`

## 🚀 How It Works

### Payment Flow

1. **User selects "Online Payment"** on the checkout page
2. **Order is created** in the database with `payment_method: "razorpay"` and `payment_status: "pending"`
3. **Razorpay order is created** via `/api/razorpay/create-order`
4. **Payment modal opens** with Razorpay checkout
5. **User completes payment** using UPI, Card, Net Banking, or Wallet
6. **Payment is verified** via `/api/razorpay/verify-payment`
7. **Order is updated** with payment details and status changed to `paid`
8. **User is redirected** to order confirmation page

### API Endpoints

#### 1. Create Razorpay Order
- **Endpoint**: `POST /api/razorpay/create-order`
- **Purpose**: Creates a Razorpay order for payment
- **Request Body**:
  ```json
  {
    "amount": 1000,
    "currency": "INR",
    "receipt": "order_123",
    "notes": {
      "order_id": "uuid",
      "order_number": "ORD-123"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "order": {
      "id": "order_xxxxx",
      "amount": 100000,
      "currency": "INR",
      "receipt": "order_123",
      "status": "created"
    }
  }
  ```

#### 2. Verify Payment
- **Endpoint**: `POST /api/razorpay/verify-payment`
- **Purpose**: Verifies Razorpay payment signature and updates order
- **Request Body**:
  ```json
  {
    "razorpay_order_id": "order_xxxxx",
    "razorpay_payment_id": "pay_xxxxx",
    "razorpay_signature": "signature_xxxxx",
    "order_id": "uuid"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "verified": true,
    "message": "Payment verified successfully",
    "payment_id": "pay_xxxxx",
    "order_id": "order_xxxxx"
  }
  ```

## 🔒 Security Features

1. **Signature Verification**: All payments are verified using HMAC SHA256 signature
2. **Server-Side Processing**: Payment verification happens on the server, not client
3. **Rate Limiting**: API endpoints are rate-limited to prevent abuse
4. **Input Validation**: All inputs are validated and sanitized

## 🧪 Testing

### Test Mode

1. Use Razorpay test keys (start with `rzp_test_`)
2. Use Razorpay test cards:
   - **Success**: `4111 1111 1111 1111`
   - **Failure**: `4000 0000 0000 0002`
   - **CVV**: Any 3 digits
   - **Expiry**: Any future date

### Test UPI IDs

- `success@razorpay`
- `failure@razorpay`

## 📝 Order Status Flow

```
pending → (payment initiated) → paid → confirmed
```

For COD orders:
```
pending → confirmed
```

## 🐛 Troubleshooting

### Payment Gateway Not Loading

- Check if Razorpay script is loaded (check browser console)
- Verify `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set correctly
- Check network connectivity

### Payment Verification Fails

- Verify `RAZORPAY_KEY_SECRET` matches your Razorpay account
- Check that signature verification is working
- Review server logs for detailed error messages

### Order Not Updating After Payment

- Check database connection
- Verify order_id is being passed correctly
- Check Supabase RLS policies allow updates

## 📚 Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Checkout Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)

## 🔄 Production Checklist

Before going live:

- [ ] Switch to Razorpay live keys
- [ ] Update environment variables with live keys
- [ ] Test payment flow end-to-end
- [ ] Set up webhook for payment status updates (optional)
- [ ] Configure payment success/failure redirect URLs
- [ ] Test with real payment methods
- [ ] Set up monitoring and alerts

## 💡 Notes

- Minimum order amount: ₹1 (100 paise)
- Only INR currency is supported
- Payment gateway automatically loads when checkout page loads
- COD option remains available alongside online payment

