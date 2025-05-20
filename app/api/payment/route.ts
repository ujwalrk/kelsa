import { NextResponse, NextRequest } from 'next/server';
import Razorpay from 'razorpay';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Define an interface for the request body
interface PaymentRequestBody {
  amount: number;
  userId: string;
}

// Define the error type for Razorpay
interface RazorpayError extends Error {
  statusCode?: number;
  error?: {
    code?: string;
    description?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PaymentRequestBody;
    const { amount, userId } = body;
    
    // Initialize Supabase client for database operations
    const supabase = createRouteHandlerClient({ cookies });

    // Initialize Razorpay with your key_id and key_secret
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
    
    // Ensure we have the keys
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials are not configured');
    }

    // Create a payment capture to generate a payment link
    const paymentCapture = 1;
    const amountInPaisa = amount * 100; // Convert to paisa
    
    const options = {
      amount: amountInPaisa,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: paymentCapture,
    };
    
    // Create order using the Razorpay SDK
    const response = await razorpay.orders.create(options);
    
    // Create a transaction record in Supabase
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        order_id: response.id,
        amount: amount, // Store in base unit (e.g., INR), not paisa
        status: 'pending', // Initial status
      });

    if (transactionError) {
      console.error('Error inserting transaction record:', transactionError);
      // Depending on desired behavior, you might want to roll back the Razorpay order
      // For now, we log and proceed, but the verify step will likely fail if no transaction record exists.
    }

    // Return the order details to the client
    return NextResponse.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (err: unknown) {
    // Type guard to handle RazorpayError properties if available
    const razorpayError = err as RazorpayError;
    
    console.error(
      'Razorpay order creation error:',
      razorpayError.message || 'Unknown error',
      'Status Code:', razorpayError.statusCode,
      'Details:', razorpayError.error
    );
    
    return NextResponse.json({ 
      error: 'Razorpay order failed',
      message: razorpayError.message || 'Unknown error',
      details: razorpayError.error,
      statusCode: razorpayError.statusCode || 500
    }, { status: razorpayError.statusCode || 500 });
  }
}