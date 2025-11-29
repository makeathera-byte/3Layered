-- Migration: Add Razorpay payment fields to orders table
-- Description: Adds fields to store Razorpay order ID and payment ID for online payment tracking

-- Add Razorpay fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON public.orders(razorpay_payment_id);

-- Add comments for documentation
COMMENT ON COLUMN public.orders.razorpay_order_id IS 'Razorpay order ID generated when creating payment order';
COMMENT ON COLUMN public.orders.razorpay_payment_id IS 'Razorpay payment ID received after successful payment';

