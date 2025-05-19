import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';

// Interface for the request body
interface VerifyRequestBody {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  user_access_token?: string; // Add optional access token
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as VerifyRequestBody;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, user_access_token } = body;
    
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

    // Initialize Supabase client - prefer token if available, fallback to cookies
    let supabase;
    if (user_access_token) {
      // Use createClient and set the session if access token is provided
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            persistSession: false, // Do not persist session on the server
          },
        }
      );
      const { data: { session }, error: setSessionError } = await supabase.auth.setSession({
        access_token: user_access_token,
        refresh_token: '' // Refresh token is not needed for this context
      });

      if (setSessionError || !session) {
        console.error('Failed to set session with access token:', setSessionError);
        return NextResponse.json({
          success: false,
          message: 'Authentication failed with provided token'
        }, { status: 401 });
      }

    } else {
      // Fallback to cookie-based authentication if no token
      supabase = createRouteHandlerClient({ cookies });
    }
    
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
    
    console.log("User successfully verified and status updated:", user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully, user status updated'
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    // Add more specific error detail if available
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({
      success: false,
      message: `Server error during verification: ${errorMessage}`,
    }, { status: 500 });
  }
}