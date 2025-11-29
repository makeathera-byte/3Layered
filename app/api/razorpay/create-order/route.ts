import { NextRequest, NextResponse } from "next/server";
import { getRazorpayInstance } from "@/lib/razorpay/config";
import { handleApiError, ValidationError } from "@/lib/backend/errors";
import { logger } from "@/lib/backend/logger";
import { rateLimit, getClientIP } from "@/lib/backend/security";

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  
  try {
    // Rate limiting
    if (!rateLimit(`razorpay:create:${clientIP}`, 20, 60000)) {
      logger.warn('Rate limit exceeded for Razorpay order creation', { ip: clientIP });
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { amount, currency = 'INR', receipt, notes } = body;

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new ValidationError("Invalid amount. Amount must be a positive number.");
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    // For INR, 1 rupee = 100 paise
    const amountInPaise = Math.round(amount * 100);

    // Minimum amount validation (₹1 = 100 paise)
    if (amountInPaise < 100) {
      throw new ValidationError("Minimum order amount is ₹1");
    }

    // Validate currency
    if (currency !== 'INR') {
      throw new ValidationError("Only INR currency is supported");
    }

    logger.info('Creating Razorpay order', { 
      amount: amountInPaise, 
      currency,
      receipt,
      ip: clientIP 
    });

    // Initialize Razorpay
    const razorpay = getRazorpayInstance();

    // Create Razorpay order with timeout and retry logic
    let razorpayOrder;
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        razorpayOrder = await Promise.race([
          razorpay.orders.create({
            amount: amountInPaise,
            currency: currency,
            receipt: receipt || `receipt_${Date.now()}`,
            notes: notes || {},
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Razorpay API timeout')), 10000)
          )
        ]) as any;
        break; // Success, exit retry loop
      } catch (error: any) {
        lastError = error;
        logger.warn(`Razorpay order creation attempt ${attempt}/${maxRetries} failed`, { 
          error: error.message,
          attempt,
          ip: clientIP 
        });
        
        if (attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    if (!razorpayOrder) {
      throw new Error(`Failed to create Razorpay order after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
    }

    logger.info('Razorpay order created successfully', { 
      orderId: razorpayOrder.id,
      amount: amountInPaise 
    });

    return NextResponse.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status,
        created_at: razorpayOrder.created_at,
      },
    });

  } catch (error: any) {
    logger.error('Razorpay order creation failed', error, { ip: clientIP });
    return handleApiError(error);
  }
}

