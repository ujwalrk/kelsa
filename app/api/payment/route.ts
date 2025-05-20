import { NextResponse, NextRequest } from 'next/server';
import Razorpay from 'razorpay';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Define an interface for the request body
interface PaymentRequestBody {
  amount: number;
  userId: string;
}

// Define the error type for Razorpay (more comprehensive)
interface RazorpaySDKError {
  code?: string;
  description?: string;
  field?: string; // Often present for validation errors
  // Add other properties if Razorpay SDK returns them consistently
}

interface CustomError extends Error {
  statusCode?: number;
  error?: RazorpaySDKError;
  message: string; // Ensure message is always a string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PaymentRequestBody;
    const { amount, userId } = body;

    // --- Input Validation ---
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount provided.' }, { status: 400 });
    }
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    // Initialize Supabase client for database operations
    const supabase = createRouteHandlerClient({ cookies });

    // --- Environment Variable Check ---
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('Environment variables RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET are not set.');
      return NextResponse.json(
        { error: 'Server configuration error: Razorpay credentials missing.' },
        { status: 500 }
      );
    }

    // Initialize Razorpay with your key_id and key_secret
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    });

    // Create a payment capture to generate a payment link
    const paymentCapture = 1; // Auto-capture the payment
    const amountInPaisa = Math.round(amount * 100); // Convert to paisa, round to nearest integer

    const options = {
      amount: amountInPaisa,
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${userId}`, // More specific receipt
      payment_capture: paymentCapture,
    };

    let response;
    try {
      // Create order using the Razorpay SDK
      response = await razorpay.orders.create(options);
      console.log('Razorpay order created successfully:', response.id);
    } catch (razorpayCreateError: unknown) {
      const err = razorpayCreateError as CustomError;
      console.error(
        'Razorpay order creation failed:',
        err.message || 'Unknown error',
        'Status Code:', err.statusCode,
        'Details:', err.error
      );
      // Return specific error from Razorpay
      return NextResponse.json({
        error: 'Razorpay order creation failed',
        message: err.message || 'An unexpected error occurred during order creation.',
        details: err.error,
      }, { status: err.statusCode || 500 });
    }

    // Create a transaction record in Supabase
    // This is crucial for verification, so if it fails, the whole process should fail.
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        order_id: response.id,
        amount: amount, // Store in base unit (e.g., INR)
        status: 'pending', // Initial status
      });

    if (transactionError) {
      console.error('Error inserting transaction record into Supabase:', transactionError);
      // CRITICAL: If transaction record fails, the payment cannot be verified later.
      // You might want to attempt to cancel the Razorpay order here if possible,
      // or at least inform the client that they need to contact support.
      return NextResponse.json({
        error: 'Failed to record transaction in database.',
        message: transactionError.message,
      }, { status: 500 });
    }

    // Return the order details to the client
    return NextResponse.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
      // You might want to return `key_id` here for frontend integration if it's not hardcoded
      key_id: razorpayKeyId,
    });

  } catch (err: unknown) {
    // Catch any unexpected errors during request parsing or initial setup
    const error = err as Error;
    console.error('API Error during order creation:', error.message);
    return NextResponse.json(
      { error: 'Internal server error during order creation.', message: error.message },
      { status: 500 }
    );
  }
}