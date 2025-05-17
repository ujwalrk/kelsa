import { NextResponse, NextRequest } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Interface for the request body
interface VerifyRequestBody {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as VerifyRequestBody;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;
    
    // Get Razorpay key secret for verification
    const secret = process.env.RAZORPAY_KEY_SECRET || '';
    
    // Verify the payment signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    
    // Compare signatures to verify payment
    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({
        success: false,
        message: 'Payment verification failed'
      }, { status: 400 });
    }

    // Initialize Supabase client
    const supabase = createServerComponentClient({ cookies });
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    console.log("User in /api/payment/verify:", user);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not authenticated'
      }, { status: 401 });
    }
    
    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: 1, // This is your test amount
        status: 'success'
      });
    
    if (transactionError) {
      console.error('Transaction record error:', transactionError);
      // Still continue to update user to premium
    }
    
    // Update user metadata to include premium flag
    const { error: updateError } = await supabase.auth.updateUser({
      data: { premium: true }
    });
    
    if (updateError) {
      return NextResponse.json({
        success: false,
        message: 'Failed to update user status'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully'
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error during verification'
    }, { status: 500 });
  }
}